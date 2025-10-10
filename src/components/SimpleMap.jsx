// ============================================
// SIMPLE MAP COMPONENT (Native Google Maps)
// ============================================
// Uses native Google Maps API instead of React wrapper

import { useEffect, useRef, useState } from 'react';
import { CONFIG } from '../config.js';
import { getLocationHistory } from '../utils/googleSheets.js';

const SimpleMap = ({ onLocationSelect, visitedLocations = [] }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const overlayMarkersRef = useRef([]);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Wait for Google Maps API to be ready
    const checkGoogleMapsLoaded = () => {
      if (!mounted) return;

      if (window.google && window.google.maps) {
        initMap();
      } else {
        // Listen for the custom event dispatched when Google Maps loads
        const handleMapsLoaded = () => {
          if (mounted) {
            initMap();
          }
        };

        window.addEventListener('google-maps-loaded', handleMapsLoaded, { once: true });

        // Fallback: check if already loaded (in case event fired before listener attached)
        setTimeout(() => {
          if (mounted && window.google && window.google.maps) {
            initMap();
          }
        }, 100);
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

  // Hint management - show on first visit
  useEffect(() => {
    const hasSeenHint = localStorage.getItem('salesTracker_hasSeenMapHint');
    if (!hasSeenHint) {
      // Show hint after map loads (2 second delay)
      setTimeout(() => {
        setShowHint(true);
      }, 2000);

      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        setShowHint(false);
        localStorage.setItem('salesTracker_hasSeenMapHint', 'true');
      }, 12000);
    }
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

  // Add custom markers for visited locations
  useEffect(() => {
    console.log('SimpleMap received visitedLocations:', visitedLocations);
    if (!mapInstanceRef.current || !window.google || visitedLocations.length === 0) {
      console.log('Skipping marker creation:', {
        hasMap: !!mapInstanceRef.current,
        hasGoogle: !!window.google,
        locationCount: visitedLocations.length
      });
      return;
    }

    // Clear existing overlay markers
    overlayMarkersRef.current.forEach(marker => {
      if (marker.setMap) marker.setMap(null);
    });
    overlayMarkersRef.current = [];

    // Group locations by place to count visits
    const locationVisits = {};
    visitedLocations.forEach(loc => {
      const key = `${loc.locationName}|${loc.businessAddress}`;
      if (!locationVisits[key]) {
        locationVisits[key] = {
          count: 0,
          location: loc,
          interestLevel: loc.interestLevel
        };
      }
      locationVisits[key].count++;
      // Use the most recent interest level
      locationVisits[key].interestLevel = loc.interestLevel;
    });

    // Create overlay markers for each visited location
    Object.values(locationVisits).forEach(async ({ count, location, interestLevel }) => {
      // Determine color based on interest level
      let color = '#9e9e9e'; // Gray - default/unvisited
      if (interestLevel === 'Not Interested') {
        color = '#f44336'; // Red
      } else if (interestLevel === 'Follow Up' || interestLevel === 'Pending') {
        color = '#ffc107'; // Yellow
      } else if (interestLevel === 'Interested' || interestLevel === 'Closed Deal') {
        color = '#4caf50'; // Green
      }

      // Extract Place ID or coordinates from DirectLink
      let placeId = null;
      if (location.directLink) {
        // Check if it's a Place ID directly (starts with ChIJ)
        if (location.directLink.startsWith('ChIJ')) {
          placeId = location.directLink;
        } else if (location.directLink.includes('place_id:')) {
          // Extract from URL like: ...?q=place_id:ChIJ...
          const match = location.directLink.match(/place_id[=:]([^&\s]+)/);
          if (match) placeId = match[1];
        } else if (location.directLink.includes('/@')) {
          // Extract coordinates from URL like: /@52.520,13.405,17z
          const match = location.directLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
          if (match) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);
            createCustomMarker(new window.google.maps.LatLng(lat, lng), color, count);
            return;
          }
        }
      }

      // Try to get coordinates from Place ID if available
      if (placeId) {
        try {
          const { Place } = await window.google.maps.importLibrary("places");
          const place = new Place({ id: placeId });
          await place.fetchFields({ fields: ['location'] });

          if (place.location) {
            createCustomMarker(place.location, color, count);
          }
        } catch (error) {
          console.error('Error fetching place location:', error);
          // Fallback to geocoding with address
          geocodeAndCreateMarker(location.businessAddress, color, count);
        }
      } else {
        // Fallback to geocoding with address
        geocodeAndCreateMarker(location.businessAddress, color, count);
      }
    });
  }, [visitedLocations]);

  const geocodeAndCreateMarker = (address, color, count) => {
    if (!window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        createCustomMarker(results[0].geometry.location, color, count);
      }
    });
  };

  const createCustomMarker = (position, color, count) => {
    if (!mapInstanceRef.current) return;

    // Create custom HTML marker
    const markerDiv = document.createElement('div');
    markerDiv.style.position = 'relative';
    markerDiv.style.width = '36px';
    markerDiv.style.height = '36px';
    markerDiv.style.cursor = 'pointer';

    // Circular background
    const circle = document.createElement('div');
    circle.style.width = '36px';
    circle.style.height = '36px';
    circle.style.borderRadius = '50%';
    circle.style.backgroundColor = color;
    circle.style.border = '3px solid white';
    circle.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    circle.style.display = 'flex';
    circle.style.alignItems = 'center';
    circle.style.justifyContent = 'center';
    circle.style.fontWeight = 'bold';
    circle.style.color = 'white';
    circle.style.fontSize = '14px';
    circle.textContent = count > 1 ? count : '';

    markerDiv.appendChild(circle);

    // Create overlay view
    class CustomOverlay extends window.google.maps.OverlayView {
      constructor(position, content) {
        super();
        this.position = position;
        this.content = content;
      }

      onAdd() {
        this.div = this.content;
        const panes = this.getPanes();
        panes.overlayMouseTarget.appendChild(this.div);
      }

      draw() {
        const projection = this.getProjection();
        const pos = projection.fromLatLngToDivPixel(this.position);
        if (pos) {
          this.div.style.left = (pos.x - 18) + 'px'; // Center the 36px marker
          this.div.style.top = (pos.y - 18) + 'px';
          this.div.style.position = 'absolute';
        }
      }

      onRemove() {
        if (this.div && this.div.parentNode) {
          this.div.parentNode.removeChild(this.div);
        }
      }
    }

    const overlay = new CustomOverlay(position, markerDiv);
    overlay.setMap(mapInstanceRef.current);
    overlayMarkersRef.current.push(overlay);
  };

  const dismissHint = () => {
    setShowHint(false);
    localStorage.setItem('salesTracker_hasSeenMapHint', 'true');
  };

  const zoomToUserLocation = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          mapInstanceRef.current.setCenter(userLocation);
          mapInstanceRef.current.setZoom(15);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please check your browser permissions.');
        }
      );
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div
          ref={mapRef}
          style={{
            width: '100%',
            height: '100%'
          }}
        />

        {showHint && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1a73e8',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 1000,
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '90%',
            animation: 'fadeIn 0.3s ease'
          }}>
            <span>👆 Tap any business on the map to add visit notes</span>
            <button
              onClick={dismissHint}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              Got it
            </button>
          </div>
        )}

        <button
          onClick={zoomToUserLocation}
          style={{
            position: 'absolute',
            bottom: window.innerWidth < 768 ? '80px' : '120px',
            right: window.innerWidth < 768 ? '16px' : '20px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#1a73e8',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            zIndex: 100,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
          }}
          title="Zoom to my location"
          aria-label="Zoom to my location"
        >
          📍
        </button>
      </div>
    </>
  );
};

export default SimpleMap;