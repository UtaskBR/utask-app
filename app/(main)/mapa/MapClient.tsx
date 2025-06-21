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

export default function MapClient({ userLocation, services, onMapViewChange }: Props) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const serviceMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedUpdateBounds = useCallback((map: mapboxgl.Map) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      if (map.isStyleLoaded() && map.getCanvas()) { // Ensure map is still valid
          const newBounds = map.getBounds();
          console.log('MapClient: Debounced move/zoom. New bounds:', newBounds);
          onMapViewChange(newBounds);
      } else {
          console.log('MapClient: Debounced move/zoom - map style or canvas not ready.');
      }
    }, 800); // 800ms debounce
  }, [onMapViewChange]);

  // Effect 1: Map Initialization and Core Event Listeners/Cleanup
  useEffect(() => {
    console.log('MapClient: Main Map Effect triggered. UserLocation for init:', userLocation);
    if (!userLocation || typeof userLocation.lat !== 'number' || typeof userLocation.lng !== 'number') {
      console.error('MapClient: UserLocation is invalid for map initialization.', userLocation);
      if (container.current) {
        container.current.innerHTML = '<p style="color: red; text-align: center; padding-top: 20px;">Localização do usuário inválida.</p>';
      }
      return;
    }
    if (container.current && container.current.firstChild?.nodeName === 'P' && container.current.firstChild.textContent?.includes('Localização do usuário inválida')) {
       container.current.innerHTML = ''; // Clear error message
    }

    if (mapRef.current) { // Map already initialized
      console.log('MapClient: Map already initialized, not re-initializing.');
      return;
    }
    
    if (!container.current) {
      console.error('MapClient: Container ref is null. Cannot initialize map.');
      return;
    }

    if (container.current.offsetHeight < 50) { // Example threshold
       console.error('MapClient: Container height too small for map init:', container.current.offsetHeight);
       if (!container.current.innerHTML.includes('Localização do usuário inválida')) {
            container.current.innerHTML = '<p style="color: orange; text-align: center; padding-top: 20px;">Map container not properly sized.</p>';
       }
       return; 
    }
     if (container.current.firstChild?.nodeName === 'P' && container.current.firstChild.textContent?.includes('Map container not properly sized')) {
        container.current.innerHTML = '';
     }

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
    let map: mapboxgl.Map | null = null; // Temporary map variable for setup
    try {
      map = new mapboxgl.Map({
        container: container.current!,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [userLocation.lng, userLocation.lat],
        zoom: 12,
      });
      mapRef.current = map;
      console.log('MapClient: Map initialized successfully.');

      map.addControl(new mapboxgl.NavigationControl());

      map.on('load', () => {
        console.log('MapClient: Map "load" event fired.');
        if (map && map.isStyleLoaded() && map.getCanvas()){
          const initialBounds = map.getBounds();
          console.log('MapClient: Reporting initial bounds:', initialBounds);
          onMapViewChange(initialBounds); 
        }
      });

      map.on('moveend', () => debouncedUpdateBounds(map!)); // map should be valid here
      map.on('zoomend', () => debouncedUpdateBounds(map!)); // map should be valid here

    } catch (err) {
      console.error('MapClient: MAPBOX INITIALIZATION FAILED:', err);
      if (container.current) {
        container.current.innerHTML = '<p style="color: fuchsia; text-align: center; padding-top: 20px;">Falha ao inicializar o mapa.</p>';
      }
    }

    return () => {
      console.log('MapClient: Main Map Effect cleanup - Removing map.');
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (map) { // Use the local map variable for cleanup
        try {
          if (map.isStyleLoaded() && map.getCanvas()) {
              map.remove();
          } else {
              console.warn("MapClient cleanup: Map not loaded or canvas gone, skipping remove().");
          }
        } catch (removeError) {
          console.error("MapClient: Error during map.remove() in cleanup:", removeError);
        }
      }
      mapRef.current = null; // Ensure mapRef is cleared
    };
  }, [userLocation, onMapViewChange, debouncedUpdateBounds]);


  // Effect 2: User Marker Management
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded() || !userLocation || typeof userLocation.lat !== 'number' || typeof userLocation.lng !== 'number') {
      if (userMarkerRef.current) {
          userMarkerRef.current.remove();
          userMarkerRef.current = null;
          console.log('MapClient: User marker removed due to invalid location or map not ready.');
      }
      return;
    }
    console.log('MapClient: User Marker Effect. Location:', userLocation);
    
    if (userMarkerRef.current) { // Remove old if exists
      userMarkerRef.current.remove();
    }
    
    userMarkerRef.current = new mapboxgl.Marker({ color: '#0ea5e9' })
      .setLngLat([userLocation.lng, userLocation.lat])
      .setPopup(new mapboxgl.Popup().setText('Você está aqui'))
      .addTo(mapRef.current);
    console.log('MapClient: User marker updated/added at', [userLocation.lng, userLocation.lat]);
  }, [userLocation]); // Depends on userLocation and map instance (implicitly via mapRef.current check)

  // Effect 3: Service Markers Management
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) {
      // Clear markers if map becomes unavailable
      serviceMarkersRef.current.forEach(marker => marker.remove());
      serviceMarkersRef.current = [];
      return;
    }
    console.log('MapClient: Service Marker Effect. Services count:', services.length);

    // Clear existing service markers
    serviceMarkersRef.current.forEach(marker => marker.remove());
    serviceMarkersRef.current = [];

    if (services.length > 0) {
      console.log('MapClient: Adding service markers. Count:', services.length);
      services.forEach(svc => {
        if (svc.latitude == null || svc.longitude == null) return;

        const el = document.createElement('div');
        el.className = 'service-marker';
        el.style.cssText = `
          width:24px;height:24px;
          border-radius:50%;
          background:#FF5733; /* Different color for service markers */
          display:flex;align-items:center;
          justify-content:center;
          color:#fff;font-size:12px;
          cursor:pointer;
          border: 1px solid #fff;
        `;
        el.innerText = 'S'; // Or profession initial, etc.

        const formattedPrice = svc.price != null ? `R$ ${svc.price.toFixed(2)}` : 'A combinar';
        const popupHTML = `
          <div style="font-family: Arial, sans-serif; font-size: 14px; min-width: 150px;">
            <h3 style="font-size: 16px; margin: 0 0 5px 0; font-weight: bold; color: #333;">${svc.title}</h3>
            <p style="margin: 0 0 8px 0; color: #555;">Preço: ${formattedPrice}</p>
            <a href="/servicos/${svc.id}" target="_blank" rel="noopener noreferrer" style="background-color: #007bff; color: white; padding: 5px 10px; text-decoration: none; border-radius: 4px; font-size: 12px; display: inline-block;">Ver Detalhes</a>
          </div>
        `;
        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(popupHTML);
        
        const newMarker = new mapboxgl.Marker(el)
          .setLngLat([svc.longitude, svc.latitude])
          .setPopup(popup)
          .addTo(mapRef.current!);
        serviceMarkersRef.current.push(newMarker);
        // console.log('MapClient: Added service marker for', svc.title); // Can be too verbose
      });
    }
  }, [services]); // Depends on services and map instance (implicitly via mapRef.current check)

  return <div ref={container} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />;
}
