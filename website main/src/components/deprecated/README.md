# Deprecated Components

This directory contains components that are no longer used in the application but are kept for historical reference.

---

## MapView.jsx

**Status:** ⚠️ Deprecated - No longer used
**Deprecated On:** 2025-10-09
**Replaced By:** `SimpleMap.jsx` (parent directory)

### Why Deprecated

MapView.jsx was the original test implementation using:
- `@react-google-maps/api` React wrapper
- Hardcoded test markers
- Legacy `Marker` API

It was replaced by SimpleMap.jsx which uses:
- Native Google Maps JavaScript API (no wrapper)
- POI (Points of Interest) click detection
- NEW Google Places API
- Automatic business data from Google

### Documentation

For information about the current map implementation, see:
- `../../docs/technical/GOOGLE_MAPS_POI_INTEGRATION.md`
- `../../docs/technical/MAP_COMPONENTS_ARCHITECTURE.md`

### Historical Context

This component was useful during development for:
1. Testing the location panel UI
2. Prototyping marker interactions
3. Understanding React Google Maps integration

### Should This Be Deleted?

**No, keep for now:**
- Historical reference
- Documents development evolution
- May be useful for comparing approaches

**When to delete:**
- After several months of stable production use
- When no one references this code anymore
- When storage space is critical

---

**Last Updated:** 2025-10-09
