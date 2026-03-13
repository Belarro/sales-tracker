// ============================================
// SIMPLE MAP COMPONENT (Native Google Maps)
// ============================================
// Uses native Google Maps API instead of React wrapper

import { useEffect, useRef, useState } from 'react';
import { CONFIG } from '../config.js';
import { getLocationHistory } from '../utils/googleSheets.js';

const SimpleMap = ({ onLocationSelect, visitedLocations = [], onQuickAdd, searchQuery = '' }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const overlayMarkersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const [showHint, setShowHint] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    let mounted = true;
    setMapReady(false); // Reset state on mount/hot-reload to ensure clean init

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
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    } else {
      const defaultLocation = { lat: 52.520008, lng: 13.404954 };
      createMap(defaultLocation);
    }
  };

  const createMap = (center) => {
    // Store user location for Quick Add feature
    setUserLocation(center);

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
            fields: ['displayName', 'formattedAddress', 'nationalPhoneNumber', 'websiteURI', 'googleMapsURI', 'location']
          });

          console.log('✅ Google Maps POI details:', place);

          onLocationSelect({
            locationName: place.displayName || 'Unknown Place',
            businessAddress: place.formattedAddress || 'Address not available',
            businessPhone: place.nationalPhoneNumber || '',
            businessWebsite: place.websiteURI || '',
            directLink: place.googleMapsURI || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.displayName)}`,
            placeId: event.placeId,
            lat: place.location && typeof place.location.lat === 'function' ? place.location.lat() : null,
            lng: place.location && typeof place.location.lng === 'function' ? place.location.lng() : null,
            // Add other fields expected by LocationPanel/Schema
            businessEmail: '',
            businessTypes: '',
            contactPerson: '',
            contactTitle: '',
            directPhone: '',
            directEmail: '',
            visitNotes: '',
            interestLevel: '',
            followUpDate: '',
            sampleGiven: 'NO',
            archived: 'NO'
          });
        } catch (error) {
          console.error('Places API error:', error);
        }
      }
    });

    // Add blue user location marker
    // Add blue user location marker using OverlayView (to avoid deprecated Marker)
    createUserLocationMarker(center, map);

    console.log('✅ Map ready! Click any business on the map to add visit notes.');

    // Set map ready state to trigger marker creation
    setMapReady(true);
  };

  // Add custom markers for visited locations
  useEffect(() => {
    console.log('🗺️ SimpleMap received visitedLocations:', visitedLocations);
    console.log('📊 Number of locations to display:', visitedLocations.length);
    console.log('🗺️ Map ready state:', mapReady);

    if (!mapReady || !mapInstanceRef.current || !window.google) {
      // Map not fully initialized yet, retry will happen when dependencies change
      return;
    }

    if (visitedLocations.length === 0) {
      return;
    }

    console.log('✅ Creating markers for', visitedLocations.length, 'locations');

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
      // console.log(`🔵 Processing location: ${location.locationName}`);

      // Determine color based on interest level
      let color = '#9e9e9e'; // Gray - default/unvisited
      if (interestLevel === 'Not Interested') {
        color = '#f44336'; // Red
      } else if (interestLevel === 'Follow Up' || interestLevel === 'Pending') {
        color = '#ffc107'; // Yellow
      } else if (interestLevel === 'Interested' || interestLevel === 'Closed Deal') {
        color = '#4caf50'; // Green
      }

      // Extract coordinates or Place ID from DirectLink
      if (location.directLink) {
        // Priority 1: Check for our custom format "LAT,LNG|PLACE_ID"
        if (location.directLink.match(/^-?\d+\.\d+,-?\d+\.\d+/)) {
          const parts = location.directLink.split('|');
          const [lat, lng] = parts[0].split(',').map(parseFloat);
          console.log(`✅ Using saved coordinates for ${location.locationName}: ${lat}, ${lng}`);
          createCustomMarker(new window.google.maps.LatLng(lat, lng), color, count, location);
          return;
        }

        // Priority 2: Extract coordinates from URL like /@52.520,13.405,17z
        if (location.directLink.includes('/@')) {
          const match = location.directLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
          if (match) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);
            console.log(`✅ Using URL coordinates for ${location.locationName}: ${lat}, ${lng}`);
            createCustomMarker(new window.google.maps.LatLng(lat, lng), color, count, location);
            return;
          }
        }

        // Priority 3: Try Place ID
        let placeId = null;
        if (location.directLink.startsWith('ChIJ')) {
          placeId = location.directLink;
        } else if (location.directLink.includes('place_id:')) {
          const match = location.directLink.match(/place_id[=:]([^&\s]+)/);
          if (match) placeId = match[1];
        }

        if (placeId) {
          try {
            const { Place } = await window.google.maps.importLibrary("places");
            const place = new Place({ id: placeId });
            await place.fetchFields({ fields: ['location'] });

            if (place.location) {
              console.log(`✅ Using Place ID coordinates for ${location.locationName}`);
              createCustomMarker(place.location, color, count, location);
              return;
            }
          } catch (error) {
            console.error('Error fetching place location:', error);
          }
        }
      }

      // Last resort: Geocode the address
      geocodeAndCreateMarker(location.businessAddress, color, count, location);
    });
  }, [visitedLocations, mapReady]);

  const geocodeAndCreateMarker = (address, color, count, locationData) => {
    if (!window.google) {
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        createCustomMarker(results[0].geometry.location, color, count, locationData);
      } else {
        console.warn(`   ❌ Geocoding failed for "${address}": ${status}`);
      }
    });
  };

  const createCustomMarker = (position, color, count, locationData) => {
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

    // Click handler — open location details
    if (locationData) {
      markerDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        onLocationSelect({
          ...locationData,
          name: locationData.locationName,
          address: locationData.businessAddress
        });
      });
    }

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

  const createUserLocationMarker = (positionInput, map) => {
    const position = positionInput instanceof window.google.maps.LatLng
      ? positionInput
      : new window.google.maps.LatLng(positionInput.lat, positionInput.lng);
    const markerDiv = document.createElement('div');
    markerDiv.style.position = 'absolute';
    markerDiv.style.width = '20px';
    markerDiv.style.height = '20px';
    markerDiv.style.backgroundColor = '#4285F4';
    markerDiv.style.borderRadius = '50%';
    markerDiv.style.border = '3px solid white';
    markerDiv.style.boxShadow = '0 0 10px rgba(66, 133, 244, 0.5)';
    markerDiv.style.zIndex = '999'; // On top of other markers

    // Pulse effect
    const pulse = document.createElement('div');
    pulse.style.position = 'absolute';
    pulse.style.top = '50%';
    pulse.style.left = '50%';
    pulse.style.transform = 'translate(-50%, -50%)';
    pulse.style.width = '100%';
    pulse.style.height = '100%';
    pulse.style.borderRadius = '50%';
    pulse.style.backgroundColor = 'rgba(66, 133, 244, 0.4)';
    pulse.style.animation = 'pulse 2s infinite';

    // Add keyframes for pulse to document if not exists
    if (!document.getElementById('map-animations')) {
      const style = document.createElement('style');
      style.id = 'map-animations';
      style.textContent = `
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          70% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    markerDiv.appendChild(pulse);

    class UserLocationOverlay extends window.google.maps.OverlayView {
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
          // Centered
          this.div.style.left = (pos.x - 10) + 'px';
          this.div.style.top = (pos.y - 10) + 'px';
        }
      }

      onRemove() {
        if (this.div && this.div.parentNode) {
          this.div.parentNode.removeChild(this.div);
        }
      }
    }

    const overlay = new UserLocationOverlay(position, markerDiv);
    overlay.setMap(map);
    userMarkerRef.current = overlay;
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
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newLocation);
          mapInstanceRef.current.setCenter(newLocation);
          mapInstanceRef.current.setZoom(15);
          // Update the blue user location marker
          if (userMarkerRef.current) {
            userMarkerRef.current.position = new window.google.maps.LatLng(newLocation.lat, newLocation.lng);
            userMarkerRef.current.draw();
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please check your browser permissions.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  // Quick Add - find nearby places at current location
  const handleQuickAdd = async () => {
    if (!mapInstanceRef.current || !userLocation) {
      alert('Map not ready. Please wait and try again.');
      return;
    }

    setIsLocating(true);

    try {
      // Get fresh location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(currentLocation);
          mapInstanceRef.current.setCenter(currentLocation);
          mapInstanceRef.current.setZoom(17);

          // Search for nearby restaurants/businesses
          const { Place } = await window.google.maps.importLibrary("places");

          const request = {
            textQuery: 'restaurant OR cafe OR bar',
            fields: ['displayName', 'formattedAddress', 'nationalPhoneNumber', 'websiteURI', 'googleMapsURI', 'location'],
            locationBias: {
              center: currentLocation,
              radius: 50 // 50 meters
            },
            maxResultCount: 5
          };

          const { places } = await Place.searchByText(request);

          if (places && places.length > 0) {
            // Show the closest place
            const nearestPlace = places[0];
            onLocationSelect({
              locationName: nearestPlace.displayName || 'Unknown Place',
              businessAddress: nearestPlace.formattedAddress || 'Address not available',
              businessPhone: nearestPlace.nationalPhoneNumber || '',
              businessWebsite: nearestPlace.websiteURI || '',
              directLink: nearestPlace.googleMapsURI || '',
              lat: nearestPlace.location?.lat() || currentLocation.lat,
              lng: nearestPlace.location?.lng() || currentLocation.lng,
              // Defaults
              businessEmail: '',
              businessTypes: '',
              contactPerson: '',
              contactTitle: '',
              directPhone: '',
              directEmail: '',
              visitNotes: '',
              interestLevel: '',
              followUpDate: '',
              sampleGiven: 'NO',
              archived: 'NO'
            });
          } else {
            // No nearby places found, create a generic entry
            onLocationSelect({
              locationName: 'New Location',
              businessAddress: `Lat: ${currentLocation.lat.toFixed(6)}, Lng: ${currentLocation.lng.toFixed(6)}`,
              businessPhone: '',
              businessWebsite: '',
              lat: currentLocation.lat,
              lng: currentLocation.lng,
              directLink: '',
              // Defaults
              businessEmail: '',
              businessTypes: '',
              contactPerson: '',
              contactTitle: '',
              directPhone: '',
              directEmail: '',
              visitNotes: '',
              interestLevel: '',
              followUpDate: '',
              sampleGiven: 'NO',
              archived: 'NO'
            });
          }

          setIsLocating(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please check your browser permissions.');
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } catch (error) {
      console.error('Quick Add error:', error);
      setIsLocating(false);
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

        {/* Quick Add Button */}
        <button
          onClick={handleQuickAdd}
          disabled={isLocating}
          className="map-quick-add-btn"
          title="Quick add - Find nearest restaurant"
          aria-label="Quick add nearby location"
        >
          {isLocating ? '...' : '+'}
        </button>

        {/* My Location Button */}
        <button
          onClick={zoomToUserLocation}
          className="map-location-btn"
          title="Zoom to my location"
          aria-label="Zoom to my location"
        >
          📍
        </button>

        {/* Location Counter */}
        <div className="map-counter">
          📍 Visited: <span style={{ color: '#1a73e8' }}>{visitedLocations.length}</span> location{visitedLocations.length !== 1 ? 's' : ''}
        </div>
      </div>
    </>
  );
};

export default SimpleMap;