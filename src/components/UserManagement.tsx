"use client";

import { logout, selectAccessToken } from '@/store/authSlice';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import TableSkeleton from './skeleton/Table';
import { Menu, MenuItem, MenuProps, styled } from '@mui/material';
import { CheckCircleIcon, DownloadIcon } from '@/icons';
import CustomNoRowsOverlay from './CustomNoDataOverlay';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGaurd';
import CustomSnackbar from './CustomSnackbar';
import Search from './Search';
import { useAppDispatch } from '@/store/store';
import { useTableQueryParams } from '@/hooks/useQueryParams';
import { downloadData } from '@/utils/downloadData';
import { alpha } from '@mui/material/styles';
import { FaEye, FaRegEdit } from "react-icons/fa";
import { IoBanOutline } from "react-icons/io5";
import CreateUserModal, { UserFormData } from './CreateUserModal';
import { axiosInstance } from '@/utils/axiosInstance';

const BASE = process.env.NEXT_PUBLIC_BASE_URL;

export type UserData = {
  id: number;
  lastName: string | null;
  firstName: string | null;
  gender?: string;
  phone?: string | null;
  email?: string | null;
  status: "active" | "blocked" | string;
  userId: string;
};

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color: 'rgb(55, 65, 81)',
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
    ...theme.applyStyles('dark', {
      color: theme.palette.grey[300],
    }),
  },
}));

const UserManagement = () => {
  useAuthGuard();

  const dispatch = useAppDispatch();
  const { page, pageSize, setPage } = useTableQueryParams();

  const token = useSelector(selectAccessToken);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [userData, setUserData] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [totalRowSize, setTotalRowSize] = useState<number>(0);

  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | 'info'>('info');
  const [showAlert, setShowAlert] = useState(false);

  // Modal / edit state (keep these)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const showFeedback = (message: string, severity: 'success' | 'error' | 'info' = 'info') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setShowAlert(true);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('page', JSON.stringify(page));
    }
  }, [page]);

  // fetch users function (used by effect and after create/edit/delete)
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/api/admin/users`, {
        params: { page, limit: pageSize, ...(searchQuery && { searchText: searchQuery }) },
        headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': '69420' },
      });

      if (res.data?.success === 401) {
        const msg = res?.data?.message || 'Failed to load users';
        showFeedback(msg, 'error');
      }

      const data = res.data.data || [];
      setTotalRowSize(res.data.pageMeta?.total || 0);

      const formatted: UserData[] = data.map((user: any, index: number) => ({
        id: (page - 1) * pageSize + index + 1,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        gender: user.gender,
        phone: user.phone || '',
        email: user.email || '',
        status: (user.status || '').toLowerCase(),
        userId: user._id,
      }));

      setUserData(formatted);
    } catch (error: any) {
      if (error instanceof Object && 'status' in error && (error as any).status === 401) {
        dispatch(logout());
      }
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Failed to fetch users:', errorMessage);
      showFeedback(`Failed to load users: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token, page, pageSize, searchQuery, dispatch]);

  const statusHandler = async (id: string, status: string) => {
    if (!token) {
      console.error('No auth token!');
      return;
    }
    try {
      const res = await axios.patch(`${BASE}/api/admin/users/${id}/status?action=${status}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': '69420',
          'Content-Type': 'application/json',
        },
      });

      if (res.status !== 200) {
        const msg = res?.data?.message || 'Failed to update the status';
        showFeedback(msg, 'error');
      }

      setUserData((prev) => prev.map((user) =>
        user.userId === id
          ? { ...user, status: res.data.user.status?.toLowerCase() }
          : user
      ));

      showFeedback(res.data.message, 'success');
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Failed to update status:', errorMessage);
      showFeedback(`Failed to update status: ${errorMessage}`, 'error');
    }
  };

  const filteredData = userData.filter((row) => {
    const search = searchQuery.toLowerCase();
    return (
      row.firstName?.toLowerCase().includes(search) ||
      row.lastName?.toLowerCase().includes(search) ||
      row.phone?.toLowerCase().includes(search) ||
      row.status.toLowerCase().includes(search) ||
      String(row.id).includes(search)
    );
  });

  const viewHandler = (id: string) => router.push(`/users/${id}`);

  // open create modal — now only opens modal; modal component will handle submit
  const openCreateModal = () => {
    setIsEditing(false);
    setEditingUserId(null);
    setIsModalOpen(true);
  };

  // open edit modal — just set editing id and open the modal; the modal component can fetch details or accept initial data
  const openEditModal = (userId: string) => {
    setIsEditing(true);
    setEditingUserId(userId);
    setIsModalOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await axios.delete(`${BASE}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': '69420' },
      });
      showFeedback(res.data?.message || 'User deleted', 'success');
      fetchUsers();
    } catch (error: any) {
      console.error('Delete failed', error);
      showFeedback('Failed to delete user', 'error');
    }
  };

  const createUser = async (form: UserFormData) => {
    const fd = new FormData();

    // make sure we never pass `undefined` to append
    fd.append("firstName", form.firstName ?? "");
    fd.append("lastName", form.lastName ?? "");
    fd.append("phone", form.mobileNumber ?? "");
    fd.append("email", form.email ?? "");
    fd.append("pan", form.panNumber ?? "");
    fd.append("name", form.fullName ?? `${form.firstName ?? ""} ${form.lastName ?? ""}`.trim());
    fd.append("dob", form.dob ?? "");
    fd.append("bankPhone", form.phoneNumber ?? "");

    // append file only when it is a File
    if (form.image instanceof File) {
      fd.append("profilePic", form.image);
    }

    const res = await axiosInstance.post("/api/admin/user/create", fd, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  };

  const handleEditUser = async (data: UserFormData) => {
    if (!editingUserId) return;
    try {
      const fd = new FormData();
      fd.append('firstName', data.firstName ?? '');
      fd.append('lastName', data.lastName ?? '');
      fd.append('phone', data.mobileNumber ?? '');
      fd.append('email', data.email ?? '');
      fd.append('bankAccountNumber', data.accountNumber ?? '');
      fd.append('bankName', data.bankName ?? '');
      fd.append('panNumber', data.panNumber ?? '');
      fd.append('dob', data.dob ?? '');

      if (data.image instanceof File) {
        // backend may expect field name 'profilePic' or 'image' — use whichever your API expects
        fd.append('profilePic', data.image);
      }

      const res = await axios.put(`${BASE}/api/admin/users/${editingUserId}`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': '69420',
          'Content-Type': 'multipart/form-data',
        },
      });

      showFeedback(res.data?.message || 'User updated', 'success');
      fetchUsers();
    } catch (err: any) {
      console.error('Update user failed', err);
      showFeedback('Failed to update user', 'error');
    } finally {
      setIsModalOpen(false);
      setEditingUserId(null);
      setIsEditing(false);
    }
  };


  const handleSearch = useCallback((query: string) => setSearchQuery(query), []);

  const totalPages = Math.max(1, Math.ceil(totalRowSize / pageSize));

  return (
    <div>
      <header className="flex items-center justify-between mb-4">
        <h1 className="font-semibold text-lg">User Management</h1>
        <div className="flex items-center gap-2">
          <Search onSearch={handleSearch} />

          <div className="flex items-center gap-2">
            <button
              onClick={openCreateModal}
              className="px-3 py-1.5 rounded-xs bg-[#1976d2] text-white text-sm"
            >
              Create User
            </button>

            <div className="relative">
              <button
                onClick={handleClick}
                aria-controls={open ? 'export-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-md text-sm bg-white dark:bg-slate-800"
              >
                Export
                <DownloadIcon />
              </button>

              <StyledMenu
                id="export-menu"
                aria-labelledby="demo-customized-button"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
              >
                <MenuItem onClick={() => downloadData({ context: 'users', format: 'pdf' })} disableRipple>
                  PDF
                </MenuItem>
                <MenuItem onClick={() => downloadData({ context: 'users', format: 'csv' })} disableRipple>
                  Excel
                </MenuItem>
              </StyledMenu>
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="w-full overflow-hidden">
          <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-md shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SL No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center">
                      <CustomNoRowsOverlay />
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => (
                    <tr key={row.userId} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-slate-200">{row.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-slate-200">{row.firstName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-slate-200">{row.lastName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-slate-200">{row.gender}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-slate-200">{row.phone}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-slate-200">{row.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${row.status === 'active' ? 'bg-green-50 text-green-700' : row.status === 'blocked' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
                          }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            aria-label="view"
                            onClick={() => viewHandler(row.userId)}
                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
                            title="View user"
                          >
                            <FaEye size={20} color='#465fff' />
                          </button>

                          <button
                            aria-label="approve"
                            disabled={row.status === 'active'}
                            onClick={() => statusHandler(row.userId, 'unblock')}
                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40"
                            title="Approve"
                          >
                            <CheckCircleIcon color='#465fff' />
                          </button>

                          <button
                            aria-label="edit"
                            onClick={() => openEditModal(row.userId)}
                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
                            title="Edit"
                          >
                            <FaRegEdit size={20} color='#465fff' />
                          </button>

                          <button
                            aria-label="block"
                            disabled={row.status === 'blocked'}
                            onClick={() => statusHandler(row.userId, 'block')}
                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40"
                            title="Block"
                          >
                            <IoBanOutline size={20} color='#465fff' />
                          </button>

                          <button
                            aria-label="delete"
                            onClick={() => handleDelete(row.userId)}
                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 text-red-600"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-900">
            <div className="text-sm text-gray-700 dark:text-slate-300">
              Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(page * pageSize, totalRowSize)}</span> of <span className="font-medium">{totalRowSize}</span> results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-3 py-1 rounded-md border bg-white dark:bg-slate-800 disabled:opacity-40"
              >
                Prev
              </button>
              <div className="text-sm text-gray-700 dark:text-slate-300">Page {page} of {totalPages}</div>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 rounded-md border bg-white dark:bg-slate-800 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for create/edit */}
      {isModalOpen && (
        <CreateUserModal open={isModalOpen}
          onOpenChange={(val) => setIsModalOpen(val)}
          // onSubmit={handleCreateOrEditFromModal}
          onSubmit={createUser} />
      )}

      <CustomSnackbar
        open={showAlert}
        message={alertMessage}
        severity={alertSeverity}
        onClose={() => setShowAlert(false)}
      />
    </div>
  );
};

export default UserManagement;
