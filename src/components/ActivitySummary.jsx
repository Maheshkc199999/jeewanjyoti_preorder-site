import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Activity, Footprints, Flame, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { getDayTotalActivity } from '../lib/api';

// Utility function to calculate the dash offset for a given percentage and circumference
const calculateOffset = (percentage, circumference) => {
    return circumference - (percentage / 100) * circumference;
};

const ActivitySummary = ({ darkMode = false, onActivityDataUpdate, selectedUserId }) => {
    const [activityData, setActivityData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cache and debouncing refs
    const cacheRef = useRef(new Map());
    const debounceRef = useRef(null);

    // Chart configuration
    const size = 280;
    const center = size / 2;
    const strokeWidth = 14;

    const radii = [
        center - strokeWidth * 1.5,
        center - strokeWidth * 3.5,
        center - strokeWidth * 5.5,
        center - strokeWidth * 7.5
    ];

    const circumferences = radii.map(r => 2 * Math.PI * r);

    const colors = [
        'text-cyan-500',
        'text-emerald-500',
        'text-rose-500',
        'text-amber-400'
    ];

    const icons = [Activity, Footprints, Flame, Clock];

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
                    console.log('Using cached activity data:', cachedData);
                    setActivityData(cachedData);
                    if (onActivityDataUpdate) {
                        onActivityDataUpdate(cachedData);
                    }
                    setLoading(false);
                    return;
                }

                setLoading(true);
                setError(null);

                console.log('Fetching daily activity data for user:', selectedUserId || 'self');

                // Fetch daily activity data
                const response = await getDayTotalActivity(selectedUserId);

                console.log('=== Activity API Response ===');
                console.log('Full response:', response);
                console.log('Total results:', response.results?.length);

                if (!response.results || response.results.length === 0) {
                    throw new Error('No activity data available');
                }

                // Get today's date in YYYY-MM-DD format
                console.log('Today\'s date:', today);
                console.log('All dates in response:', response.results.map(r => r.date));

                // Filter for today's data
                const todayData = response.results.filter(item => item.date === today);
                console.log('Today\'s data count:', todayData.length);
                console.log('Today\'s data:', todayData);

                // If no data for today, use all results
                const dataToProcess = todayData.length > 0 ? todayData : response.results;

                // Get the LAST item in the array (most recent based on API order)
                const latestData = dataToProcess[dataToProcess.length - 1];

                console.log('Latest data selected:', latestData);

                if (!latestData) {
                    throw new Error('No valid activity data found');
                }

                // Sum up all calories for the day (since calories can be recorded at different times)
                const totalCalories = dataToProcess.reduce((sum, item) => sum + (item.calories || 0), 0);

                console.log('=== Calories Calculation ===');
                console.log('Total calories (summed):', totalCalories);
                console.log('Individual calories:', dataToProcess.map(d => ({ date: d.date, calories: d.calories })));

                // Create a combined data object with latest values for most fields and summed calories
                const processedData = {
                    ...latestData,
                    calories: totalCalories > 0 ? totalCalories : latestData.calories
                };

                console.log('=== Processed Activity Data ===');
                console.log('Steps:', processedData.step);
                console.log('Distance:', processedData.distance);
                console.log('Calories (summed):', processedData.calories);
                console.log('Exercise time:', processedData.exercise_time);

                // Cache the results with today's date
                cacheRef.current.set(cacheKey, processedData);

                setActivityData(processedData);

                // Notify parent component about activity data update
                if (onActivityDataUpdate) {
                    onActivityDataUpdate(processedData);
                }
            } catch (err) {
                console.error('Error fetching activity data:', err);
                setError('Failed to load activity data');
            } finally {
                setLoading(false);
            }
        }, 300); // 300ms debounce
    }, [selectedUserId, onActivityDataUpdate]);

    useEffect(() => {
        fetchActivityData();
    }, [fetchActivityData]);

    // Transform activity data to chart format
    const getChartData = () => {
        if (!activityData) {
            // Return default/sample data when no API data is available
            return [
                {
                    id: 1,
                    percentage: 0,
                    value: '0',
                    label: 'Steps',
                    goal: '10,000 steps'
                },
                {
                    id: 2,
                    percentage: 0,
                    value: '0 km',
                    label: 'Distance',
                    goal: '5 km'
                },
                {
                    id: 3,
                    percentage: 0,
                    value: '0',
                    label: 'Calories',
                    goal: '500 cal'
                },
                {
                    id: 4,
                    percentage: 0,
                    value: '0 min',
                    label: 'Exercise',
                    goal: '60 min'
                },
            ];
        }

        // Calculate percentages based on goals
        const stepsPercentage = Math.min(Math.round((activityData.step / 10000) * 100), 100);
        const distancePercentage = Math.min(Math.round((activityData.distance / 5) * 100), 100);
        const caloriesPercentage = Math.min(Math.round((activityData.calories / 500) * 100), 100);
        const exercisePercentage = Math.min(Math.round((activityData.exercise_minutes / 60) * 100), 100);

        return [
            {
                id: 1,
                percentage: stepsPercentage,
                value: activityData.step.toLocaleString(),
                label: 'Steps',
                goal: '10,000 steps'
            },
            {
                id: 2,
                percentage: distancePercentage,
                value: `${activityData.distance.toFixed(2)} km`,
                label: 'Distance',
                goal: '5 km'
            },
            {
                id: 3,
                percentage: caloriesPercentage,
                value: Math.round(activityData.calories),
                label: 'Calories',
                goal: '500 cal'
            },
            {
                id: 4,
                percentage: exercisePercentage,
                value: `${activityData.exercise_minutes} min`,
                label: 'Exercise',
                goal: '60 min'
            },
        ];
    };

    // Loading state
    if (loading) {
        return (
            <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
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

    // Error state
    if (error) {
        return (
            <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
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

    const chartData = getChartData();

    return (
        <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
            {/* Header */}
            <div className="mb-6">
                <h3 className={`font-semibold text-base md:text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                    Activity Summary
                </h3>
                <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                    {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </p>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                {/* Chart */}
                <div className="relative flex-shrink-0">
                    <svg
                        width={size}
                        height={size}
                        viewBox={`0 0 ${size} ${size}`}
                        className="rotate-[-90deg] drop-shadow-lg"
                    >
                        {chartData.map((item, index) => {
                            const radius = radii[index];
                            const circumference = circumferences[index];
                            const offset = calculateOffset(item.percentage, circumference);
                            const colorClass = colors[index];

                            return (
                                <circle
                                    key={item.id}
                                    className={`${colorClass} transition-all duration-700 ease-out`}
                                    stroke="currentColor"
                                    fill="transparent"
                                    strokeWidth={strokeWidth}
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                    r={radius}
                                    cx={center}
                                    cy={center}
                                    strokeLinecap="round"
                                    style={{ opacity: 0.9 }}
                                />
                            );
                        })}
                    </svg>

                    {/* Center Score */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className={`text-3xl md:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                            {Math.round(chartData.reduce((acc, item) => acc + item.percentage, 0) / chartData.length)}%
                        </div>
                        <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            Overall
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="flex-1 w-full grid grid-cols-2 gap-3 md:gap-4">
                    {chartData.map((item, index) => {
                        const Icon = icons[index];
                        return (
                            <div
                                key={item.id}
                                className={`rounded-lg md:rounded-xl p-4 md:p-5 border transition-all hover:shadow-md ${darkMode
                                        ? 'bg-gray-700 border-gray-600 hover:bg-gray-650'
                                        : 'bg-gradient-to-br from-gray-50 to-white border-gray-100 hover:border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                                    <div className={`p-2 rounded-lg ${colors[index].replace('text-', 'bg-')}/20`}>
                                        <Icon className={`w-4 h-4 md:w-5 md:h-5 ${colors[index]}`} />
                                    </div>
                                    <span className={`text-xs md:text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'
                                        }`}>
                                        {item.label}
                                    </span>
                                </div>
                                <p className={`text-xl md:text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'
                                    }`}>
                                    {item.value}
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${colors[index].replace('text-', 'bg-')} transition-all duration-700`}
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                    <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>
                                        {item.percentage}%
                                    </span>
                                </div>
                                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'
                                    }`}>
                                    Goal: {item.goal}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ActivitySummary;
