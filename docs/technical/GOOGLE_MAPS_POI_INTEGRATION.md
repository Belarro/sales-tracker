# Google Maps POI (Points of Interest) Integration

**Last Updated:** 2025-10-09
**Component:** `src/components/SimpleMap.jsx`
**Status:** ✅ Active Implementation

---

## Overview

The Sales Tracker app uses **native Google Maps POI click detection** to allow users to select businesses directly from the map without manually searching or creating custom markers. This approach leverages Google's existing business data and provides a seamless user experience.

---

## How It Works

### User Experience Flow

1. **User opens the app** → Map loads centered on their current location
2. **User sees business markers** → Google Maps displays POI (Points of Interest) labels for nearby businesses
3. **User clicks a business marker** → Our app intercepts the click event
4. **App fetches business details** → Uses the NEW Places API to get business information
5. **Visit form opens** → Pre-filled with business name, address, phone, website

### Technical Flow

```javascript
// 1. Map listens for clicks
map.addListener('click', async (event) => {
  // 2. Check if a POI (business) was clicked
  if (event.placeId) {
    event.stop(); // Prevent default Google info window

    // 3. Use NEW Places API to fetch details
    const { Place } = await window.google.maps.importLibrary("places");
    const place = new Place({ id: event.placeId });

    // 4. Fetch specific fields we need
    await place.fetchFields({
      fields: ['displayName', 'formattedAddress', 'nationalPhoneNumber', 'websiteURI', 'googleMapsURI']
    });

    // 5. Pass data to visit form
    onLocationSelect({
      name: place.displayName,
      address: place.formattedAddress,
      phone: place.nationalPhoneNumber,
      website: place.websiteURI,
      googleMapsUrl: place.googleMapsURI,
      placeId: event.placeId
    });
  }
});
```

---

## Key Implementation Details

### Using the NEW Places API

**Important:** This implementation uses Google's **NEW Places API** (launched 2024), not the legacy `PlacesService`.

**Why the NEW API?**
- Modern async/await syntax
- More efficient field-based fetching
- Better performance and caching
- Future-proof (legacy API will be deprecated)

**Code Example:**
```javascript
// ✅ NEW Places API (what we use)
const { Place } = await google.maps.importLibrary("places");
const place = new Place({ id: placeId });
await place.fetchFields({ fields: ['displayName', 'formattedAddress'] });

// ❌ OLD PlacesService (deprecated, not used)
const service = new google.maps.places.PlacesService(map);
service.getDetails({ placeId: placeId }, callback);
```

### POI Click Detection

**How POI clicks work:**
- Google Maps automatically displays business markers (POI) on the map
- When user clicks a POI, the click event includes a `placeId`
- We intercept this event using `map.addListener('click', ...)`
- If `event.placeId` exists, we know a business was clicked
- We call `event.stop()` to prevent Google's default info window

**Code Reference:** `src/components/SimpleMap.jsx:86-120`

### Fields Fetched

We fetch only the fields we need to minimize API costs:

| Field | Purpose | Example Value |
|-------|---------|---------------|
| `displayName` | Business name | "Joe's Pizza" |
| `formattedAddress` | Full address | "123 Main St, Berlin, Germany" |
| `nationalPhoneNumber` | Phone number | "+49 30 12345678" |
| `websiteURI` | Website URL | "https://joespizza.com" |
| `googleMapsURI` | Google Maps link | "https://maps.google.com/?cid=..." |

**Why field-based fetching?**
- **Cost optimization:** Only pay for fields we actually use
- **Performance:** Faster responses with less data
- **Flexibility:** Easy to add/remove fields as needed

---

## Advantages vs Other Approaches

### ✅ POI-Based Approach (Current Implementation)

**Pros:**
- Uses Google's existing business database (millions of businesses)
- No manual marker management required
- Businesses automatically updated by Google
- Rich metadata (phone, website, hours, reviews)
- Works worldwide with consistent data
- Free to display POIs (only pay for Places API details fetching)

**Cons:**
- Requires Places API quota (but we optimize by fetching minimal fields)
- User must click existing businesses (can't add custom locations easily)

### ❌ Custom Marker Approach (Old MapView.jsx Implementation)

**Pros:**
- Full control over marker placement
- Can add custom/unlisted locations
- No Places API calls needed

**Cons:**
- Manual marker creation required
- No automatic business updates
- Missing rich business metadata
- Requires maintaining business database
- Limited to manually added locations

### ❌ OpenStreetMap Approach (Previous Attempt)

**Pros:**
- Open-source and free
- Community-maintained data

**Cons:**
- Less comprehensive business data than Google
- Inconsistent data quality
- Requires separate API/service
- No integration with Google's ecosystem
- Missing phone/website data for many businesses

---

## Migration History

### Evolution of Map Components

**Phase 1: MapView.jsx (Old Implementation)**
- Used `@react-google-maps/api` React wrapper
- Hardcoded test markers
- Used deprecated `Marker` API
- File: `src/components/MapView.jsx`
- **Status:** Deprecated, not currently used in App.jsx

**Phase 2: OpenStreetMap Experiment**
- Attempted to use OpenStreetMap API for business data
- Encountered limitations with data quality
- Documented in `PLACES_API_FIX.md`
- **Status:** Abandoned

**Phase 3: SimpleMap.jsx with POI Detection (Current)**
- Native Google Maps API (no React wrapper)
- POI click detection
- NEW Places API for business details
- File: `src/components/SimpleMap.jsx`
- **Status:** ✅ Active, production-ready

---

## API Requirements

### Required APIs

Ensure these are enabled in Google Cloud Console:

1. **Maps JavaScript API**
   - For displaying the map
   - Used: `new google.maps.Map()`

2. **Places API (NEW)**
   - For fetching business details
   - Used: `google.maps.importLibrary("places")`

3. **Geocoding API** (optional)
   - For address lookups
   - Not currently used but recommended

### API Keys Configuration

**File:** `src/config.js`

```javascript
GOOGLE_MAPS_API_KEY: 'your-api-key-here'
```

**Security Note:** In production, use environment variables instead of hardcoded keys. See `ROADMAP.md` Phase 4.

---

## Cost Optimization

### Current Approach

**What we do to minimize costs:**
1. **Field-based fetching:** Only request necessary fields (5 fields instead of all ~50)
2. **No nearby search:** Rely on Google's free POI display instead of Places API nearby search
3. **Click-based only:** Only fetch details when user actually clicks a business
4. **Caching:** Google Maps API caches POI data automatically

### Cost Breakdown

| Action | API Called | Cost per Request |
|--------|-----------|------------------|
| Display map with POIs | Maps JavaScript API | Free (included in base) |
| Click on POI marker | Places API (NEW) - fetchFields | ~$0.017 per request (5 fields) |

**Example monthly cost:**
- 100 users × 10 clicks/day × 30 days = 30,000 requests
- 30,000 × $0.017 = **~$510/month**

**Ways to reduce further:**
1. Cache fetched place details in browser localStorage
2. Implement request throttling
3. Use Place Details cache (Google provides 24-hour cache)

---

## Browser Compatibility

### Geolocation

The app uses browser geolocation to center the map:

```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    // Center map on user location
  },
  (error) => {
    // Fallback to Berlin, Germany
    const defaultLocation = { lat: 52.520008, lng: 13.404954 };
  }
);
```

**Supported browsers:**
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (requires HTTPS or localhost)
- Mobile browsers: ✅ Full support (user must grant location permission)

**Fallback:** If geolocation fails or is denied, map centers on Berlin, Germany.

---

## Future Enhancements

### Planned Features (from ROADMAP.md)

1. **Visited location markers** (Phase 1)
   - Show color-coded markers for previously visited businesses
   - Green = visited, Red = not visited

2. **Filter by business type** (Phase 2)
   - Allow filtering POIs by cuisine type
   - Uses Places API types field

3. **Nearby search** (Phase 3)
   - Programmatically search for businesses
   - Filter by rating, price level, etc.

4. **Offline POI cache** (Phase 4)
   - Cache frequently visited areas
   - Reduce API calls for repeat visits

### Migration to AdvancedMarkerElement

**Timeline:** 12+ months before deprecation

**Current status:** Using standard `Marker` for user location (line 123)

**Future migration:**
```javascript
// ✅ Current (deprecated but works)
new google.maps.Marker({ position, map, icon });

// 🔮 Future (recommended)
const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
new AdvancedMarkerElement({ position, map, content });
```

**Note:** POI markers are managed by Google Maps and don't require migration.

---

## Testing

### Manual Testing Checklist

**Basic functionality:**
- [ ] Map loads and centers on user location (or Berlin fallback)
- [ ] Blue user location marker appears
- [ ] Business markers (POIs) are visible on the map
- [ ] Clicking a business marker opens the visit form
- [ ] Business name, address pre-filled correctly
- [ ] Phone and website populated (if available)

**Error handling:**
- [ ] Test with location permission denied → Map uses Berlin fallback
- [ ] Test with no internet → Error handling works
- [ ] Test clicking non-business area → No form opens (expected)
- [ ] Test clicking multiple POIs rapidly → Forms update correctly

**Console verification:**
- [ ] No "origin is not allowed" errors
- [ ] "✅ Google Maps POI details:" log appears on click
- [ ] "✅ Map ready!" message displays on load

---

## Troubleshooting

### POI markers not appearing

**Possible causes:**
1. Zoom level too far out (must be zoom 14+)
2. Maps JavaScript API not enabled
3. API key restrictions blocking localhost

**Fix:**
- Check zoom level in `src/components/SimpleMap.jsx:76` (should be 14+)
- Verify Maps JavaScript API enabled in Google Cloud Console
- Check API key restrictions allow localhost:3000

### "google.maps.importLibrary is not a function"

**Cause:** Using old Google Maps API version

**Fix:**
- Verify script tag in `index.html` uses `v=weekly` or `v=beta`
- Required: `https://maps.googleapis.com/maps/api/js?key=API_KEY&v=weekly`

### Places API details not loading

**Cause:** Places API (NEW) not enabled or quota exceeded

**Fix:**
1. Enable "Places API (NEW)" in Google Cloud Console
2. Check API quota usage
3. Verify billing is enabled (required for Places API)

### Click not opening form

**Causes:**
1. Clicking regular map area (not a POI)
2. `onLocationSelect` prop not passed correctly
3. JavaScript error preventing form open

**Debug:**
- Check browser console for errors
- Verify `event.placeId` exists in console logs
- Check `onLocationSelect` function is defined in App.jsx

---

## Code References

**Main implementation:** `src/components/SimpleMap.jsx`
- Lines 86-120: POI click detection
- Lines 93-104: NEW Places API usage
- Lines 108-115: Location data structure

**Component usage:** `src/App.jsx`
- Line 154: SimpleMap component rendered
- Line 71-73: handleLocationSelect callback

**Related documentation:**
- `PLACES_API_FIX.md` - Previous OpenStreetMap approach
- `CONSOLE_ERRORS_GUIDE.md` - Common map errors
- `ROADMAP.md` - Future map enhancements

---

## Resources

**Google Documentation:**
- [NEW Places API Overview](https://developers.google.com/maps/documentation/javascript/place)
- [Place Class Reference](https://developers.google.com/maps/documentation/javascript/reference/place#Place)
- [Map Events Reference](https://developers.google.com/maps/documentation/javascript/events)

**Internal Documentation:**
- `SETUP-GUIDE.md` - Google Cloud setup instructions
- `OAUTH_FIX_REQUIRED.md` - OAuth configuration
- `TESTING-SIMPLE.md` - Testing procedures

---

**Questions or issues?** Check console logs for detailed error messages and refer to the troubleshooting guides.
