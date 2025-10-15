import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Moon, Clock, TrendingUp, Eye, EyeOff, Activity, Zap, Brain, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { getSleepData } from '../lib/api';

const SleepDataComponent = ({ darkMode, onSleepDataUpdate }) => {
  const [sleepData, setSleepData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch sleep data from API
  const fetchSleepData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSleepData();
      setSleepData(data);
      
      // Set the most recent date as selected by default
      if (data && data.length > 0) {
        setSelectedDate(data[0]);
      }
      
      // Notify parent component about sleep data update
      if (onSleepDataUpdate) {
        onSleepDataUpdate(data);
      }
    } catch (err) {
      console.error('Error fetching sleep data:', err);
      setError('Failed to load sleep data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSleepData();
  }, []);

  // Process sleep data for visualization
  const processSleepData = (data) => {
    if (!data) return null;

    const sleepStages = [
      { 
        stage: 'Deep Sleep', 
        value: data.deep_sleep_percentage, 
        color: '#1e40af',
        hours: (data.duration * data.deep_sleep_percentage / 100).toFixed(1)
      },
      { 
        stage: 'Light Sleep', 
        value: data.light_sleep_percentage, 
        color: '#3b82f6',
        hours: (data.duration * data.light_sleep_percentage / 100).toFixed(1)
      },
      { 
        stage: 'Medium Sleep', 
        value: data.medium_sleep_percentage, 
        color: '#60a5fa',
        hours: (data.duration * data.medium_sleep_percentage / 100).toFixed(1)
      },
      { 
        stage: 'Awake', 
        value: data.awake_percentage, 
        color: '#e5e7eb',
        hours: (data.duration * data.awake_percentage / 100).toFixed(1)
      }
    ];

    return sleepStages;
  };

  // Parse sleep quality sequence for visualization
  const parseSleepQualitySequence = (sequence) => {
    if (!sequence) return [];
    
    const qualityMap = {
      '-1': { label: 'Unknown', color: '#6b7280' },
      '1': { label: 'Light Sleep', color: '#3b82f6' },
      '2': { label: 'Deep Sleep', color: '#1e40af' },
      '3': { label: 'REM Sleep', color: '#8b5cf6' }
    };

    return sequence.split(' ').map((quality, index) => ({
      time: index * 10, // Assuming 10-minute intervals
      quality: parseInt(quality),
      ...qualityMap[quality] || qualityMap['-1']
    }));
  };

  // Calculate sleep score based on data
  const calculateSleepScore = (data) => {
    if (!data) return 0;
    
    let score = 0;
    
    // Duration score (optimal: 7-9 hours)
    const duration = data.duration;
    if (duration >= 7 && duration <= 9) {
      score += 30;
    } else if (duration >= 6 && duration <= 10) {
      score += 20;
    } else {
      score += 10;
    }
    
    // Deep sleep percentage (optimal: 15-20%)
    const deepSleep = data.deep_sleep_percentage;
    if (deepSleep >= 15 && deepSleep <= 20) {
      score += 25;
    } else if (deepSleep >= 10 && deepSleep <= 25) {
      score += 15;
    } else {
      score += 5;
    }
    
    // Light sleep percentage (optimal: 45-55%)
    const lightSleep = data.light_sleep_percentage;
    if (lightSleep >= 45 && lightSleep <= 55) {
      score += 25;
    } else if (lightSleep >= 40 && lightSleep <= 60) {
      score += 15;
    } else {
      score += 5;
    }
    
    // Awake percentage (optimal: <5%)
    const awake = data.awake_percentage;
    if (awake < 5) {
      score += 20;
    } else if (awake < 10) {
      score += 10;
    } else {
      score += 5;
    }
    
    return Math.min(score, 100);
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 border rounded-lg shadow-lg ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {payload[0].payload.stage}
          </p>
          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {payload[0].value}% ({payload[0].payload.hours}h)
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading sleep data...
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
              onClick={fetchSleepData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!sleepData || sleepData.length === 0) {
    return (
      <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Moon className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No sleep data available
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentData = selectedDate || sleepData[0];
  const processedData = processSleepData(currentData);
  const sleepScore = calculateSleepScore(currentData);
  const qualitySequence = parseSleepQualitySequence(currentData.sleep_quality_sequence);

  return (
    <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 md:p-4 rounded-xl bg-indigo-500 bg-opacity-20 shadow-lg">
            <Moon className="w-6 h-6 md:w-8 md:h-8 text-indigo-500" />
          </div>
          <div>
            <h3 className={`font-semibold text-sm md:text-base ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Sleep Analysis
            </h3>
            <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {formatDate(currentData.date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className={`text-xl md:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {sleepScore}/100
            </div>
            <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Sleep Score
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            {showDetails ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
          </button>
        </div>
      </div>

      {/* Sleep Duration and Time */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className={`text-lg md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {currentData.duration}h
          </div>
          <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Duration
          </div>
        </div>
        <div className="text-center">
          <div className={`text-lg md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {formatTime(currentData.start_time)}
          </div>
          <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Sleep Start
          </div>
        </div>
        <div className="text-center">
          <div className={`text-lg md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {formatTime(currentData.end_time)}
          </div>
          <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Wake Up
          </div>
        </div>
      </div>

      {/* Sleep Stages Chart */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <ResponsiveContainer width="60%" height={200}>
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="w-35% space-y-2">
            {processedData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {item.stage}
                </span>
                <span className={`text-xs md:text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed View */}
      {showDetails && (
        <div className="mt-6 space-y-4">
          {/* Sleep Quality Sequence */}
          <div>
            <h4 className={`font-semibold text-sm md:text-base ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-3`}>
              Sleep Quality Timeline
            </h4>
            <div className="grid grid-cols-12 gap-1 mb-4">
              {qualitySequence.slice(0, 48).map((item, index) => (
                <div
                  key={index}
                  className="h-4 rounded-sm"
                  style={{ backgroundColor: item.color }}
                  title={`${Math.floor(item.time / 60)}h ${item.time % 60}m - ${item.label}`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Unknown</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Light Sleep</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-800"></div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Deep Sleep</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>REM Sleep</span>
              </div>
            </div>
          </div>

          {/* Sleep Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Deep Sleep
                </span>
              </div>
              <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentData.deep_sleep_percentage}%
              </div>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-green-500" />
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Light Sleep
                </span>
              </div>
              <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentData.light_sleep_percentage}%
              </div>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-purple-500" />
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Medium Sleep
                </span>
              </div>
              <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentData.medium_sleep_percentage}%
              </div>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Awake
                </span>
              </div>
              <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentData.awake_percentage}%
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SleepDataComponent;
