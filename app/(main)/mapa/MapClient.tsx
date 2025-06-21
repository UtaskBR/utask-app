'use client';

import { useEffect, useRef, useCallback } from 'react'; // Added useCallback
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
  onMapViewChange: (bounds: mapboxgl.LngLatBounds) => void; // Added new prop
};

export default function MapClient({ userLocation, services, onMapViewChange }: Props) { // Added onMapViewChange
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null); // For debouncing map view changes

  const debouncedUpdateBounds = useCallback((map: mapboxgl.Map) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      const newBounds = map.getBounds();
      console.log('MapClient: Debounced move/zoom ended. New bounds:', newBounds);
      onMapViewChange(newBounds);
    }, 800); // 800ms debounce, adjust as needed
  }, [onMapViewChange]);

  useEffect(() => {
    console.log('MapClient: useEffect triggered. UserLocation:', userLocation, 'Services count:', services.length);

    if (!userLocation || typeof userLocation.lat !== 'number' || typeof userLocation.lng !== 'number') {
      console.error('MapClient: userLocation is invalid or not yet available for map init.', userLocation);
      if (container.current) {
        // Display error message only if not already displaying a different map-related error
        if (!container.current.innerHTML.includes('Map container not properly sized')) {
             container.current.innerHTML = '<p style="color: red; text-align: center; padding-top: 20px;">Localização do usuário inválida para carregar o mapa.</p>';
        }
      }
      return;
    }

    // Clear any previous user location error message if location becomes valid
    if (container.current && container.current.firstChild?.nodeName === 'P' && container.current.firstChild.textContent?.includes('Localização do usuário inválida')) {
       container.current.innerHTML = '';
    }

    const timerId = setTimeout(() => {
      if (!container.current) {
        console.log('MapClient: setTimeout - Container became null, exiting.');
        return;
      }
      console.log('MapClient: setTimeout - Initializing map. Container offsetWidth:', container.current.offsetWidth, 'offsetHeight:', container.current.offsetHeight);

      if (container.current.offsetHeight < 50) { // Example threshold for minimum height
         console.error('MapClient: setTimeout - Container height is still too small:', container.current.offsetHeight, 'Skipping map initialization.');
         // Display error message only if not already displaying a user location error
         if (!container.current.innerHTML.includes('Localização do usuário inválida')) {
            container.current.innerHTML = '<p style="color: orange; text-align: center; padding-top: 20px;">Map container not properly sized.</p>';
         }
         return;
      }
      // Clear any previous container size error if it's now okay
      if (container.current.firstChild?.nodeName === 'P' && container.current.firstChild.textContent?.includes('Map container not properly sized')) {
        container.current.innerHTML = '';
      }


      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
      try {
        mapRef.current = new mapboxgl.Map({
          container: container.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [userLocation.lng, userLocation.lat], // Use actual userLocation
          zoom: 12,                                   // Restore original zoom
        });
        console.log('MapClient: setTimeout - Map initialized successfully.');

        mapRef.current.addControl(new mapboxgl.NavigationControl());

        console.log('MapClient: setTimeout - Adding user marker at', [userLocation.lng, userLocation.lat]);
        new mapboxgl.Marker({ color: '#0ea5e9' })
          .setLngLat([userLocation.lng, userLocation.lat])
          .setPopup(new mapboxgl.Popup().setText('Você está aqui'))
          .addTo(mapRef.current);

        mapRef.current.on('load', () => {
            console.log('MapClient: map fully loaded (style, sources etc.)');

            // Initial bounds reporting after map is loaded and user marker potentially added
            const initialBounds = mapRef.current!.getBounds(); // mapRef.current is guaranteed here
            console.log('MapClient: Map fully loaded. Initial bounds:', initialBounds);
            onMapViewChange(initialBounds); // Pass initial bounds up

            // Listen for map movements
            mapRef.current!.on('moveend', () => debouncedUpdateBounds(mapRef.current!));
            mapRef.current!.on('zoomend', () => debouncedUpdateBounds(mapRef.current!));

            if (services.length > 0) {
                console.log('MapClient: setTimeout - Attempting to add service markers. Count:', services.length);
                services.forEach(svc => {
                    if (svc.latitude == null || svc.longitude == null) return;
                    console.log('MapClient: setTimeout - Adding service marker for', svc.title, 'at', [svc.longitude, svc.latitude]);
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
                        .setPopup(popup)
                        .addTo(mapRef.current!);
                });
            }
        });

      } catch (err) {
        console.error('MapClient: setTimeout - MAPBOX INITIALIZATION FAILED:', err);
         if (container.current) { // Display error in container
            container.current.innerHTML = '<p style="color: fuchsia; text-align: center; padding-top: 20px;">Falha ao inicializar o mapa.</p>';
         }
      }
    }, 100); // 100ms delay

    return () => {
      clearTimeout(timerId); // Existing timeout for map init delay
      if (debounceTimeoutRef.current) { // New: Clear debounce timeout
        clearTimeout(debounceTimeoutRef.current);
      }
      mapRef.current?.remove();
      console.log('MapClient: useEffect cleanup - map removed, timeouts cleared.');
    };
  }, [userLocation, services, onMapViewChange, debouncedUpdateBounds]); // Added onMapViewChange and debouncedUpdateBounds to dependencies

  return <div ref={container} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />;
}
