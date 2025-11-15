import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Heart, TrendingUp, AlertCircle, RefreshCw, Activity, Clock, Zap } from 'lucide-react';
import { getHeartRateData } from '../lib/api';

const HeartRateDataComponent = ({ darkMode, onHeartRateDataUpdate, selectedUserId }) => {
  const [heartRateData, setHeartRateData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch Heart Rate data from API
  const fetchHeartRateData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHeartRateData(selectedUserId);
      setHeartRateData(data);
      
      // Notify parent component about Heart Rate data update
      if (onHeartRateDataUpdate) {
        onHeartRateDataUpdate(data);
      }
    } catch (err) {
      console.error('Error fetching Heart Rate data:', err);
      setError('Failed to load Heart Rate data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeartRateData();
  }, [selectedUserId]);

  // Process Heart Rate data for visualization
  const processHeartRateData = (data) => {
    if (!data || data.length === 0) return [];

    // Sort by date and take the most recent 10 readings
    const sortedData = data
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-10);

    return sortedData.map((item, index) => ({
      time: new Date(item.date).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      value: item.once_heart_value,
      fullTime: new Date(item.date).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }));
  };

  // Calculate average Heart Rate
  const calculateAverageHeartRate = (data) => {
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + item.once_heart_value, 0);
    return Math.round(sum / data.length);
  };

  // Get Heart Rate status
  const getHeartRateStatus = (value) => {
    if (value >= 60 && value <= 100) return { status: 'Normal', color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20' };
    if (value >= 50 && value <= 120) return { status: 'Elevated', color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' };
    if (value < 50) return { status: 'Low', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' };
    return { status: 'High', color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20' };
  };

  // Get latest reading
  const getLatestReading = () => {
    if (!heartRateData || heartRateData.length === 0) return null;
    return heartRateData[heartRateData.length - 1];
  };

  // Get Heart Rate Zone
  const getHeartRateZone = (value) => {
    if (value < 50) return 'Resting';
    if (value < 60) return 'Recovery';
    if (value < 70) return 'Fat Burn';
    if (value < 80) return 'Aerobic';
    if (value < 90) return 'Anaerobic';
    return 'Maximum';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 border rounded-lg shadow-lg ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {payload[0].payload.fullTime}
          </p>
          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {payload[0].value} BPM
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
            <RefreshCw className="w-8 h-8 animate-spin text-red-500 mx-auto mb-4" />
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading Heart Rate data...
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
              onClick={fetchHeartRateData}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!heartRateData || heartRateData.length === 0) {
    return (
      <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Heart className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No Heart Rate data available
            </p>
          </div>
        </div>
      </div>
    );
  }

  const latestReading = getLatestReading();
  const averageHeartRate = calculateAverageHeartRate(heartRateData);
  const chartData = processHeartRateData(heartRateData);
  const status = getHeartRateStatus(latestReading?.once_heart_value || averageHeartRate);
  const heartRateZone = getHeartRateZone(latestReading?.once_heart_value || averageHeartRate);

  return (
    <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 md:p-4 rounded-xl bg-red-500 bg-opacity-20 shadow-lg">
            <Heart className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
          </div>
          <div>
            <h3 className={`font-semibold text-sm md:text-base ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Heart Rate
            </h3>
            <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Latest: {latestReading ? new Date(latestReading.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className={`text-xl md:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {latestReading?.once_heart_value || averageHeartRate} BPM
            </div>
            <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Current Rate
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <Activity className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Heart Rate Status and Zone */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${status.bgColor}`}>
          <div className={`w-2 h-2 rounded-full ${status.color.replace('text-', 'bg-')}`}></div>
          <span className={`text-sm font-medium ${status.color}`}>
            {status.status} Range
          </span>
        </div>
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
          darkMode ? 'bg-purple-900/20' : 'bg-purple-50'
        }`}>
          <Zap className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-purple-600">
            {heartRateZone} Zone
          </span>
        </div>
      </div>

      {/* Heart Rate Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            {darkMode ? (
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} vertical={false} />
            ) : (
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            )}
            <XAxis 
              dataKey="time" 
              stroke={darkMode ? "#9CA3AF" : "#666"} 
              axisLine 
              tickLine 
            />
            <YAxis 
              domain={[40, 120]} 
              stroke={darkMode ? "#9CA3AF" : "#666"} 
              axisLine 
              tickLine 
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#ef4444" 
              fill="#ef4444" 
              fillOpacity={0.1}
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed View */}
      {showDetails && (
        <div className="mt-6 space-y-4">
          {/* Heart Rate Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-red-500" />
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Average
                </span>
              </div>
              <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {averageHeartRate} BPM
              </div>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-green-500" />
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Latest
                </span>
              </div>
              <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {latestReading?.once_heart_value || 'N/A'} BPM
              </div>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-purple-500" />
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Readings
                </span>
              </div>
              <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {heartRateData.length}
              </div>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Zone
                </span>
              </div>
              <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {heartRateZone}
              </div>
            </div>
          </div>

          {/* Recent Readings */}
          <div>
            <h4 className={`font-semibold text-sm md:text-base ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-3`}>
              Recent Readings
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {heartRateData.slice(-5).reverse().map((reading, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      reading.once_heart_value >= 60 && reading.once_heart_value <= 100 ? 'bg-green-500' : 
                      reading.once_heart_value >= 50 && reading.once_heart_value <= 120 ? 'bg-yellow-500' : 
                      reading.once_heart_value < 50 ? 'bg-blue-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {new Date(reading.date).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {reading.once_heart_value} BPM
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeartRateDataComponent;
