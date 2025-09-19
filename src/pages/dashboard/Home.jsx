import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Heart, Moon, Activity, Zap, Brain, Gauge, Target, TrendingUp, Clock } from 'lucide-react';

const HomeTab = ({ darkMode, selectedPeriod = 'today', setSelectedPeriod }) => {
  // Sample data for different metrics
  const heartRateData = [
    { time: '00:00', value: 65 },
    { time: '04:00', value: 58 },
    { time: '08:00', value: 72 },
    { time: '12:00', value: 85 },
    { time: '16:00', value: 78 },
    { time: '20:00', value: 68 },
    { time: '24:00', value: 62 }
  ];

  const sleepData = [
    { stage: 'Deep', value: 2.5, color: '#3B82F6' },
    { stage: 'Light', value: 4.2, color: '#60A5FA' },
    { stage: 'REM', value: 1.8, color: '#93C5FD' },
    { stage: 'Awake', value: 0.3, color: '#E5E7EB' }
  ];

  const activityData = [
    { day: 'Mon', steps: 8420, calories: 320 },
    { day: 'Tue', steps: 12340, calories: 480 },
    { day: 'Wed', steps: 9850, calories: 380 },
    { day: 'Thu', steps: 15200, calories: 590 },
    { day: 'Fri', steps: 11800, calories: 450 },
    { day: 'Sat', steps: 16500, calories: 640 },
    { day: 'Sun', steps: 13200, calories: 510 }
  ];

  const bloodOxygenData = [
    { time: '6AM', value: 98 },
    { time: '10AM', value: 97 },
    { time: '2PM', value: 98 },
    { time: '6PM', value: 97 },
    { time: '10PM', value: 98 }
  ];

  const stressData = [
    { time: '8AM', level: 25 },
    { time: '10AM', level: 45 },
    { time: '12PM', level: 65 },
    { time: '2PM', level: 80 },
    { time: '4PM', level: 55 },
    { time: '6PM', level: 30 },
    { time: '8PM', level: 20 }
  ];

  const MetricCard = ({ icon: Icon, title, value, unit, trend, color, children }) => (
    <div className={`rounded-2xl p-4 md:p-6 shadow-lg transition-all duration-300 border ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 md:p-3 rounded-xl ${color} bg-opacity-10`}>
            <Icon className={`w-5 h-5 md:w-6 md:h-6 ${color.replace('bg-', 'text-')}`} />
          </div>
          <div>
            <h3 className={`font-semibold text-sm md:text-base ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{title}</h3>
            <div className="flex items-center gap-2">
              <span className={`text-xl md:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</span>
              <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{unit}</span>
            </div>
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs md:text-sm">
            <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
            {trend}
          </div>
        )}
      </div>
      {children}
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 border rounded-lg shadow-lg ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{label}</p>
          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {payload[0].value} {payload[0].unit || ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-xs md:text-sm">Heart Rate</p>
              <p className="text-xl md:text-3xl font-bold">72 BPM</p>
            </div>
            <Heart className="w-8 h-8 md:w-12 md:h-12 text-red-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs md:text-sm">Sleep Score</p>
              <p className="text-xl md:text-3xl font-bold">85/100</p>
            </div>
            <Moon className="w-8 h-8 md:w-12 md:h-12 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs md:text-sm">Daily Steps</p>
              <p className="text-xl md:text-3xl font-bold">12,340</p>
            </div>
            <Activity className="w-8 h-8 md:w-12 md:h-12 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs md:text-sm">Stress Level</p>
              <p className="text-xl md:text-3xl font-bold">Low</p>
            </div>
            <Brain className="w-8 h-8 md:w-12 md:h-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
        {/* Heart Rate */}
        <MetricCard
          icon={Heart}
          title="Heart Rate"
          value="72"
          unit="BPM"
          trend="+2%"
          color="bg-red-500"
        >
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={heartRateData}>
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
        </MetricCard>

        {/* Blood Oxygen */}
        <MetricCard
          icon={Zap}
          title="Blood Oxygen"
          value="98"
          unit="%"
          trend="Normal"
          color="bg-blue-500"
        >
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={bloodOxygenData}>
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
                domain={[95, 100]} 
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
        </MetricCard>
      </div>

      {/* Sleep and Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
        {/* Sleep Analysis */}
        <MetricCard
          icon={Moon}
          title="Sleep Analysis"
          value="8.8"
          unit="hours"
          trend="Excellent"
          color="bg-indigo-500"
        >
          <div className="flex items-center justify-between">
            <ResponsiveContainer width="60%" height={200}>
              <PieChart>
                <Pie
                  data={sleepData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {sleepData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-35% space-y-2">
              {sleepData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.stage}</span>
                  <span className={`text-xs md:text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.value}h</span>
                </div>
              ))}
            </div>
          </div>
        </MetricCard>

        {/* Activity Tracking */}
        <MetricCard
          icon={Activity}
          title="Weekly Activity"
          value="12,340"
          unit="steps today"
          trend="+15%"
          color="bg-green-500"
        >
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activityData}>
              {darkMode ? (
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} vertical={false} />
              ) : (
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              )}
              <XAxis 
                dataKey="day" 
                stroke={darkMode ? "#9CA3AF" : "#666"} 
                axisLine 
                tickLine 
              />
              <YAxis 
                stroke={darkMode ? "#9CA3AF" : "#666"} 
                axisLine 
                tickLine 
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="steps" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </MetricCard>
      </div>

      {/* Stress and HRV Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
        {/* Stress Level */}
        <MetricCard
          icon={Brain}
          title="Stress Level"
          value="32"
          unit="Low"
          trend="Improving"
          color="bg-purple-500"
        >
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stressData}>
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
                domain={[0, 100]} 
                stroke={darkMode ? "#9CA3AF" : "#666"} 
                axisLine 
                tickLine 
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="level" 
                stroke="#8b5cf6" 
                fill="#8b5cf6" 
                fillOpacity={0.2}
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </MetricCard>

        {/* Blood Pressure & HRV */}
        <div className="space-y-4 md:space-y-6">
          <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 md:p-3 rounded-xl bg-orange-500 bg-opacity-10">
                <Gauge className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
              </div>
              <div>
                <h3 className={`font-semibold text-sm md:text-base ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Blood Pressure</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-lg md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>120/80</span>
                  <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>mmHg</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-green-600 bg-green-50 px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium">
                Normal Range
              </span>
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            </div>
          </div>

          <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 md:p-3 rounded-xl bg-teal-500 bg-opacity-10">
                <Target className="w-5 h-5 md:w-6 md:h-6 text-teal-500" />
              </div>
              <div>
                <h3 className={`font-semibold text-sm md:text-base ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>HRV Score</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-lg md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>45</span>
                  <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>ms</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-600 bg-blue-50 px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium">
                Good Recovery
              </span>
              <div className={`w-16 md:w-24 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                <div className="bg-teal-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Summary */}
      <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className={`font-semibold text-sm md:text-base ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-2`}>Health Summary</h3>
            <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Great job maintaining your health metrics today! Your heart rate variability indicates good recovery, 
              and your stress levels are well-managed. Keep up the excellent sleep routine.
            </p>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-green-500">A+</div>
              <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Overall Score</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeTab;