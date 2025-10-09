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
    let mounted = true;

    // Wait for Google Maps API to be ready
    const checkGoogleMapsLoaded = () => {
      if (!mounted) return;

      if (window.google && window.google.maps) {
        initMap();
      } else {
        // Retry after a short delay
        setTimeout(checkGoogleMapsLoaded, 100);
      }
    };

    checkGoogleMapsLoaded();

    return () => {
      mounted = false;
      // Clean up markers
      markersRef.current.forEach(marker => {
        if (marker.setMap) marker.setMap(null);
      });
      markersRef.current = [];

      // Clean up map instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
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
      fullscreenControl: true // POI labels (business names) now visible on map
    });

    mapInstanceRef.current = map;

    // Add click listener for Google Maps POI (Points of Interest) markers
    map.addListener('click', async (event) => {
      // Check if a POI was clicked
      if (event.placeId) {
        event.stop(); // Prevent default info window
        console.log('Google Maps POI clicked, Place ID:', event.placeId);

        try {
          // Use NEW Places API (not the legacy PlacesService)
          const { Place } = await window.google.maps.importLibrary("places");

          // Create a Place instance with the clicked place ID
          const place = new Place({
            id: event.placeId
          });

          // Fetch place details
          await place.fetchFields({
            fields: ['displayName', 'formattedAddress', 'nationalPhoneNumber', 'websiteURI', 'googleMapsURI']
          });

          console.log('✅ Google Maps POI details:', place);

          onLocationSelect({
            name: place.displayName || 'Unknown Place',
            address: place.formattedAddress || 'Address not available',
            phone: place.nationalPhoneNumber || '',
            website: place.websiteURI || '',
            googleMapsUrl: place.googleMapsURI || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.displayName)}`,
            placeId: event.placeId
          });
        } catch (error) {
          console.error('Places API error:', error);
        }
      }
    });

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

    console.log('✅ Map ready! Click any business on the map to add visit notes.');
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