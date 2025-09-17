import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Heart, Moon, Activity, Zap, Brain, Gauge, Target, TrendingUp, Calendar, Clock, Home, Users, MessageCircle, User, Plus, Phone, Video, Send, Bell, Settings, Edit3, Camera, Mail, MapPin, Award, Star, Sun } from 'lucide-react';

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [activeTab, setActiveTab] = useState('home');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Dr. Smith', message: 'Your latest test results look great! Keep up the good work with your exercise routine.', time: '2:30 PM', type: 'received' },
    { id: 2, sender: 'You', message: 'Thank you! Should I continue with the same medication dosage?', time: '2:45 PM', type: 'sent' },
    { id: 3, sender: 'Dr. Smith', message: 'Yes, continue with the current dosage. Let\'s schedule a follow-up in 2 weeks.', time: '3:00 PM', type: 'received' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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

  const appointments = [
    { id: 1, doctor: 'Dr. Sarah Smith', specialty: 'Cardiologist', date: '2024-03-18', time: '10:00 AM', type: 'In-person', status: 'confirmed' },
    { id: 2, doctor: 'Dr. Michael Johnson', specialty: 'Dermatologist', date: '2024-03-20', time: '2:30 PM', type: 'Video call', status: 'pending' },
    { id: 3, doctor: 'Dr. Emily Davis', specialty: 'General Practice', date: '2024-03-25', time: '9:15 AM', type: 'In-person', status: 'confirmed' },
    { id: 4, doctor: 'Dr. Robert Wilson', specialty: 'Orthopedic', date: '2024-03-28', time: '11:00 AM', type: 'In-person', status: 'confirmed' }
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        sender: 'You',
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'sent'
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const MetricCard = ({ icon: Icon, title, value, unit, trend, color, children }) => (
    <div className={`rounded-2xl p-6 shadow-lg transition-all duration-300 border ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
          </div>
          <div>
            <h3 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{title}</h3>
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</span>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{unit}</span>
            </div>
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-sm">
            <TrendingUp className="w-4 h-4" />
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

  const renderHome = () => (
    <div>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Current Heart Rate</p>
              <p className="text-3xl font-bold">72 BPM</p>
            </div>
            <Heart className="w-12 h-12 text-red-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Sleep Score</p>
              <p className="text-3xl font-bold">85/100</p>
            </div>
            <Moon className="w-12 h-12 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Daily Steps</p>
              <p className="text-3xl font-bold">12,340</p>
            </div>
            <Activity className="w-12 h-12 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Stress Level</p>
              <p className="text-3xl font-bold">Low</p>
            </div>
            <Brain className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.stage}</span>
                  <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.value}h</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
        <div className="space-y-6">
          <div className={`rounded-2xl p-6 shadow-lg border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-orange-500 bg-opacity-10">
                <Gauge className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Blood Pressure</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>120/80</span>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>mmHg</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                Normal Range
              </span>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className={`rounded-2xl p-6 shadow-lg border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-teal-500 bg-opacity-10">
                <Target className="w-6 h-6 text-teal-500" />
              </div>
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>HRV Score</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>45</span>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>ms</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm font-medium">
                Good Recovery
              </span>
              <div className={`w-24 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                <div className="bg-teal-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Summary */}
      <div className={`rounded-2xl p-6 shadow-lg border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-2`}>Health Summary</h3>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Great job maintaining your health metrics today! Your heart rate variability indicates good recovery, 
              and your stress levels are well-managed. Keep up the excellent sleep routine.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">A+</div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Overall Score</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Appointments</h2>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" />
          Book Appointment
        </button>
      </div>

      <div className="grid gap-6">
        {appointments.map((appointment) => (
          <div key={appointment.id} className={`rounded-2xl p-6 shadow-lg border hover:shadow-xl transition-all duration-300 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {appointment.doctor.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{appointment.doctor}</h3>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{appointment.specialty}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className={`flex items-center gap-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{appointment.date}</span>
                    </div>
                    <div className={`flex items-center gap-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{appointment.time}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment.status}
                  </span>
                  <div className={`flex items-center gap-1 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {appointment.type === 'Video call' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    <span>{appointment.type}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {appointment.type === 'Video call' && (
                    <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors">
                      <Video className="w-5 h-5" />
                    </button>
                  )}
                  <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Messages</h2>
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">3</span>
        </div>
      </div>

      <div className={`rounded-2xl shadow-lg border flex-1 flex flex-col ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <div className={`p-4 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              DS
            </div>
            <div>
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Dr. Smith</h3>
              <span className="text-sm text-green-500">Online</span>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-96">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.type === 'sent' 
                  ? 'bg-blue-500 text-white' 
                  : darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 ${
                  message.type === 'sent' ? 'text-blue-100' : darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {message.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className={`p-4 border-t ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className={`flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'border-gray-200'
              }`}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-xl transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Profile</h2>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors">
          <Edit3 className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <div className={`rounded-2xl p-6 shadow-lg border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="text-center mb-6">
              <div className="relative mx-auto w-24 h-24 mb-4">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  JD
                </div>
                <button className={`absolute bottom-0 right-0 border-2 rounded-full p-2 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                } transition-colors`}>
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>John Doe</h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Patient ID: #12345</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>john.doe@email.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>New York, NY</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Born: Jan 15, 1990</span>
              </div>
            </div>
          </div>
        </div>

        {/* Health Stats & Achievements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Health Stats */}
          <div className={`rounded-2xl p-6 shadow-lg border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Health Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">72</div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Heart Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">85</div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sleep Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">12,340</div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Daily Steps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">98%</div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Blood Oxygen</div>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className={`rounded-2xl p-6 shadow-lg border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Medical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Basic Info</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Height:</span>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-800'}>5'10" (178 cm)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Weight:</span>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-800'}>175 lbs (79 kg)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Blood Type:</span>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-800'}>O+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>BMI:</span>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-800'}>25.1</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Conditions</h4>
                <div className="space-y-2">
                  <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                    Mild Hypertension
                  </span>
                  <br />
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm mt-2">
                    Seasonal Allergies
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className={`rounded-2xl p-6 shadow-lg border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Health Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`flex items-center gap-3 p-4 rounded-xl ${
                darkMode 
                  ? 'bg-gradient-to-r from-yellow-900 to-yellow-800' 
                  : 'bg-gradient-to-r from-yellow-100 to-yellow-50'
              }`}>
                <Award className="w-8 h-8 text-yellow-600" />
                <div>
                  <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>7-Day Streak</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Daily step goal</div>
                </div>
              </div>
              <div className={`flex items-center gap-3 p-4 rounded-xl ${
                darkMode 
                  ? 'bg-gradient-to-r from-green-900 to-green-800' 
                  : 'bg-gradient-to-r from-green-100 to-emerald-100'
              }`}>
                <Star className="w-8 h-8 text-green-600" />
                <div>
                  <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Sleep Champion</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>30 days good sleep</div>
                </div>
              </div>
              <div className={`flex items-center gap-3 p-4 rounded-xl ${
                darkMode 
                  ? 'bg-gradient-to-r from-blue-900 to-blue-800' 
                  : 'bg-gradient-to-r from-blue-100 to-cyan-100'
              }`}>
                <Heart className="w-8 h-8 text-blue-600" />
                <div>
                  <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Heart Health</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Optimal HR zone</div>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className={`rounded-2xl p-6 shadow-lg border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Emergency Contacts</h3>
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-4 rounded-xl ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Sarah Doe</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Spouse</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>+1 (555) 987-6543</span>
                  <Phone className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div className={`flex items-center justify-between p-4 rounded-xl ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Dr. Sarah Smith</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Primary Care</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>+1 (555) 246-8102</span>
                  <Phone className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHome();
      case 'appointments':
        return renderAppointments();
      case 'chat':
        return renderChat();
      case 'profile':
        return renderProfile();
      default:
        return renderHome();
    }
  };

  return (
    <div className={`min-h-screen ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Navigation */}
      <nav className={`shadow-lg border-b ${
        darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HealthCare+
              </h1>
              <div className={`flex items-center gap-1 rounded-xl p-1 ${
                darkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <button
                  onClick={() => setActiveTab('home')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === 'home' 
                      ? darkMode 
                        ? 'bg-gray-700 shadow-md text-blue-400' 
                        : 'bg-white shadow-md text-blue-600' 
                      : darkMode 
                        ? 'text-gray-400 hover:text-gray-200' 
                        : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span className="font-medium">Home</span>
                </button>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === 'appointments' 
                      ? darkMode 
                        ? 'bg-gray-700 shadow-md text-blue-400' 
                        : 'bg-white shadow-md text-blue-600' 
                      : darkMode 
                        ? 'text-gray-400 hover:text-gray-200' 
                        : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Appointments</span>
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === 'chat' 
                      ? darkMode 
                        ? 'bg-gray-700 shadow-md text-blue-400' 
                        : 'bg-white shadow-md text-blue-600' 
                      : darkMode 
                        ? 'text-gray-400 hover:text-gray-200' 
                        : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">Chat</span>
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-1">3</span>
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === 'profile' 
                      ? darkMode 
                        ? 'bg-gray-700 shadow-md text-blue-400' 
                        : 'bg-white shadow-md text-blue-600' 
                      : darkMode 
                        ? 'text-gray-400 hover:text-gray-200' 
                        : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Profile</span>
                </button>
              </div>
            </div>
             <div className="flex items-center gap-4">
              {activeTab === 'home' && (
                <select 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className={`px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-white border-gray-200'
                  } border`}
                >
                  <option value="today">Today</option>
                   <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              )}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-gray-300' 
                  : 'bg-white border-gray-200 text-gray-700'
              }`}>
                <Calendar className="w-5 h-5 text-gray-500" />
                <span>March 15, 2024</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-xl border transition-colors ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-yellow-400 hover:bg-gray-700' 
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button className={`p-2 rounded-xl border transition-colors ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}>
                  <Bell className="w-5 h-5 text-gray-500" />
                </button>
                <button className={`p-2 rounded-xl border transition-colors ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}>
                  <Settings className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">{renderContent()}</main>
    </div>
  );
};

export default Dashboard;


