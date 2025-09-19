import React from 'react';
import { Calendar, Clock, Plus, Video, Phone, MapPin } from 'lucide-react';

const AppointmentsTab = ({ darkMode }) => {
  const appointments = [
    { id: 1, doctor: 'Dr. Sarah Smith', specialty: 'Cardiologist', date: '2024-03-18', time: '10:00 AM', type: 'In-person', status: 'confirmed' },
    { id: 2, doctor: 'Dr. Michael Johnson', specialty: 'Dermatologist', date: '2024-03-20', time: '2:30 PM', type: 'Video call', status: 'pending' },
    { id: 3, doctor: 'Dr. Emily Davis', specialty: 'General Practice', date: '2024-03-25', time: '9:15 AM', type: 'In-person', status: 'confirmed' },
    { id: 4, doctor: 'Dr. Robert Wilson', specialty: 'Orthopedic', date: '2024-03-28', time: '11:00 AM', type: 'In-person', status: 'confirmed' }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Appointments</h2>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors text-sm md:text-base">
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden md:inline">Book Appointment</span>
        </button>
      </div>

      <div className="grid gap-4 md:gap-6">
        {appointments.map((appointment) => (
          <div key={appointment.id} className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border hover:shadow-xl transition-all duration-300 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl">
                  {appointment.doctor.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className={`text-base md:text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{appointment.doctor}</h3>
                  <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{appointment.specialty}</p>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-2">
                    <div className={`flex items-center gap-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-xs md:text-sm">{appointment.date}</span>
                    </div>
                    <div className={`flex items-center gap-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      <Clock className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-xs md:text-sm">{appointment.time}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-3">
                <div className="flex flex-col items-center gap-2">
                  <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium ${
                    appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment.status}
                  </span>
                  <div className={`flex items-center gap-1 text-xs md:text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {appointment.type === 'Video call' ? <Video className="w-3 h-3 md:w-4 md:h-4" /> : <MapPin className="w-3 h-3 md:w-4 md:h-4" />}
                    <span>{appointment.type}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {appointment.type === 'Video call' && (
                    <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors">
                      <Video className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  )}
                  <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                    <Phone className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentsTab;
