'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AuthGuard } from '@/components/AuthGuard';
import MapComponent from '@/components/MapComponent';
import toast from 'react-hot-toast';

type Location = {
  lat: number;
  lng: number;
  address?: string;
};

interface LocationSelectorProps {
  onLocationSelect?: (location: Location) => void;
  initialLocation?: Location | null;
  label?: string;
  description?: string;
}

export default function LocationSelectorComponent({
  onLocationSelect,
  initialLocation = null,
  label = "Selecione a localização do serviço",
  description = "Clique no mapa ou busque um endereço para definir a localização do serviço"
}: LocationSelectorProps) {
  const { data: session } = useSession();
  const [location, setLocation] = useState(initialLocation);
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation);
      setAddress(initialLocation.address || '');
    }
  }, [initialLocation]);

  interface HandleLocationSelectParams extends Location {}

  const handleLocationSelect = (newLocation: HandleLocationSelectParams): void => {
    setLocation(newLocation);
    setAddress(newLocation.address || '');

    if (onLocationSelect) {
      onLocationSelect(newLocation);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-secondary-900">{label}</h3>
        <p className="text-sm text-secondary-600">{description}</p>
      </div>
      
      <div className="h-[400px] w-full rounded-lg overflow-hidden">
        <MapComponent
          initialLocation={location || { lng: -47.9292, lat: -15.7801 }}
          onLocationSelect={handleLocationSelect}
          height="400px"
          interactive={true}
          zoom={12}
        />
      </div>
      
      {location && (
        <div className="bg-secondary-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-secondary-900">Localização selecionada:</p>
          <p className="text-sm text-secondary-600 mt-1">{address}</p>
          <div className="flex gap-2 mt-2 text-xs text-secondary-500">
            <span>Latitude: {location.lat.toFixed(6)}</span>
            <span>Longitude: {location.lng.toFixed(6)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
