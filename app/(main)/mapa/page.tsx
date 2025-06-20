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
    // Original comment: Add a parent div or fragment to hold filters + map/cards section
    <div className="h-full flex flex-col"> {/* This was the problematic line 135 */}
      <div className="p-4 bg-gray-50 border-b"> {/* This was original line 136 */}
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Filtrar Serviços no Mapa</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          {/* Placeholder for filter inputs */}
          <div>Filter 1 Placeholder</div>
          <div>Filter 2 Placeholder</div>
          <div>Filter 3 Placeholder</div>
          <div>Filter 4 Placeholder</div>
        </div>
      </div>

      {/* Placeholder for the rest of the content (map and services list) */}
      <div style={{ padding: '20px', textAlign: 'center', flexGrow: 1, backgroundColor: '#f0f0f0' }}>
        <h1>Map and Services Area</h1>
        <p>This area will eventually hold the map and service cards.</p>
        <p>The MapClient and StaticMap components are still effectively commented out (not included here).</p>
      </div>
    </div>
  );
}
