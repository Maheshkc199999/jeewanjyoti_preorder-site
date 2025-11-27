import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Activity, AlertCircle, RefreshCw } from 'lucide-react';
import { getDayTotalActivity } from '../lib/api';
import MultiRingChart from './MultiRingChart';

const StepsDataComponent = ({ darkMode, onStepsDataUpdate, selectedUserId }) => {
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Cache and debouncing refs
  const cacheRef = useRef(new Map());
  const debounceRef = useRef(null);

  // Fetch daily activity data from API with caching and debouncing
  const fetchActivityData = useCallback(async () => {
    // Clear previous debounce timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the fetch to prevent rapid API calls
    debounceRef.current = setTimeout(async () => {
      try {
        // Create a cache key that includes the current date
        const today = new Date().toISOString().split('T')[0];
        const cacheKey = `activity-${selectedUserId || 'default'}-${today}`;
        
        // Check cache first
        if (cacheRef.current.has(cacheKey)) {
          const cachedData = cacheRef.current.get(cacheKey);
          setActivityData(cachedData);
          if (onStepsDataUpdate) {
            onStepsDataUpdate(cachedData);
          }
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        
        console.log('Fetching daily activity data for user:', selectedUserId || 'self');
        
        // Fetch daily activity data
        const response = await getDayTotalActivity(selectedUserId);
        
        if (!response.results || response.results.length === 0) {
          throw new Error('No activity data available');
        }
        
        // Get today's date in YYYY-MM-DD format
        const todayData = response.results
          .filter(item => item.date === today)
          .sort((a, b) => {
            // Sort by timestamp if available, otherwise use the order in the response
            const timeA = a.timestamp || 0;
            const timeB = b.timestamp || 0;
            return new Date(timeB) - new Date(timeA);
          });

        // Use the most recent data for today, or the most recent data if no today's data exists
        const latestData = todayData.length > 0 ? todayData[0] : response.results[0];

        if (!latestData) {
          throw new Error('No valid activity data found');
        }
        
        // Cache the results with today's date
        cacheRef.current.set(cacheKey, latestData);
        
        setActivityData(latestData);
        
        // Notify parent component about activity data update
        if (onStepsDataUpdate) {
          onStepsDataUpdate(latestData);
        }
      } catch (err) {
        console.error('Error fetching activity data:', err);
        setError('Failed to load activity data');
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce
  }, [selectedUserId, onStepsDataUpdate]);

  useEffect(() => {
    fetchActivityData();
  }, [fetchActivityData]);

  // Transform activity data to chart format
  const transformActivityDataToChart = (data) => {
    if (!data) {
      // Return default/sample data when no API data is available
      return [
        { 
          id: 1, 
          percentage: 61, // 6094/10000 * 100
          value: '6,094',
          label: 'Steps',
          goal: '10,000 steps'
        },
        { 
          id: 2, 
          percentage: 75, // 3.75/5 * 100
          value: '3.75 km',
          label: 'Distance',
          goal: '5 km'
        },
        { 
          id: 3, 
          percentage: 33, // 166.96/500 * 100
          value: '167',
          label: 'Calories',
          goal: '500 cal'
        },
        { 
          id: 4, 
          percentage: 0, // 0/100 * 100
          value: '0%',
          label: 'Goal',
          goal: '100%'
        },
      ];
    }
    
    // Calculate percentages based on goals
    const stepsPercentage = Math.min(Math.round((data.step / 10000) * 100), 100);
    const distancePercentage = Math.min(Math.round((data.distance / 5) * 100), 100);
    const caloriesPercentage = Math.min(Math.round((data.calories / 500) * 100), 100);
    const goalPercentage = Math.min(Math.round((data.goal || 0)), 100);
    
    return [
      { 
        id: 1, 
        percentage: stepsPercentage,
        value: data.step.toLocaleString(),
        label: 'Steps',
        goal: '10,000 steps'
      },
      { 
        id: 2, 
        percentage: distancePercentage,
        value: `${data.distance.toFixed(2)} km`,
        label: 'Distance',
        goal: '5 km'
      },
      { 
        id: 3, 
        percentage: caloriesPercentage,
        value: Math.round(data.calories),
        label: 'Calories',
        goal: '500 cal'
      },
      { 
        id: 4, 
        percentage: goalPercentage,
        value: `${goalPercentage}%`,
        label: 'Goal',
        goal: '100%'
      },
    ];
  };

  if (loading) {
    return (
      <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-green-500 mx-auto mb-4" />
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading activity data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              {error}
            </p>
            <button
              onClick={fetchActivityData}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const chartData = transformActivityDataToChart(activityData);

  return (
    <MultiRingChart data={chartData} darkMode={darkMode} />
  );
};

export default StepsDataComponent;
