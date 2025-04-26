'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

type Service = {
  id: string;
  title: string;
  value?: number;
  description?: string;
  latitude?: number;
  longitude?: number;
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

  // 3) carrega serviços
  useEffect(() => {
    if (!userLocation) return;
    fetch('/api/services')
      .then(res => res.json())
      .then((data: Service[]) => setServices(data))
      .catch(console.error);
  }, [userLocation]);

  if (!userLocation) {
    return <p className="text-center mt-10">Obtendo sua localização…</p>;
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      {useGL ? (
        <MapClient
          userLocation={userLocation}
          services={services}
          onMarkerClick={svc => alert(`Serviço: ${svc.title}`)}
        />
      ) : (
        <StaticMap userLocation={userLocation} services={services} />
      )}
    </div>
  );
}
