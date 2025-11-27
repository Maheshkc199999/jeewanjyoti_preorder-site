import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Activity, AlertCircle, RefreshCw } from 'lucide-react';
import { getStepsData } from '../lib/api';
import MultiRingChart from './MultiRingChart';

const StepsDataComponent = ({ darkMode, onStepsDataUpdate, selectedUserId }) => {
  const [stepsData, setStepsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Cache and debouncing refs
  const cacheRef = useRef(new Map());
  const debounceRef = useRef(null);

  // Fetch Steps data from API with caching and debouncing
  const fetchStepsData = useCallback(async () => {
    // Clear previous debounce timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the fetch to prevent rapid API calls
    debounceRef.current = setTimeout(async () => {
      try {
        // Check cache first
        const cacheKey = `${selectedUserId || 'null'}-${new Date().toDateString()}`;
        if (cacheRef.current.has(cacheKey)) {
          const cachedData = cacheRef.current.get(cacheKey);
          setStepsData(cachedData);
          if (onStepsDataUpdate) {
            onStepsDataUpdate(cachedData);
          }
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        
        console.log('Fetching steps data from last 24 hours for user:', selectedUserId || 'self');
        
        // Use range parameter instead of date filters for better API compatibility
        const data = await getStepsData(selectedUserId, null, null, '24h');
        
        // Cache the results
        cacheRef.current.set(cacheKey, data);
        
        setStepsData(data);
        
        // Notify parent component about steps data update
        if (onStepsDataUpdate) {
          onStepsDataUpdate(data);
        }
      } catch (err) {
        console.error('Error fetching steps data:', err);
        // Don't set error for empty data - only for actual fetch failures
        if (err.message && !err.message.includes('404')) {
          setError('Failed to load steps data');
        }
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce
  }, [selectedUserId, onStepsDataUpdate]);

  useEffect(() => {
    fetchStepsData();
  }, [selectedUserId]);

  // Transform steps data to chart format
  const transformStepsDataToChart = (data) => {
    if (!data || data.length === 0) {
      // Return default/sample data when no API data is available
      return [
        { 
          id: 1, 
          percentage: 6, // 600/10000 * 100
          value: '600',
          label: 'Steps',
          goal: '10,000 steps'
        },
        { 
          id: 2, 
          percentage: 7, // 0.357/5 * 100
          value: '0.36 km',
          label: 'Distance',
          goal: '5 km'
        },
        { 
          id: 3, 
          percentage: 32, // 159.3/500 * 100
          value: '159',
          label: 'Calories',
          goal: '500 cal'
        },
        { 
          id: 4, 
          percentage: 42, // 10/24 * 100
          value: '10 min',
          label: 'Active Time',
          goal: '24 min'
        },
      ];
    }

    // Use the latest data entry
    const latestData = data[data.length - 1];
    
    return [
      { 
        id: 1, 
        percentage: Math.min((latestData.detail_minter_step / 10000) * 100, 100),
        value: latestData.detail_minter_step.toLocaleString(),
        label: 'Steps',
        goal: '10,000 steps'
      },
      { 
        id: 2, 
        percentage: Math.min((latestData.distance / 5) * 100, 100),
        value: `${latestData.distance.toFixed(2)} km`,
        label: 'Distance',
        goal: '5 km'
      },
      { 
        id: 3, 
        percentage: Math.min((latestData.calories / 500) * 100, 100),
        value: Math.round(latestData.calories),
        label: 'Calories',
        goal: '500 cal'
      },
      { 
        id: 4, 
        percentage: Math.min((latestData.array_steps.split(' ').length / 24) * 100, 100),
        value: `${latestData.array_steps.split(' ').length} min`,
        label: 'Active Time',
        goal: '24 min'
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
              onClick={fetchStepsData}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const chartData = transformStepsDataToChart(stepsData);

  return (
    <MultiRingChart data={chartData} darkMode={darkMode} />
  );
};

export default StepsDataComponent;
