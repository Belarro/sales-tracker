// ============================================
// SIMPLE MAP COMPONENT (Native Google Maps)
// ============================================
// Uses native Google Maps API instead of React wrapper

import { useEffect, useRef } from 'react';
import { CONFIG } from '../config.js';

const SimpleMap = ({ onLocationSelect }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${CONFIG.GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      initMap();
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const initMap = () => {
    if (!mapRef.current || !window.google) return;

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          createMap(userLocation);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Use default location (Berlin)
          const defaultLocation = { lat: 52.520008, lng: 13.404954 };
          createMap(defaultLocation);
        }
      );
    } else {
      const defaultLocation = { lat: 52.520008, lng: 13.404954 };
      createMap(defaultLocation);
    }
  };

  const createMap = (center) => {
    const map = new window.google.maps.Map(mapRef.current, {
      center: center,
      zoom: 14,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true
    });

    mapInstanceRef.current = map;

    // Add blue user location marker
    new window.google.maps.Marker({
      position: center,
      map: map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      },
      title: 'Your Location'
    });

    // Create 3 test markers
    const testPlaces = [
      {
        id: 'test1',
        name: 'Test Restaurant 1',
        address: 'Test Address 1',
        position: {
          lat: center.lat + 0.005,
          lng: center.lng + 0.005
        }
      },
      {
        id: 'test2',
        name: 'Test Cafe 2',
        address: 'Test Address 2',
        position: {
          lat: center.lat - 0.005,
          lng: center.lng + 0.005
        }
      },
      {
        id: 'test3',
        name: 'Test Bakery 3',
        address: 'Test Address 3',
        position: {
          lat: center.lat + 0.005,
          lng: center.lng - 0.005
        }
      }
    ];

    testPlaces.forEach(place => {
      const marker = new window.google.maps.Marker({
        position: place.position,
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#ea4335',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        },
        title: place.name
      });

      marker.addListener('click', () => {
        console.log('Marker clicked:', place.name);
        onLocationSelect({
          name: place.name,
          address: place.address,
          phone: '',
          website: '',
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`,
          placeId: place.id
        });
      });

      markersRef.current.push(marker);
    });

    console.log('Created', testPlaces.length, 'test markers');
  };

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  );
};

export default SimpleMap;