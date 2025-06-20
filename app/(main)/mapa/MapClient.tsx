'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

type Service = {
  id: string;
  title: string;
  price?: number | null; // Changed from value
  description?: string; 
  latitude?: number | null;
  longitude?: number | null;
  // Other fields like photoUrl, address, professionName can be added if needed for popup directly
  // but for now, link to details page is the primary goal.
};

type Props = {
  userLocation: { lat: number; lng: number };
  services: Service[];
  // onMarkerClick: (svc: Service) => void; // Removed
};

export default function MapClient({ userLocation, services }: Props) { // Removed onMarkerClick from params
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
          // el.onclick = () => onMarkerClick(svc); // Removed

          const formattedPrice = svc.price != null ? `R$ ${svc.price.toFixed(2)}` : 'A combinar';
          const popupHTML = `
            <div style="font-family: Arial, sans-serif; font-size: 14px; min-width: 150px;">
              <h3 style="font-size: 16px; margin: 0 0 5px 0; font-weight: bold; color: #333;">${svc.title}</h3>
              <p style="margin: 0 0 8px 0; color: #555;">Preço: ${formattedPrice}</p>
              <a href="/servicos/${svc.id}" target="_blank" rel="noopener noreferrer" style="background-color: #007bff; color: white; padding: 5px 10px; text-decoration: none; border-radius: 4px; font-size: 12px; display: inline-block;">Ver Detalhes</a>
            </div>
          `;

          const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(popupHTML);

          new mapboxgl.Marker(el)
            .setLngLat([svc.longitude, svc.latitude])
            .setPopup(popup) // Set the popup on the marker
            .addTo(mapRef.current!);
        });
      });
    } catch (err) {
      console.warn('Mapbox GL não pôde inicializar (WebGL):', err);
    }

    return () => {
      mapRef.current?.remove();
    };
  }, [userLocation, services]); // Removed onMarkerClick from dependency array

  return <div ref={container} className="h-full w-full" />;
}
