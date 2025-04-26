'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

type Service = {
  id: string;
  title: string;
  value?: number;
  description?: string;
  latitude?: number;
  longitude?: number;
};

type Props = {
  userLocation: { lat: number; lng: number };
  services: Service[];
  onMarkerClick: (svc: Service) => void;
};

export default function MapClient({ userLocation, services, onMarkerClick }: Props) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    try {
      mapRef.current = new mapboxgl.Map({
        container: container.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [userLocation.lng, userLocation.lat],
        zoom: 12,
      });

      mapRef.current.addControl(new mapboxgl.NavigationControl());

      // marcador do usuário
      new mapboxgl.Marker({ color: '#0ea5e9' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(new mapboxgl.Popup().setText('Você está aqui'))
        .addTo(mapRef.current);

      mapRef.current.on('load', () => {
        services.forEach(svc => {
          if (svc.latitude == null || svc.longitude == null) return;
          const el = document.createElement('div');
          el.className = 'service-marker';
          el.style.cssText = `
            width:24px;height:24px;
            border-radius:50%;
            background:#0ea5e9;
            display:flex;align-items:center;
            justify-content:center;
            color:#fff;font-size:12px;
            cursor:pointer;
          `;
          el.innerText = 'S';
          el.onclick = () => onMarkerClick(svc);

          new mapboxgl.Marker(el)
            .setLngLat([svc.longitude, svc.latitude])
            .addTo(mapRef.current!);
        });
      });
    } catch (err) {
      console.warn('Mapbox GL não pôde inicializar (WebGL):', err);
    }

    return () => {
      mapRef.current?.remove();
    };
  }, [userLocation, services, onMarkerClick]);

  return <div ref={container} className="h-full w-full" />;
}
