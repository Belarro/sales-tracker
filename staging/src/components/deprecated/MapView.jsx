// ============================================
// MAP VIEW COMPONENT
// ============================================
// Google Maps integration with food places

import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { CONFIG } from '../config.js';
import { getAllLocations } from '../utils/googleSheets.js';

const libraries = ['places'];

const MapView = ({ onLocationSelect, visitedLocations = [] }) => {
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [foodPlaces, setFoodPlaces] = useState([]);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: CONFIG.GOOGLE_MAPS_API_KEY,
    libraries
  });

  const mapContainerStyle = {
    width: '100%',
    height: '100%'
  };

  const defaultCenter = {
    lat: 40.7128,
    lng: -74.0060
  };

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(pos);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use default location if geolocation fails
          setUserLocation(defaultCenter);
        }
      );
    } else {
      setUserLocation(defaultCenter);
    }
  }, []);

  // Create some test markers around the user location
  useEffect(() => {
    if (userLocation) {
      // Create test food places manually (bypassing Places API for now)
      const testPlaces = [
        {
          place_id: 'test1',
          name: 'Test Restaurant 1',
          vicinity: 'Test Address 1',
          geometry: {
            location: {
              lat: userLocation.lat + 0.005,
              lng: userLocation.lng + 0.005
            }
          }
        },
        {
          place_id: 'test2',
          name: 'Test Cafe 2',
          vicinity: 'Test Address 2',
          geometry: {
            location: {
              lat: userLocation.lat - 0.005,
              lng: userLocation.lng + 0.005
            }
          }
        },
        {
          place_id: 'test3',
          name: 'Test Bakery 3',
          vicinity: 'Test Address 3',
          geometry: {
            location: {
              lat: userLocation.lat + 0.005,
              lng: userLocation.lng - 0.005
            }
          }
        }
      ];

      console.log('Setting test places:', testPlaces);
      setFoodPlaces(testPlaces);
    }
  }, [userLocation]);

  const onMapLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const handleMarkerClick = (place) => {
    console.log('Marker clicked!', place.name);

    // Immediately open the form panel with basic info (no Places API needed for testing)
    const locationData = {
      name: place.name,
      address: place.vicinity,
      phone: '',
      website: '',
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`,
      placeId: place.place_id
    };

    console.log('Opening form panel with:', locationData);
    onLocationSelect(locationData);
  };

  const isVisited = (place) => {
    return visitedLocations.some(
      loc => loc.locationName === place.name &&
             (loc.businessAddress === place.formatted_address || loc.businessAddress === place.vicinity)
    );
  };

  if (!isLoaded || !userLocation) {
    return <div className="loading">Loading map...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={userLocation}
      zoom={14}
      onLoad={onMapLoad}
      options={{
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        clickableIcons: false,
        disableDefaultUI: false
      }}
    >
      {/* User location marker */}
      <Marker
        position={userLocation}
        icon={{
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }}
        title="Your Location"
      />

      {/* Food place markers */}
      {foodPlaces.map((place) => (
        <Marker
          key={place.place_id}
          position={place.geometry.location}
          onClick={() => handleMarkerClick(place)}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: isVisited(place) ? '#34a853' : '#ea4335',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }}
          title={place.name}
        />
      ))}

    </GoogleMap>
  );
};

export default MapView;