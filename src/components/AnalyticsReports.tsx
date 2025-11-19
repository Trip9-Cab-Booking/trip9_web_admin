'use client';

import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { MapPin, Star } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const rideTrends = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Rides',
      data: [120, 150, 90, 180, 200, 300, 250],
      backgroundColor: '#3b82f6',
      borderColor: '#1d4ed8',
      borderWidth: 2,
    },
  ],
};

const peakHours = {
  labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
  datasets: [
    {
      label: 'Ride Count',
      data: [30, 70, 40, 60, 120, 100],
      fill: false,
      borderColor: '#10b981',
      backgroundColor: '#34d399',
      tension: 0.3,
    },
  ],
};

const topLocations = ['Downtown', 'Airport', 'Mall', 'Tech Park', 'Central Station'];

const drivers = [
  { name: 'Amit Verma', rating: 4.9, rides: 340 },
  { name: 'Sara Khan', rating: 4.8, rides: 280 },
  { name: 'John Doe', rating: 4.7, rides: 260 },
];

export default function AnalyticsReportsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-blue-900 text-center">📊 Analytics & Reports</h1>

        {/* Ride Trends Chart */}
        <section className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">Weekly Ride Trends</h2>
          <Bar data={rideTrends} />
        </section>

        {/* Peak Hours Line Chart */}
        <section className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <h2 className="text-2xl font-semibold text-green-800 mb-4">Peak Hours</h2>
          <Line data={peakHours} />
        </section>

        {/* Top Locations */}
        <section className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <h2 className="text-2xl font-semibold text-purple-800 mb-4">Top Ride Locations</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {topLocations.map((loc, i) => (
              <div key={i} className="bg-purple-50 border border-purple-200 p-4 rounded-xl flex items-center gap-3 shadow-sm">
                <MapPin className="text-purple-600" />
                <span className="text-purple-700 font-medium">{loc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Driver Performance */}
        <section className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <h2 className="text-2xl font-semibold text-yellow-700 mb-4">Top Performing Drivers</h2>
          <ul className="divide-y">
            {drivers.map((d, idx) => (
              <li key={idx} className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold text-yellow-800">{d.name}</p>
                  <p className="text-sm text-gray-500">{d.rides} rides</p>
                </div>
                <div className="flex items-center gap-1 text-yellow-500 font-bold">
                  <Star className="w-5 h-5" /> {d.rating}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}


