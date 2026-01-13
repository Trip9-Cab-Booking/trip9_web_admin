'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectAccessToken } from '@/store/authSlice';
import Link from "next/link";
import StatusBadge from './ui/badge/StatusBadge';

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
  // const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const token = useSelector(selectAccessToken);
  // States
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // dates
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);

  // payment & status
  //removed card and NetBanking
  const paymentOptions = ['Cash', 'UPI', 'Wallet'];
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);

  const statusOptions = ['Accepted', 'Completed', 'Cancelled', 'Ongoing', 'Requested'];
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // helpers
  const toggleMulti = (list: string[], setList: (v: string[]) => void, value: string) => {
    if (list.includes(value)) setList(list.filter((x) => x !== value));
    else setList([...list, value]);
  };

  const resetFilters = () => {
    setSearchText('');
    setDateFrom(null);
    setDateTo(null);
    setSelectedPayments([]);
    setSelectedStatuses([]);
    setCurrentPage(1);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    const filters = {
      q: searchText || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      payments: selectedPayments.length ? selectedPayments : undefined,
      statuses: selectedStatuses.length ? selectedStatuses : undefined,
    };
    console.log('apply', filters);
  };

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
        if (searchText) params.append('searchText', searchText);
        if (dateFrom) params.append('startDate', dateFrom);
        if (dateTo) params.append('endDate', dateTo);

        if (selectedPayments.length) {
          params.append('payments', selectedPayments.join(','));
        }

        if (selectedStatuses.length) {
          const statusesCsv = selectedStatuses.map(s => s.toLowerCase()).join(',');
          params.append('status', statusesCsv);
        } else if (statusFilter) {
          params.append('status', statusFilter.toLowerCase());
        }

        params.append('page', currentPage.toString());
        params.append('limit', '5');

        const apiUrl = `${BASE}/api/admin/rides?${params.toString()}`;
        console.debug('Fetching rides URL:', apiUrl);

        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': '69420',
          },
        });

        console.debug('rides response.data:', response.data);
        const payload = response.data ?? {};
        const ridesList = Array.isArray(payload.data) ? payload.data : [];
        const pageMeta = payload.pageMeta ?? payload.meta ?? payload.pagination ?? {};
        let totalPagesFromApi = pageMeta.totalPages ?? pageMeta.total_pages ?? null;
        if (!totalPagesFromApi) {
          const totalCount = pageMeta.total ?? null;
          const limit = Number(params.get('limit')) || 10;
          if (totalCount != null) {
            totalPagesFromApi = Math.max(1, Math.ceil(Number(totalCount) / limit));
          }
        }

        if (!totalPagesFromApi || Number.isNaN(Number(totalPagesFromApi))) {
          totalPagesFromApi = 1;
        }

        setRides(ridesList);
        setTotalPages(Number(totalPagesFromApi));
        if (payload.success === false) {
          setError(payload.message || 'Failed to fetch rides data.');
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
  }, [
    token,
    searchText,
    currentPage,
    dateFrom,
    dateTo,
    selectedPayments,
    selectedStatuses,
    statusFilter,
  ]);

  useEffect(() => {
    const handleDropdownClick = (event: MouseEvent) => {
      if (showPaymentDropdown) {
        const target = event.target as HTMLElement;
        if (!target.closest('.relative') && !target.closest('[data-dropdown="payment"]')) {
          setShowPaymentDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleDropdownClick);
    return () => document.removeEventListener('mousedown', handleDropdownClick);
  }, [showPaymentDropdown]);

  const totalTableColumns = 10;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen font-inter">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">Ride Management</h1>
      <div className="bg-white dark:bg-gray-900 border rounded-xl p-3 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {/* Left group: search + date range */}
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <div className='flex gap-4 w-full'>
              <div className="relative flex-2 w-1/2">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" /></svg>
                </span>
                <input
                  type="search"
                  placeholder="Search user or driver"
                  value={searchText}
                  onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <label className="sr-only">From</label>
                  <input
                    type="date"
                    value={dateFrom ?? ''}
                    onChange={(e) => setDateFrom(e.target.value || null)}
                    className="px-2 py-1 border rounded-md text-sm focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <span className="text-gray-300">—</span>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <label className="sr-only">To</label>
                  <input
                    type="date"
                    value={dateTo ?? ''}
                    onChange={(e) => setDateTo(e.target.value || null)}
                    className="px-2 py-1 border rounded-md text-sm focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>
            </div>

            <div className='w-full flex gap-10 justify-center'>
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <div className="relative">
                  <button
                    onClick={() => setShowPaymentDropdown((v) => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 border text-sm shadow-sm hover:shadow focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.567-3 3.5S10.343 15 12 15s3-1.567 3-3.5S13.657 8 12 8zM12 3v2M12 19v2" /></svg>
                    <span className="text-xs">{selectedPayments.length ? `${selectedPayments.length} selected` : 'Payment'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  {showPaymentDropdown && (
                    <div data-dropdown="payment" className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-900 border rounded-lg shadow-lg z-20 p-2">
                      {paymentOptions.map((opt) => (
                        <label key={opt} className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-gray-50 rounded cursor-pointer">
                          <input type="checkbox" checked={selectedPayments.includes(opt)} onChange={() => toggleMulti(selectedPayments, setSelectedPayments, opt)} />
                          <span className="ml-1">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status compact pills */}
                <div className="flex gap-1 items-center">
                  {statusOptions.slice(0, 4).map((s) => {
                    const active = selectedStatuses.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => toggleMulti(selectedStatuses, setSelectedStatuses, s)}
                        className={`px-2 py-1 text-xs rounded-full border ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-white border-gray-200'}`}
                      >
                        {s}
                      </button>
                    );
                  })}
                  {/* more dropdown for remaining statuses if any */}
                  {statusOptions.length > 4 && (
                    <div className="relative">
                      <button onClick={() => setShowStatusDropdown((v) => !v)} className="px-2 py-1 text-xs rounded-full border bg-white dark:bg-gray-900 border-gray-200">More</button>
                      {showStatusDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border rounded-lg shadow-lg z-20 p-2">
                          {statusOptions.map((s) => (
                            <label key={s} className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-gray-50 rounded">
                              <input type="checkbox" checked={selectedStatuses.includes(s)} onChange={() => toggleMulti(selectedStatuses, setSelectedStatuses, s)} />
                              <span className="ml-1">{s}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button onClick={resetFilters} className="px-3 py-1 text-xs rounded-lg border bg-white dark:bg-gray-900 hover:bg-gray-50">Reset</button>
                  <button onClick={applyFilters} className="px-3 py-1 text-xs rounded-lg bg-indigo-600 text-white shadow-sm">Apply</button>
                </div>
              </div>
            </div>
          </div>
        </div>
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
          <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg overflow-auto max-h-[55vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-400/50 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600/50 scrollbar-thin">
            <table className="min-w-full w-full text-sm table-fixed divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Vehicle</th>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Pickup</th>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Drop</th>
                  <th className="px-3 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Fare</th>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">User Name</th>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Driver Name</th>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Cancellation</th>
                  <th className="px-3 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Rating</th>
                  <th className="px-3 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {rides.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No ride data found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  rides.map((ride) => (
                    <tr key={ride._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="w-20 px-3 py-4 truncate max-w-20 font-medium text-gray-900 dark:text-gray-100">
                        {ride.rideDetails.vehicleType} ({ride.rideDetails.vehicleCategory})
                      </td>
                      <td className="w-36 px-3 py-4 max-w-36 truncate text-gray-900 dark:text-gray-100">
                        {ride.rideDetails.pickupLocation.address}
                      </td>
                      <td className="w-36 px-3 py-4 max-w-36 truncate text-gray-900 dark:text-gray-100">
                        {ride.rideDetails.dropLocation.address}
                      </td>
                      <td className="w-16 px-3 py-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                        ₹{ride.rideDetails.estimatedFare}
                      </td>
                      <td className="w-28 px-3 py-4 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        {ride.userDetails.firstName} {ride.userDetails.lastName}
                      </td>
                      <td className="w-28 px-3 py-4 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        {ride.driverDetails.firstName} {ride.driverDetails.lastName}
                      </td>
                      <td className="capitalize">
                        <StatusBadge status={ride.rideDetails.status} />
                      </td>
                      <td className="px-3 py-4 text-sm">
                        <span className="text-gray-900 dark:text-gray-100 font-medium text-xs">
                          {new Date(ride.rideDetails.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        {ride.rideDetails.status === 'cancelled'
                          ? <span className="text-sm text-gray-700 dark:text-gray-300 block truncate">{`${ride.rideDetails.cancelledBy ?? 'N/A'} - ${ride.rideDetails.cancellationReason ?? 'No reason'}`}</span>
                          : <span className="text-gray-400 dark:text-gray-500">—</span>
                        }
                      </td>
                      <td className="w-20 px-3 py-4 text-center">
                        {ride.driverDetails.ratingStats
                          ? <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">{`${ride.driverDetails.ratingStats.average.toFixed(1)} ⭐ (${ride.driverDetails.ratingStats.totalRidesRated})`}</span>
                          : <span className="text-gray-400 dark:text-gray-500">N/A</span>
                        }
                      </td>
                      <td className="w-20 px-3 py-4 text-center">
                        <Link
                          href={`/ride-management/${ride._id}`}
                          aria-label={`View ride ${ride._id}`}
                          className="inline-block px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:border-blue-400 dark:hover:border-blue-400 transition-colors"
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