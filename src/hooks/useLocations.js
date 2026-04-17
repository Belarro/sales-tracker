import { useState, useMemo, useCallback } from 'react';
import { getAllLocations, getProspects } from '../utils/googleSheets';
import { daysFromToday } from '../utils/dateUtils';
import { CONFIG } from '../config';

/**
 * Custom hook for managing Locations data
 */
export const useLocations = () => {
    const [visitedLocations, setVisitedLocations] = useState([]);
    const [prospects, setProspects] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    // Check URL params for view (e.g. from notification tap)
    const urlView = new URLSearchParams(window.location.search).get('view');
    const [currentView, setCurrentView] = useState(urlView || 'tasks'); // 'tasks', 'map', or 'list'
    const [loadError, setLoadError] = useState('');

    const refreshProspects = useCallback(async () => {
        try {
            const data = await getProspects();
            setProspects(data);
        } catch (err) {
            console.error('Error loading prospects:', err);
        }
    }, []);

    // Fetch locations from Google Sheets
    const refreshLocations = useCallback(async () => {
        setLoadError('');
        try {
            const [locations] = await Promise.all([
                getAllLocations(),
                refreshProspects()
            ]);
            const activeLocations = locations.filter(loc => loc.archived !== 'YES');
            setVisitedLocations(activeLocations);
        } catch (err) {
            console.error('Error loading locations:', err);
            setLoadError('Failed to load locations. Please refresh the page.');
        }
    }, [refreshProspects]);

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

    // Pipeline: locations that need follow-up action
    // Contacts with no nextActionDate are treated as "due today" (new visits needing first follow-up)
    const taskLocations = useMemo(() => {
        return visitedLocations
            .filter(loc => {
                if (['Not Interested', 'Closed Deal'].includes(loc.interestLevel)) return false;
                if (loc.pipelineStage === 'closed_won' || loc.pipelineStage === 'closed_lost') return false;
                if (['sent', 'delivered'].includes(loc.automationStatus)) return false;
                return true;
            })
            .map(loc => ({
                ...loc,
                _daysUntilAction: loc.nextActionDate ? daysFromToday(loc.nextActionDate) : 0
            }));
    }, [visitedLocations]);

    const overdueTasks = useMemo(() =>
        taskLocations
            .filter(loc => loc._daysUntilAction !== null && loc._daysUntilAction < 0)
            .sort((a, b) => a._daysUntilAction - b._daysUntilAction),
        [taskLocations]);

    const todayTasks = useMemo(() =>
        taskLocations.filter(loc => loc._daysUntilAction === 0),
        [taskLocations]);

    const upcomingTasks = useMemo(() =>
        taskLocations
            .filter(loc => loc._daysUntilAction !== null &&
                           loc._daysUntilAction > 0 &&
                           loc._daysUntilAction <= CONFIG.UPCOMING_DAYS_WINDOW)
            .sort((a, b) => a._daysUntilAction - b._daysUntilAction),
        [taskLocations]);

    const handleLocationSelect = (location) => {
        setSelectedLocation(location);
    };

    const clearSelection = () => {
        setSelectedLocation(null);
    };

    return {
        visitedLocations,
        filteredLocations,
        prospects,
        refreshProspects,
        selectedLocation,
        searchQuery,
        setSearchQuery,
        currentView,
        setCurrentView,
        refreshLocations,
        handleLocationSelect,
        clearSelection,
        setSelectedLocation,
        loadError,
        // Pipeline
        overdueTasks,
        todayTasks,
        upcomingTasks
    };
};
