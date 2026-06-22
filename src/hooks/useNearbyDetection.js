// ============================================
// GPS NEARBY DETECTION
// ============================================
// On mount, gets user GPS position and searches for the nearest
// restaurant/cafe/bar within DETECTION_RADIUS meters.
// Fires onNearbyPlace(placeData) if a match is found.
// Re-checks every WATCH_INTERVAL ms while the user is active.

import { useEffect, useRef, useCallback } from 'react';

const DETECTION_RADIUS = 80;   // meters — close enough to mean "I'm here"
const WATCH_INTERVAL   = 60000; // re-check every 60 seconds
const MIN_MOVE_METERS  = 30;    // ignore position updates smaller than this

// Haversine distance in meters between two {lat,lng} points
function distanceMeters(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sin2 = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(sin2), Math.sqrt(1 - sin2));
}

export const useNearbyDetection = ({ onNearbyPlace, enabled = true }) => {
  const lastPositionRef   = useRef(null);
  const lastPlaceIdRef    = useRef(null);  // avoid re-firing for same place
  const timerRef          = useRef(null);
  const runningRef        = useRef(false);

  const detect = useCallback(async (position) => {
    if (runningRef.current) return;
    runningRef.current = true;

    const current = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };

    // Skip if we haven't moved meaningfully
    if (lastPositionRef.current) {
      const moved = distanceMeters(lastPositionRef.current, current);
      if (moved < MIN_MOVE_METERS) {
        runningRef.current = false;
        return;
      }
    }
    lastPositionRef.current = current;

    try {
      if (!window.google?.maps) { runningRef.current = false; return; }

      const { Place } = await window.google.maps.importLibrary('places');

      const { places } = await Place.searchByText({
        textQuery: 'restaurant OR cafe OR bar OR bistro',
        fields: ['id', 'displayName', 'formattedAddress', 'nationalPhoneNumber',
                 'websiteURI', 'googleMapsURI', 'location'],
        locationBias: { center: current, radius: DETECTION_RADIUS },
        maxResultCount: 1
      });

      if (!places?.length) { runningRef.current = false; return; }

      const place = places[0];
      const placeId = place.id;

      // Don't fire again for the same place until user moves away
      if (placeId === lastPlaceIdRef.current) { runningRef.current = false; return; }
      lastPlaceIdRef.current = placeId;

      onNearbyPlace({
        locationName:    place.displayName        || '',
        businessAddress: place.formattedAddress   || '',
        businessPhone:   place.nationalPhoneNumber || '',
        businessWebsite: place.websiteURI         || '',
        directLink:      place.googleMapsURI      || '',
        lat:             place.location?.lat()    ?? current.lat,
        lng:             place.location?.lng()    ?? current.lng,
        // blank fields for the rep to fill in
        contactPerson:  '',
        contactTitle:   '',
        directPhone:    '',
        directEmail:    '',
        businessEmail:  '',
        businessTypes:  '',
        visitNotes:     '',
        interestLevel:  '',
        followUpDate:   '',
        sampleGiven:    'NO',
        archived:       ''
      });
    } catch (err) {
      // Silent — GPS detection is opportunistic
      console.warn('Nearby detection error:', err.message);
    } finally {
      runningRef.current = false;
    }
  }, [onNearbyPlace]);

  const runDetection = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      detect,
      (err) => console.warn('GPS error:', err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 }
    );
  }, [detect]);

  useEffect(() => {
    if (!enabled) return;

    // Run immediately on mount
    runDetection();

    // Then re-check on interval while app is open
    timerRef.current = setInterval(runDetection, WATCH_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled, runDetection]);

  // Expose manual trigger (e.g. pull-to-refresh)
  return { detectNow: runDetection };
};
