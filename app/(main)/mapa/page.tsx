'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Link from 'next/link'; // Import Link

type Service = {
  id: string;
  title: string;
  price?: number | null; 
  description?: string; 
  latitude?: number | null; 
  longitude?: number | null;
  address?: string | null; 
  photoUrl?: string | null; 
  professionName?: string | null;
  date?: string | null; // Added date
};

const MapClient = dynamic(() => import('./MapClient'), { ssr: false });
const StaticMap = dynamic(() => import('./StaticMap'), { ssr: false });

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export default function MapaPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [useGL, setUseGL] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(true); 

  const [professions, setProfessions] = useState<{ id: string; name: string }[]>([]);
  const [filters, setFilters] = useState({
    radius: '10', // Default radius in km
    professionId: '',
    minPrice: '',
    maxPrice: '',
  });

  // 1) localização
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation({ lat: -15.78, lng: -47.93 })
    );
  }, []);

  // 2) detecta WebGL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUseGL(hasWebGL());
    }
  }, []);

  // 2) detecta WebGL (no change)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUseGL(hasWebGL());
    }
  }, []);

  // Fetch professions
  useEffect(() => {
    const fetchProfessions = async () => {
      try {
        const response = await fetch('/api/professions');
        if (!response.ok) throw new Error('Failed to fetch professions');
        const data = await response.json();
        setProfessions(data);
      } catch (error) {
        console.error("Error fetching professions:", error);
      }
    };
    fetchProfessions();
  }, []);

  // 3) carrega serviços (now depends on userLocation and filters)
  useEffect(() => {
    if (!userLocation) return;
    
    setIsLoadingServices(true); 
    
    let apiUrl = `/api/services/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${filters.radius || '10'}`;
    if (filters.professionId) {
      apiUrl += `&professionId=${filters.professionId}`;
    }
    if (filters.minPrice) {
      apiUrl += `&minPrice=${filters.minPrice}`;
    }
    if (filters.maxPrice) {
      apiUrl += `&maxPrice=${filters.maxPrice}`;
    }
    
    fetch(apiUrl)
      .then(res => {
        if (!res.ok) {
          return res.json().then(errData => {
            throw new Error(errData.error || `Failed to fetch nearby services: ${res.status}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        setServices(data as Service[]);
      })
      .catch(err => {
        console.error("Error fetching nearby services:", err);
        setServices([]); 
      })
      .finally(() => {
        setIsLoadingServices(false); 
      });
  }, [userLocation, filters]); // Add filters to dependency array

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  if (!userLocation) {
    return <p className="text-center mt-10">Obtendo sua localização…</p>;
  }

  return (
    // Add a parent div or fragment to hold filters + map/cards section
    <div className="h-full flex flex-col"> 
      <div className="p-4 bg-gray-50 border-b">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Filtrar Serviços no Mapa</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="radius" className="block text-sm font-medium text-gray-700">Raio (km)</label>
            <input type="number" name="radius" id="radius" value={filters.radius} onChange={handleFilterChange} className="input-field mt-1 w-full" placeholder="Ex: 10" />
          </div>
          <div>
            <label htmlFor="professionId" className="block text-sm font-medium text-gray-700">Profissão</label>
            <select name="professionId" id="professionId" value={filters.professionId} onChange={handleFilterChange} className="input-field mt-1 w-full">
              <option value="">Todas</option>
              {professions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700">Preço Mín.</label>
            <input type="number" name="minPrice" id="minPrice" value={filters.minPrice} onChange={handleFilterChange} className="input-field mt-1 w-full" placeholder="Ex: 50" step="0.01"/>
          </div>
          <div>
            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700">Preço Máx.</label>
            <input type="number" name="maxPrice" id="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} className="input-field mt-1 w-full" placeholder="Ex: 300" step="0.01"/>
          </div>
          {/* An apply button could be added here if auto-triggering useEffect is not desired
          <button onClick={() => { / * explicitly trigger fetch * / }} className="btn-primary mt-1 w-full md:col-span-4 lg:col-span-1">Aplicar Filtros</button> 
          */}
        </div>
      </div>

      <div className="flex flex-col flex-grow overflow-hidden"> {/* Adjusted: flex-grow and overflow-hidden for this container */}
        <div className="h-3/5 md:h-2/3 relative"> {/* Map container */}
          {useGL ? (
            <MapClient
            userLocation={userLocation}
            services={services}
            // onMarkerClick prop removed
          />
        ) : (
          <StaticMap userLocation={userLocation} services={services} />
        )}
      </div>
      <div className="flex-grow overflow-y-auto p-2 md:p-4 bg-gray-100"> {/* Cards container */}
        {isLoadingServices && services.length === 0 && <p className="text-center text-gray-500 py-4">Carregando serviços...</p>}
        {!isLoadingServices && services.length === 0 && <p className="text-center text-gray-500 py-4">Nenhum serviço encontrado nas proximidades.</p>}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {services.map(service => (
            <Link href={`/servicos/${service.id}`} key={service.id} legacyBehavior>
              <a className="block bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow overflow-hidden">
                <div className="h-32 sm:h-40 bg-gray-200 flex items-center justify-center">
                  {service.photoUrl ? (
                    <img src={service.photoUrl} alt={service.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image.png'; }} />
                  ) : (
                    <img src="/placeholder-image.png" alt="Serviço sem imagem" className="w-full h-full object-cover opacity-50" />
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-md font-semibold text-gray-800 truncate" title={service.title}>{service.title}</h3>
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    {service.price != null ? `R$ ${service.price.toFixed(2)}` : 'A combinar'}
                  </p>
                  {/* 
                  <p className="text-xs text-gray-500 truncate mt-1">{service.professionName || ''}</p>
                  <p className="text-xs text-gray-500 truncate">{service.address || ''}</p>
                  */}
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
