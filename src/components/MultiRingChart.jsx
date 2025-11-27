import React from 'react';
import { Activity, Footprints, Flame, Clock } from 'lucide-react';

// Utility function to calculate the dash offset for a given percentage and circumference
const calculateOffset = (percentage, circumference) => {
  return circumference - (percentage / 100) * circumference;
};

const MultiRingChart = ({ data, darkMode = false }) => {
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
  
  return (
    <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className={`font-semibold text-base md:text-lg ${
          darkMode ? 'text-gray-200' : 'text-gray-800'
        }`}>
          Activity Summary
        </h3>
        <p className={`text-xs md:text-sm ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
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
            {data.map((item, index) => {
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
            <div className={`text-3xl md:text-4xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {Math.round(data.reduce((acc, item) => acc + item.percentage, 0) / data.length)}%
            </div>
            <div className={`text-xs md:text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Overall
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="flex-1 w-full grid grid-cols-2 gap-3 md:gap-4">
          {data.map((item, index) => {
            const Icon = icons[index];
            return (
              <div 
                key={item.id} 
                className={`rounded-lg md:rounded-xl p-4 md:p-5 border transition-all hover:shadow-md ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-650' 
                    : 'bg-gradient-to-br from-gray-50 to-white border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                  <div className={`p-2 rounded-lg ${colors[index].replace('text-', 'bg-')}/20`}>
                    <Icon className={`w-4 h-4 md:w-5 md:h-5 ${colors[index]}`} />
                  </div>
                  <span className={`text-xs md:text-sm font-medium ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {item.label}
                  </span>
                </div>
                <p className={`text-xl md:text-2xl font-bold mb-1 ${
                  darkMode ? 'text-white' : 'text-gray-900'
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
                  <span className={`text-xs font-medium ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {item.percentage}%
                  </span>
                </div>
                <p className={`text-xs mt-1 ${
                  darkMode ? 'text-gray-500' : 'text-gray-400'
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

export default MultiRingChart;
