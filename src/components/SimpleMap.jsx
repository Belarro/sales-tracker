// ============================================
// SIMPLE MAP COMPONENT (Native Google Maps)
// ============================================
// Uses native Google Maps API instead of React wrapper

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CONFIG } from '../config.js';
import { getLocationHistory, addProspect } from '../utils/googleSheets.js';

const SimpleMap = ({ onLocationSelect, visitedLocations = [], prospects = [], onProspectAdded, onQuickAdd, searchQuery = '' }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const overlayMarkersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const customMarkerClickedRef = useRef(false);
  const [showHint, setShowHint] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // ── Search overlay state ──
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mgSet, setMgSet] = useState(new Set()); // indices of results marked "uses microgreens"
  const searchDebounceRef = useRef(null);
  const searchInputRef = useRef(null);

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
      // Skip if a custom marker was just clicked (prevents double-fire)
      // Use a longer window to account for mobile touch delays
      if (customMarkerClickedRef.current) {
        customMarkerClickedRef.current = false;
        if (event.placeId) event.stop();
        return;
      }
      // Check if a POI was clicked
      if (event.placeId) {
        event.stop(); // Prevent default info window

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

      
          // Check if this place already exists in visited locations (use saved data if so)
          const placeName = place.displayName || '';
          const placeAddr = place.formattedAddress || '';
          const existingLocation = visitedLocations.find(loc =>
            (loc.placeId && loc.placeId === event.placeId) ||
            (loc.locationName && loc.locationName === placeName) ||
            (loc.businessAddress && loc.businessAddress === placeAddr)
          );

          if (existingLocation) {
            // Open with saved data (contact info, notes, pipeline stage, etc.)
            onLocationSelect({
              ...existingLocation,
              name: existingLocation.locationName,
              address: existingLocation.businessAddress
            });
          } else {
            onLocationSelect({
              locationName: placeName || 'Unknown Place',
              businessAddress: placeAddr || 'Address not available',
              businessPhone: place.nationalPhoneNumber || '',
              businessWebsite: place.websiteURI || '',
              directLink: place.googleMapsURI || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}`,
              placeId: event.placeId,
              lat: place.location && typeof place.location.lat === 'function' ? place.location.lat() : null,
              lng: place.location && typeof place.location.lng === 'function' ? place.location.lng() : null,
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
        } catch (error) {
          console.error('Places API error:', error);
        }
      }
    });

    // Add blue user location marker
    // Add blue user location marker using OverlayView (to avoid deprecated Marker)
    createUserLocationMarker(center, map);


    // Set map ready state to trigger marker creation
    setMapReady(true);
  };

  // Add custom markers for visited locations
  useEffect(() => {

    if (!mapReady || !mapInstanceRef.current || !window.google) {
      // Map not fully initialized yet, retry will happen when dependencies change
      return;
    }

    if (visitedLocations.length === 0) {
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
          createCustomMarker(new window.google.maps.LatLng(lat, lng), color, count, location);
          return;
        }

        // Priority 2: Extract coordinates from URL like /@52.520,13.405,17z
        if (location.directLink.includes('/@')) {
          const match = location.directLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
          if (match) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);
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

  // Prospect markers (blue) — separate overlay layer
  const prospectOverlaysRef = useRef([]);
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.google) return;

    // Clear old prospect markers
    prospectOverlaysRef.current.forEach(m => { if (m.setMap) m.setMap(null); });
    prospectOverlaysRef.current = [];

    prospects.forEach(prospect => {
      if (!prospect.locationName) return;
      const color = '#2196F3'; // blue for all prospects
      if (prospect.lat && prospect.lng) {
        createCustomMarker(
          new window.google.maps.LatLng(prospect.lat, prospect.lng),
          color, 0, prospect, prospectOverlaysRef
        );
      } else if (prospect.businessAddress) {
        geocodeAndCreateMarker(prospect.businessAddress, color, 0, prospect, prospectOverlaysRef);
      }
    });
  }, [prospects, mapReady]);

  const geocodeAndCreateMarker = (address, color, count, locationData, overlaysRef = null) => {
    if (!window.google) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        createCustomMarker(results[0].geometry.location, color, count, locationData, overlaysRef);
      }
    });
  };

  const createCustomMarker = (position, color, count, locationData, overlaysRef = null) => {
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

    // Red badge for prospects that already use microgreens
    if (locationData?.usesMicrogreens) {
      const badge = document.createElement('div');
      badge.style.position = 'absolute';
      badge.style.top = '-3px';
      badge.style.right = '-3px';
      badge.style.width = '13px';
      badge.style.height = '13px';
      badge.style.borderRadius = '50%';
      badge.style.backgroundColor = '#e53935';
      badge.style.border = '2px solid white';
      badge.style.zIndex = '2';
      markerDiv.appendChild(badge);
    }

    // Click handler — open location details
    if (locationData) {
      markerDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        customMarkerClickedRef.current = true;
        setTimeout(() => { customMarkerClickedRef.current = false; }, 1000);
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
    (overlaysRef || overlayMarkersRef).current.push(overlay);
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

  // ── Search handlers ──
  const openSearch = () => {
    setShowSearch(true);
    setSearchText('');
    setSearchResults([]);
    setTimeout(() => searchInputRef.current?.focus(), 80);
  };

  const closeSearch = () => {
    setShowSearch(false);
    setSearchText('');
    setSearchResults([]);
    setMgSet(new Set());
    clearTimeout(searchDebounceRef.current);
  };

  const handleSearchInput = (val) => {
    setSearchText(val);
    clearTimeout(searchDebounceRef.current);
    if (!val.trim()) { setSearchResults([]); return; }
    searchDebounceRef.current = setTimeout(() => runSearch(val), 400);
  };

  const runSearch = async (query) => {
    if (!window.google || !query.trim()) return;
    setIsSearching(true);
    try {
      const { Place } = await window.google.maps.importLibrary('places');
      const center = mapInstanceRef.current?.getCenter();
      const request = {
        textQuery: query,
        fields: ['displayName', 'formattedAddress', 'nationalPhoneNumber', 'websiteURI', 'googleMapsURI', 'location', 'id'],
        maxResultCount: 8,
      };
      if (center) {
        request.locationBias = { center: { lat: center.lat(), lng: center.lng() }, radius: 5000 };
      }
      const { places } = await Place.searchByText(request);
      setSearchResults(places || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (place) => {
    const loc = {
      locationName: place.displayName || 'Unknown Place',
      businessAddress: place.formattedAddress || '',
      businessPhone: place.nationalPhoneNumber || '',
      businessWebsite: place.websiteURI || '',
      directLink: place.googleMapsURI || '',
      placeId: place.id || '',
      lat: place.location?.lat?.() || null,
      lng: place.location?.lng?.() || null,
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
      archived: 'NO',
    };
    // Pan map to result
    if (loc.lat && loc.lng && mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat: loc.lat, lng: loc.lng });
      mapInstanceRef.current.setZoom(17);
    }
    closeSearch();
    onLocationSelect(loc);
  };

  // Already-visited lookup for "saved" badge
  const visitedNames = new Set(visitedLocations.map(l => l.locationName?.toLowerCase().trim()));

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
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
          📍 <span style={{ color: '#1a73e8' }}>{visitedLocations.length}</span> visited
          {prospects.length > 0 && <> · <span style={{ color: '#2196F3' }}>{prospects.length}</span> to visit</>}
        </div>

        {/* Search Button */}
        <button
          onClick={openSearch}
          className="map-search-trigger-btn"
          title="Search restaurants"
          aria-label="Search restaurants"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        {/* Full-Screen Search Overlay — rendered via portal to escape layout constraints */}
        {showSearch && createPortal(
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'var(--color-bg-main, #fff)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideDown 0.18s ease-out',
          }}>
            {/* Search topbar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: 'var(--color-bg-main, #fff)',
              borderBottom: '1px solid var(--color-border, #e5e7eb)',
              flexShrink: 0,
            }}>
              <button
                onClick={closeSearch}
                style={{
                  width: '38px', height: '38px',
                  border: 'none', background: 'none', cursor: 'pointer',
                  color: 'var(--color-text-secondary, #6b7280)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '10px', flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
                background: 'var(--color-bg-secondary, #f3f4f6)',
                border: '1.5px solid var(--color-border, #e5e7eb)',
                borderRadius: '12px', padding: '0 12px', height: '44px',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--color-text-muted, #9ca3af)', flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search restaurants, cafes..."
                  value={searchText}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  style={{
                    flex: 1, border: 'none', background: 'none',
                    fontSize: '16px', color: 'var(--color-text-main, #111)',
                    outline: 'none', fontFamily: 'inherit',
                  }}
                />
                {searchText && (
                  <button onClick={() => handleSearchInput('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted, #9ca3af)', padding: '2px', display: 'flex' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Results */}
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '24px' }}>
              {!searchText && (
                <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-muted, #9ca3af)', fontSize: '14px', lineHeight: '1.6' }}>
                  Search for a restaurant, cafe, or business to add a visit
                </div>
              )}
              {isSearching && (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted, #9ca3af)', fontSize: '14px' }}>
                  Searching...
                </div>
              )}
              {!isSearching && searchText && searchResults.length === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted, #9ca3af)', fontSize: '14px' }}>
                  No results found
                </div>
              )}
              {searchResults.map((place, i) => {
                const isSaved = visitedNames.has((place.displayName || '').toLowerCase().trim());
                const isMg = mgSet.has(i);
                return (
                  <div
                    key={place.id || i}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      width: '100%', padding: '13px 20px',
                      borderBottom: '1px solid var(--color-border-light, #f3f4f6)',
                      background: 'none',
                    }}
                  >
                  <button
                    onClick={() => handleSelectSearchResult(place)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      flex: 1, border: 'none',
                      background: 'none', textAlign: 'left', cursor: 'pointer',
                      fontFamily: 'inherit', padding: 0, minWidth: 0,
                    }}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: 'var(--color-bg-secondary, #f3f4f6)',
                      border: '1px solid var(--color-border, #e5e7eb)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, color: 'var(--color-text-muted, #9ca3af)',
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-text-main, #111)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {place.displayName}
                        </span>
                        {isSaved && (
                          <span style={{ fontSize: '10px', fontWeight: '700', background: '#dcfce7', color: '#16a34a', padding: '1px 6px', borderRadius: '999px', flexShrink: 0 }}>
                            SAVED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted, #9ca3af)', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {place.formattedAddress}
                      </div>
                    </div>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const btn = e.currentTarget;
                        btn.disabled = true;
                        btn.style.background = '#bbdefb';
                        const lat = place.location?.lat?.() ?? null;
                        const lng = place.location?.lng?.() ?? null;
                        const ok = await addProspect(
                          place.displayName || '',
                          place.formattedAddress || '',
                          '',
                          lat,
                          lng,
                          mgSet.has(i)
                        );
                        if (ok) {
                          btn.style.background = '#dcfce7';
                          btn.style.borderColor = '#16a34a';
                          btn.style.color = '#16a34a';
                          await onProspectAdded?.();
                          setTimeout(() => closeSearch(), 600);
                        } else {
                          btn.disabled = false;
                          btn.style.background = '#fee2e2';
                          btn.style.borderColor = '#ef4444';
                        }
                      }}
                      title="Save to Visit later"
                      style={{
                        flexShrink: 0, width: '36px', height: '36px',
                        border: '1.5px solid #2196F3', borderRadius: '10px',
                        background: '#e3f2fd', color: '#2196F3',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                      </svg>
                    </button>
                  </button>
                  {/* Microgreens toggle */}
                  <button
                    onClick={() => setMgSet(prev => {
                      const next = new Set(prev);
                      next.has(i) ? next.delete(i) : next.add(i);
                      return next;
                    })}
                    title="Already uses microgreens"
                    style={{
                      flexShrink: 0, width: '36px', height: '36px',
                      border: `1.5px solid ${isMg ? '#16a34a' : '#d1d5db'}`,
                      borderRadius: '10px',
                      background: isMg ? '#dcfce7' : 'var(--color-bg-secondary, #f3f4f6)',
                      color: isMg ? '#16a34a' : '#9ca3af',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all 0.15s', fontSize: '16px',
                    }}
                  >
                    🌿
                  </button>
                  </div>
                );
              })}
            </div>
          </div>,
          document.body
        )}
      </div>
    </>
  );
};

export default SimpleMap;