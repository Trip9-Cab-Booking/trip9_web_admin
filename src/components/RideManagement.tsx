'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectAccessToken } from '@/store/authSlice';
import Link from "next/link";

type Ride = {
  _id: string;
  rideDetails: {
    vehicleType: string;
    vehicleCategory: string;
    status: string;
    estimatedFare: number;
    pickupLocation: { address: string };
    dropLocation: { address: string };
    createdAt: string;
    cancellationReason?: string;
    cancelledBy?: string;
  };
  userDetails: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  driverDetails: {
    firstName: string;
    lastName: string;
    phone: string;
    ratingStats?: {
      totalScore: number;
      totalRidesRated: number;
      average: number;
    };
  };
};

const BASE = process.env.NEXT_PUBLIC_BASE_URL;

export default function RideListPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const token = useSelector(selectAccessToken);

  useEffect(() => {
    const fetchRides = async () => {
      setLoading(true);
      setError(null);

      if (!token) {
        setError('Authentication token is missing. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('searchTerm', searchTerm);
        if (statusFilter) params.append('status', statusFilter);
        params.append('page', currentPage.toString());
        params.append('limit', '10');

        const apiUrl = `${BASE}/api/admin/rides?${params.toString()}`;

        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': '69420',
          },
        });

        if (response.data.success !== false) {
          setRides(response.data.data || []);
          setTotalPages(response.data.totalPages || 10);
        } else {
          setError(response.data?.message || 'Failed to fetch rides data.');
          setRides([]);
        }
      } catch (err) {
        console.error('Failed to fetch rides:', err);
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Network error or server issue.');
        } else {
          setError('An unexpected error occurred.');
        }
        setRides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, [token, searchTerm, statusFilter, currentPage]);

  const totalTableColumns = 12;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-inter">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Ride Management</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="accepted">Accepted</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="ongoing">Ongoing</option>
          <option value="requested">Requested</option>
        </select>

        <input
          type="text"
          placeholder="Search by name (user or driver)..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); 
          }}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm w-full sm:w-64 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 text-gray-500">
          <p>Loading ride data...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-48 text-red-600">
          <p>Error: {error}</p>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full table-auto text-sm divide-y divide-gray-200">
              <thead className="bg-gray-200">
                <tr>
                  {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Ride Id</th> */}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Vehicle</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Pickup</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Drop</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Fare</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">User Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Driver Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Cancellation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rides.length === 0 ? (
                  <tr>
                    <td colSpan={totalTableColumns} className="text-center py-4 text-gray-500">
                      No ride data found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  rides.map((ride) => (
                    <tr key={ride._id} className="hover:bg-gray-50">
                      {/* <td className="px-4 py-3">{ride._id}</td> */}
                      <td className="px-4 py-3">{ride.rideDetails.vehicleType} ({ride.rideDetails.vehicleCategory})</td>
                      <td className="px-4 py-3">{ride.rideDetails.pickupLocation.address}</td>
                      <td className="px-4 py-3">{ride.rideDetails.dropLocation.address}</td>
                      <td className="px-4 py-3">₹{ride.rideDetails.estimatedFare}</td>
                      <td className="px-4 py-3">{ride.userDetails.firstName} {ride.userDetails.lastName}</td>
                      <td className="px-4 py-3">{ride.driverDetails.firstName} {ride.driverDetails.lastName}</td>
                      <td className="px-4 py-3 capitalize">{ride.rideDetails.status}</td>
                      <td className="px-4 py-3">{new Date(ride.rideDetails.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        {ride.rideDetails.status === 'cancelled'
                          ? `${ride.rideDetails.cancelledBy ?? 'N/A'} - ${ride.rideDetails.cancellationReason ?? 'No reason'}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {ride.driverDetails.ratingStats
                          ? `${ride.driverDetails.ratingStats.average.toFixed(1)} ⭐ (${ride.driverDetails.ratingStats.totalRidesRated})`
                          : 'N/A'}
                      </td>
                       <td className="px-4 py-3">
                       <Link
  href={`/ride-management/${ride._id}`}
  aria-label={`View ride ${ride._id}`}
  className="inline-block px-3 py-1 text-sm font-medium border rounded-md hover:bg-gray-100"
>
  View
</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        {/* Pagination Controls */}
<div className="mt-6 flex justify-center items-center space-x-2">
  <button
    onClick={() => handlePageChange(currentPage - 1)}
    disabled={currentPage === 1}
    className="px-4 py-2 border rounded-md disabled:opacity-50"
  >
    Previous
  </button>
  <span className="mx-2 text-sm text-gray-700">
    Page {currentPage} of {totalPages}
  </span>
  <button
    onClick={() => handlePageChange(currentPage + 1)}
    disabled={currentPage === totalPages}
    className="px-4 py-2 border rounded-md disabled:opacity-50"
  >
    Next
  </button>
</div>

        </>
      )}
    </div>
  );
}
