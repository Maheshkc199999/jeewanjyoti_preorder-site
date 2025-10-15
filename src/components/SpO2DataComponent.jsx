import React, { useState, useEffect } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Droplets, TrendingUp, AlertCircle, RefreshCw, Activity, Clock } from 'lucide-react';
import { getSpO2Data } from '../lib/api';

const SpO2DataComponent = ({ darkMode, onSpO2DataUpdate }) => {
  const [spo2Data, setSpO2Data] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch SpO2 data from API
  const fetchSpO2Data = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSpO2Data();
      setSpO2Data(data);
      
      // Notify parent component about SpO2 data update
      if (onSpO2DataUpdate) {
        onSpO2DataUpdate(data);
      }
    } catch (err) {
      console.error('Error fetching SpO2 data:', err);
      setError('Failed to load SpO2 data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpO2Data();
  }, []);

  // Process SpO2 data for visualization
  const processSpO2Data = (data) => {
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
      value: item.Blood_oxygen,
      fullTime: new Date(item.date).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }));
  };

  // Calculate average SpO2
  const calculateAverageSpO2 = (data) => {
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + item.Blood_oxygen, 0);
    return Math.round(sum / data.length);
  };

  // Get SpO2 status
  const getSpO2Status = (value) => {
    if (value >= 95) return { status: 'Normal', color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20' };
    if (value >= 90) return { status: 'Low', color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' };
    return { status: 'Critical', color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20' };
  };

  // Get latest reading
  const getLatestReading = () => {
    if (!spo2Data || spo2Data.length === 0) return null;
    return spo2Data[spo2Data.length - 1];
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
            {payload[0].value}% SpO2
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
              Loading SpO2 data...
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
              onClick={fetchSpO2Data}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!spo2Data || spo2Data.length === 0) {
    return (
      <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Droplets className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No SpO2 data available
            </p>
          </div>
        </div>
      </div>
    );
  }

  const latestReading = getLatestReading();
  const averageSpO2 = calculateAverageSpO2(spo2Data);
  const chartData = processSpO2Data(spo2Data);
  const status = getSpO2Status(latestReading?.Blood_oxygen || averageSpO2);

  return (
    <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 md:p-4 rounded-xl bg-blue-500 bg-opacity-20 shadow-lg">
            <Droplets className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
          </div>
          <div>
            <h3 className={`font-semibold text-sm md:text-base ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Blood Oxygen (SpO2)
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
              {latestReading?.Blood_oxygen || averageSpO2}%
            </div>
            <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Current Level
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

      {/* SpO2 Status */}
      <div className="mb-6">
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${status.bgColor}`}>
          <div className={`w-2 h-2 rounded-full ${status.color.replace('text-', 'bg-')}`}></div>
          <span className={`text-sm font-medium ${status.color}`}>
            {status.status} Range
          </span>
        </div>
      </div>

      {/* SpO2 Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
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
              domain={[90, 100]} 
              stroke={darkMode ? "#9CA3AF" : "#666"} 
              axisLine 
              tickLine 
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed View */}
      {showDetails && (
        <div className="mt-6 space-y-4">
          {/* SpO2 Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Average
                </span>
              </div>
              <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {averageSpO2}%
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
                {latestReading?.Blood_oxygen || 'N/A'}%
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
                {spo2Data.length}
              </div>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-cyan-500" />
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </span>
              </div>
              <div className={`text-lg font-bold ${status.color}`}>
                {status.status}
              </div>
            </div>
          </div>

          {/* Recent Readings */}
          <div>
            <h4 className={`font-semibold text-sm md:text-base ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-3`}>
              Recent Readings
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {spo2Data.slice(-5).reverse().map((reading, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      reading.Blood_oxygen >= 95 ? 'bg-green-500' : 
                      reading.Blood_oxygen >= 90 ? 'bg-yellow-500' : 'bg-red-500'
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
                    {reading.Blood_oxygen}%
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

export default SpO2DataComponent;
