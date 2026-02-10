import { useState, useMemo, useCallback } from 'react';
import { getAllLocations } from '../utils/googleSheets';

/**
 * Custom hook for managing Locations data
 */
export const useLocations = () => {
    const [visitedLocations, setVisitedLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentView, setCurrentView] = useState('map'); // 'map' or 'list'

    // Fetch locations from Google Sheets
    const refreshLocations = useCallback(async () => {
        try {
            const locations = await getAllLocations();
            console.log('Loaded locations:', locations);
            // Filter out archived locations
            const activeLocations = locations.filter(loc => loc.archived !== 'YES');
            setVisitedLocations(activeLocations);
        } catch (err) {
            console.error('Error loading locations:', err);
        }
    }, []);

    // Filter locations based on search query
    const filteredLocations = useMemo(() => {
        if (!searchQuery) return visitedLocations;
        const query = searchQuery.toLowerCase();
        return visitedLocations.filter(loc =>
            loc.locationName?.toLowerCase().includes(query) ||
            loc.businessAddress?.toLowerCase().includes(query) ||
            loc.contactPerson?.toLowerCase().includes(query)
        );
    }, [visitedLocations, searchQuery]);

    const handleLocationSelect = (location) => {
        setSelectedLocation(location);
    };

    const clearSelection = () => {
        setSelectedLocation(null);
    };

    return {
        visitedLocations,
        filteredLocations,
        selectedLocation,
        searchQuery,
        setSearchQuery,
        currentView,
        setCurrentView,
        refreshLocations,
        handleLocationSelect,
        clearSelection,
        setSelectedLocation
    };
};
