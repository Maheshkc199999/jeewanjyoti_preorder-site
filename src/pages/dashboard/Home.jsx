import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Heart, Moon, Activity, Zap, Brain, Gauge, Target, TrendingUp, Clock, Droplets, Thermometer, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Activity as ActivityIcon } from 'lucide-react';
import SleepDataComponent from '../../components/SleepDataComponent';
import SpO2DataComponent from '../../components/SpO2DataComponent';
import HeartRateDataComponent from '../../components/HeartRateDataComponent';
import { getBloodPressureData, getStressData, getHRVData } from '../../lib/api';

const HomeTab = ({ darkMode, selectedPeriod = 'today', setSelectedPeriod, selectedUserId }) => {
  const [sleepData, setSleepData] = useState(null);
  const [spo2Data, setSpO2Data] = useState(null);
  const [heartRateData, setHeartRateData] = useState(null);
  const [bloodPressureData, setBloodPressureData] = useState(null);
  const [stressApiData, setStressApiData] = useState(null);
  const [hrvApiData, setHrvApiData] = useState(null);

  // Calculate sleep score based on data (same as SleepDataComponent)
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

  // Fetch health data
  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const [bloodPressureDataResult, stressDataResult, hrvDataResult] = await Promise.all([
          getBloodPressureData(selectedUserId),
          getStressData(selectedUserId),
          getHRVData(selectedUserId)
        ]);
        setBloodPressureData(bloodPressureDataResult);
        setStressApiData(stressDataResult);
        setHrvApiData(hrvDataResult);
      } catch (error) {
        console.error('Error fetching health data:', error);
      }
    };
    fetchHealthData();
  }, [selectedUserId]);

  // Sample data for different metrics

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

  const MetricCard = ({ icon: Icon, title, value, unit, trend, color, chartType, children }) => (
    <div className={`rounded-2xl p-4 md:p-6 shadow-lg transition-all duration-300 border ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 md:p-4 rounded-xl ${color} bg-opacity-20 shadow-lg`}>
            <Icon className={`w-6 h-6 md:w-8 md:h-8 ${color.replace('bg-', 'text-')}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-semibold text-sm md:text-base ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{title}</h3>
              {chartType && (
                <div className={`p-1 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  {chartType === 'area' && <AreaChart className="w-3 h-3 text-gray-500" />}
                  {chartType === 'line' && <LineChartIcon className="w-3 h-3 text-gray-500" />}
                  {chartType === 'bar' && <BarChart3 className="w-3 h-3 text-gray-500" />}
                  {chartType === 'pie' && <PieChartIcon className="w-3 h-3 text-gray-500" />}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xl md:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</span>
              <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{unit}</span>
            </div>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs md:text-sm ${
            trend.includes('+') || trend === 'Normal' || trend === 'Excellent' || trend === 'Improving' || trend === 'Good Recovery'
              ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
              : 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
          }`}>
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
        <div className="rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-red-100">Heart Rate</p>
              <p className="text-xl md:text-3xl font-bold text-white">
                {heartRateData && heartRateData.length > 0 
                  ? heartRateData[heartRateData.length - 1].once_heart_value
                  : '72'
                } BPM
              </p>
            </div>
            <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
              <Heart className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
          </div>
        </div>
        
        <div className="rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-indigo-100">Sleep Score</p>
              <p className="text-xl md:text-3xl font-bold text-white">
                {sleepData && sleepData.length > 0 
                  ? calculateSleepScore(sleepData[0])
                  : '85'
                }/100
              </p>
            </div>
            <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
              <Moon className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
          </div>
        </div>
        
        <div className="rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-green-100">Daily Steps</p>
              <p className="text-xl md:text-3xl font-bold text-white">12,340</p>
            </div>
            <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
              <Activity className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
          </div>
        </div>
        
        <div className="rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-blue-100">Blood Oxygen</p>
              <p className="text-xl md:text-3xl font-bold text-white">
                {spo2Data && spo2Data.length > 0 
                  ? spo2Data[spo2Data.length - 1].Blood_oxygen
                  : '98'
                }%
              </p>
            </div>
            <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
              <Droplets className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
        {/* Heart Rate */}
        <HeartRateDataComponent 
          darkMode={darkMode} 
          onHeartRateDataUpdate={setHeartRateData}
          selectedUserId={selectedUserId}
        />

        {/* Blood Oxygen */}
        <SpO2DataComponent 
          darkMode={darkMode} 
          onSpO2DataUpdate={setSpO2Data}
          selectedUserId={selectedUserId}
        />
      </div>

      {/* Sleep and Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
        {/* Sleep Analysis */}
        <SleepDataComponent 
          darkMode={darkMode} 
          onSleepDataUpdate={setSleepData}
          selectedUserId={selectedUserId}
        />

        {/* Activity Tracking */}
        <MetricCard
          icon={Activity}
          title="Weekly Activity"
          value="12,340"
          unit="steps today"
          trend="+15%"
          color="bg-green-500"
          chartType="bar"
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
          value={stressApiData && stressApiData.length > 0 
            ? stressApiData[stressApiData.length - 1].stress
            : '32'
          }
          unit={stressApiData && stressApiData.length > 0 
            ? (() => {
                const stress = stressApiData[stressApiData.length - 1].stress;
                if (stress < 30) return 'Low';
                if (stress < 60) return 'Moderate';
                return 'High';
              })()
            : 'Low'
          }
          trend={stressApiData && stressApiData.length > 0 
            ? (() => {
                const stress = stressApiData[stressApiData.length - 1].stress;
                if (stress < 30) return 'Excellent';
                if (stress < 60) return 'Good';
                return 'High';
              })()
            : 'Improving'
          }
          color="bg-purple-500"
          chartType="area"
        >
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stressApiData && stressApiData.length > 0 
              ? stressApiData.map(item => ({
                  time: new Date(item.date).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  }),
                  level: item.stress
                }))
              : stressData
            }>
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
              <div className="p-3 md:p-4 rounded-xl bg-orange-500 bg-opacity-20 shadow-lg">
                <Thermometer className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-semibold text-sm md:text-base ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Blood Pressure</h3>
                  <div className={`p-1 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <Gauge className="w-3 h-3 text-gray-500" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-lg md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {bloodPressureData && bloodPressureData.length > 0 
                      ? `${bloodPressureData[bloodPressureData.length - 1].sbp}/${bloodPressureData[bloodPressureData.length - 1].dbp}`
                      : '120/80'
                    }
                  </span>
                  <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>mmHg</span>
                </div>
                {bloodPressureData && bloodPressureData.length > 0 && (
                  <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                    {new Date(bloodPressureData[bloodPressureData.length - 1].date).toLocaleDateString()} • {new Date(bloodPressureData[bloodPressureData.length - 1].date).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium ${
                bloodPressureData && bloodPressureData.length > 0 
                  ? (() => {
                      const latest = bloodPressureData[bloodPressureData.length - 1];
                      const sbp = latest.sbp;
                      const dbp = latest.dbp;
                      
                      if (sbp < 120 && dbp < 80) {
                        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
                      } else if (sbp < 140 && dbp < 90) {
                        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
                      } else {
                        return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
                      }
                    })()
                  : 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
              }`}>
                {bloodPressureData && bloodPressureData.length > 0 
                  ? (() => {
                      const latest = bloodPressureData[bloodPressureData.length - 1];
                      const sbp = latest.sbp;
                      const dbp = latest.dbp;
                      
                      if (sbp < 120 && dbp < 80) return 'Normal Range';
                      if (sbp < 140 && dbp < 90) return 'Elevated';
                      return 'High';
                    })()
                  : 'Normal Range'
                }
              </span>
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            </div>
          </div>

              <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 md:p-4 rounded-xl bg-yellow-500 bg-opacity-20 shadow-lg">
                <Zap className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-semibold text-sm md:text-base ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>HRV Score</h3>
                  <div className={`p-1 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <ActivityIcon className="w-3 h-3 text-gray-500" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-lg md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {hrvApiData && hrvApiData.length > 0 
                      ? hrvApiData[hrvApiData.length - 1].hrv
                      : '45'
                    }
                  </span>
                  <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>ms</span>
                </div>
                {hrvApiData && hrvApiData.length > 0 && (
                  <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                    {new Date(hrvApiData[hrvApiData.length - 1].date).toLocaleDateString()} • {new Date(hrvApiData[hrvApiData.length - 1].date).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium ${
                hrvApiData && hrvApiData.length > 0 
                  ? (() => {
                      const hrv = hrvApiData[hrvApiData.length - 1].hrv;
                      if (hrv >= 50) {
                        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
                      } else if (hrv >= 30) {
                        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
                      } else {
                        return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
                      }
                    })()
                  : 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
              }`}>
                {hrvApiData && hrvApiData.length > 0 
                  ? (() => {
                      const hrv = hrvApiData[hrvApiData.length - 1].hrv;
                      if (hrv >= 50) return 'Good Recovery';
                      if (hrv >= 30) return 'Moderate';
                      return 'Poor Recovery';
                    })()
                  : 'Good Recovery'
                }
              </span>
              <div className={`w-16 md:w-24 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                <div className="bg-yellow-500 h-2 rounded-full" style={{ 
                  width: hrvApiData && hrvApiData.length > 0 
                    ? `${Math.min((hrvApiData[hrvApiData.length - 1].hrv / 100) * 100, 100)}%`
                    : '75%'
                }}></div>
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