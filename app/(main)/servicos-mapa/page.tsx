'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { AuthGuard } from '@/components/AuthGuard';
import toast from 'react-hot-toast';

export default function ServicosMapaPage() {
  const { data: session } = useSession();
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Obter localização do usuário
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        // Usar localização padrão (Brasília)
        setUserLocation({ lat: -15.7801, lng: -47.9292 });
      }
    );

    // Buscar serviços com localização
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services?withLocation=true');
        
        if (!response.ok) {
          throw new Error('Erro ao buscar serviços');
        }
        
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        toast.error('Não foi possível carregar os serviços');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServices();
  }, []);

  // Preparar marcadores para o mapa
  const mapMarkers = services.map(service => ({
    lng: service.longitude,
    lat: service.latitude,
    color: '#0ea5e9',
    label: '₹',
    popupContent: `
      <div class="p-2">
        <h3 class="font-medium">${service.title}</h3>
        <p class="text-sm">${service.value ? `R$ ${service.value.toFixed(2)}` : 'Aberto a propostas'}</p>
        <a href="/servicos/${service.id}" class="text-blue-600 text-sm">Ver detalhes</a>
      </div>
    `,
    id: service.id
  }));

  // Função para calcular distância entre dois pontos (fórmula de Haversine)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distância em km
    return distance;
  };

  // Ordenar serviços por distância se tivermos a localização do usuário
  const sortedServices = userLocation 
    ? [...services].sort((a, b) => {
        if (!a.latitude || !a.longitude) return 1;
        if (!b.latitude || !b.longitude) return -1;
        
        const distanceA = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          a.latitude,
          a.longitude
        );
        
        const distanceB = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          b.latitude,
          b.longitude
        );
        
        return distanceA - distanceB;
      })
    : services;

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-4 h-full">
        {/* Sidebar com serviços */}
        <div className="lg:col-span-1 bg-white p-4 overflow-y-auto border-r border-secondary-200">
          <h1 className="text-xl font-bold text-secondary-900 mb-4">Serviços no Mapa</h1>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <p>Carregando serviços...</p>
            </div>
          ) : sortedServices.length === 0 ? (
            <div className="bg-secondary-50 rounded-lg p-4 text-center">
              <p className="text-secondary-600">
                Nenhum serviço com localização encontrado.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedServices.map((service) => (
                <div 
                  key={service.id} 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedService?.id === service.id 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-secondary-200 hover:border-primary-300'
                  }`}
                  onClick={() => setSelectedService(service)}
                >
                  <h3 className="font-medium text-secondary-900">{service.title}</h3>
                  
                  {service.value ? (
                    <p className="text-primary-600 font-bold mt-1">
                      R$ {service.value.toFixed(2)}
                    </p>
                  ) : (
                    <p className="text-secondary-600 text-sm mt-1">
                      Aberto a propostas
                    </p>
                  )}
                  
                  <p className="text-secondary-600 text-sm mt-2 line-clamp-2">
                    {service.description}
                  </p>
                  
                  {userLocation && service.latitude && service.longitude && (
                    <p className="text-secondary-500 text-xs mt-2">
                      Distância: {calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        service.latitude,
                        service.longitude
                      ).toFixed(1)} km
                    </p>
                  )}
                  
                  <div className="mt-3">
                    <Link 
                      href={`/servicos/${service.id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Ver detalhes
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Mapa */}
        <div className="lg:col-span-3 relative">
          <MapComponent
            initialLocation={userLocation || { lng: -47.9292, lat: -15.7801 }}
            markers={mapMarkers}
            height="100%"
            interactive={true}
            zoom={12}
          />
          
          {isLoading && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white py-2 px-4 rounded-full shadow-md">
              <p className="text-secondary-600">Carregando serviços...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
