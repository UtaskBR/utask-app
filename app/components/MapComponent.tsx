'use client';
import { useRef, useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import 'mapbox-gl/dist/mapbox-gl.css';

// Definir token do Mapbox
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.MAPBOX_TOKEN;

// Definir interfaces para tipagem
interface Location {
  lng: number;
  lat: number;
  address?: string;
}

interface Marker {
  lng: number | undefined;
  lat: number | undefined;
  color?: string;
  label?: string;
  popupContent?: string;
  id?: string;
}

interface MapComponentProps {
  initialLocation?: Location;
  markers?: Marker[];
  onLocationSelect?: (location: Location) => void;
  height?: string;
  interactive?: boolean;
  zoom?: number;
}

export default function MapComponent({
  initialLocation = { lng: -47.9292, lat: -15.7801 }, // Brasília como padrão
  markers = [],
  onLocationSelect,
  height = '400px',
  interactive = true,
  zoom = 12
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location>(initialLocation);

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [initialLocation.lng, initialLocation.lat],
      zoom: zoom,
      interactive: interactive
    });

    // Adicionar controles de navegação
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Adicionar geocoder para busca de endereços
    if (interactive) {
      // Corrigir o erro de tipagem usando type assertion
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken || '',
        mapboxgl: mapboxgl as any, // Usar type assertion para evitar erro de tipagem
        placeholder: 'Buscar endereço',
        language: 'pt-BR',
        countries: 'br'
      });

      map.current.addControl(geocoder, 'top-left');

      // Evento quando um resultado é selecionado no geocoder
      geocoder.on('result', (e: { result: { center: [number, number]; place_name: string } }) => {
        const { center, place_name } = e.result;
        const newLocation: Location = { lng: center[0], lat: center[1], address: place_name };
        setSelectedLocation(newLocation);
        
        if (onLocationSelect) {
          onLocationSelect(newLocation);
        }
      });
    }

    // Evento de clique no mapa para selecionar localização
    if (interactive && onLocationSelect) {
      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        
        // Fazer geocodificação reversa para obter o endereço
        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&language=pt-BR`)
          .then(response => response.json())
          .then(data => {
            const address = data.features[0]?.place_name || '';
            const newLocation = { lng, lat, address };
            setSelectedLocation(newLocation);
            onLocationSelect(newLocation);
          });
      });
    }

    // Evento quando o mapa termina de carregar
    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initialLocation, interactive, onLocationSelect, zoom]);

  // Atualizar marcadores quando o mapa estiver carregado ou os marcadores mudarem
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Remover marcadores existentes
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Adicionar marcador para a localização selecionada
    if (selectedLocation) {
      new mapboxgl.Marker({ color: '#0ea5e9' })
        .setLngLat([selectedLocation.lng, selectedLocation.lat])
        .addTo(map.current!);
    }

    // Adicionar marcadores adicionais
    markers.forEach(marker => {
      if (!marker.lng || !marker.lat) return;

      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = marker.color || '#f59e0b';
      el.style.display = 'flex';
      el.style.justifyContent = 'center';
      el.style.alignItems = 'center';
      el.style.color = 'white';
      el.style.fontWeight = 'bold';
      el.style.cursor = 'pointer';
      el.innerText = marker.label || '';

      const markerElement = new mapboxgl.Marker(el)
        .setLngLat([marker.lng, marker.lat])
        .addTo(map.current!);

      // Adicionar popup se houver conteúdo
      if (marker.popupContent) {
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(marker.popupContent);
        
        markerElement.setPopup(popup);
      }
    });
  }, [mapLoaded, markers, selectedLocation]);

  return (
    <div ref={mapContainer} style={{ width: '100%', height }} className="rounded-lg overflow-hidden" />
  );
}
