"use client";

import { logout, selectAccessToken } from '@/store/authSlice';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import TableSkeleton from './skeleton/Table';
import { Button, Menu, MenuItem, MenuProps, styled } from '@mui/material';
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
import { FaEye , FaRegEdit, FaBan } from "react-icons/fa";
import { IoBanOutline } from "react-icons/io5";

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

  // Create/Edit/Delete modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const initialForm = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    image: null as File | null,
    bankAccountNumber: '',
    bankName: '',
    panNumber: '',
    dob: '',
  };
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

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

  // open create modal
  const openCreateModal = () => {
    setIsEditing(false);
    setEditingUserId(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  // open edit modal and populate form
  const openEditModal = async (userId: string) => {
    setIsEditing(true);
    setEditingUserId(userId);
    setIsModalOpen(true);
    try {
      const res = await axios.get(`${BASE}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': '69420' },
      });
      const user = res.data.data;
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        email: user.email || '',
        image: null,
        bankAccountNumber: user.bankAccountNumber || '',
        bankName: user.bankName || '',
        panNumber: user.panNumber || '',
        dob: user.dob || '',
      });
    } catch (error: any) {
      console.error('Failed to fetch user for edit', error);
      showFeedback('Failed to fetch user details', 'error');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await axios.delete(`${BASE}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': '69420' },
      });
      showFeedback(res.data?.message || 'User deleted', 'success');
      // refresh
      fetchUsers();
    } catch (error: any) {
      console.error('Delete failed', error);
      showFeedback('Failed to delete user', 'error');
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    setForm((prev) => ({ ...prev, image: file || null }));
  };

  const submitForm = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form.firstName || !form.lastName || !form.phone || !form.email) {
      showFeedback('Please fill required fields', 'error');
      return;
    }
    setSubmitting(true);
    try {
      let res;
      // use FormData if image present or bank details
      const useFormData = !!form.image;
      if (isEditing && editingUserId) {
        if (useFormData) {
          const fd = new FormData();
          fd.append('firstName', form.firstName);
          fd.append('lastName', form.lastName);
          fd.append('phone', form.phone);
          fd.append('email', form.email);
          if (form.image) fd.append('image', form.image);
          if (form.bankAccountNumber) fd.append('bankAccountNumber', form.bankAccountNumber);
          if (form.bankName) fd.append('bankName', form.bankName);
          if (form.panNumber) fd.append('panNumber', form.panNumber);
          if (form.dob) fd.append('dob', form.dob);
          res = await axios.put(`${BASE}/api/admin/users/${editingUserId}`, fd, {
            headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': '69420', 'Content-Type': 'multipart/form-data' },
          });
        } else {
          res = await axios.put(`${BASE}/api/admin/users/${editingUserId}`, {
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone,
            email: form.email,
            bankAccountNumber: form.bankAccountNumber,
            bankName: form.bankName,
            panNumber: form.panNumber,
            dob: form.dob,
          }, { headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': '69420' } });
        }
        showFeedback(res.data?.message || 'User updated', 'success');
      } else {
        if (useFormData) {
          const fd = new FormData();
          fd.append('firstName', form.firstName);
          fd.append('lastName', form.lastName);
          fd.append('phone', form.phone);
          fd.append('email', form.email);
          if (form.image) fd.append('image', form.image);
          if (form.bankAccountNumber) fd.append('bankAccountNumber', form.bankAccountNumber);
          if (form.bankName) fd.append('bankName', form.bankName);
          if (form.panNumber) fd.append('panNumber', form.panNumber);
          if (form.dob) fd.append('dob', form.dob);
          res = await axios.post(`${BASE}/api/admin/users`, fd, {
            headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': '69420', 'Content-Type': 'multipart/form-data' },
          });
        } else {
          res = await axios.post(`${BASE}/api/admin/users`, {
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone,
            email: form.email,
            bankAccountNumber: form.bankAccountNumber,
            bankName: form.bankName,
            panNumber: form.panNumber,
            dob: form.dob,
          }, { headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': '69420' } });
        }
        showFeedback(res.data?.message || 'User created', 'success');
      }

      // close and refresh
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Submit failed', error);
      showFeedback('Failed to submit user', 'error');
    } finally {
      setSubmitting(false);
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          row.status === 'active' ? 'bg-green-50 text-green-700' : row.status === 'blocked' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
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
                           <IoBanOutline size={20} color='#465fff'/>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-lg w-full max-w-2xl p-6 z-10">
            <h2 className="text-lg font-semibold mb-4">{isEditing ? 'Edit User' : 'Create User'}</h2>
            <form onSubmit={submitForm} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name *</label>
                  <input name="firstName" value={form.firstName} onChange={handleFormChange} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name *</label>
                  <input name="lastName" value={form.lastName} onChange={handleFormChange} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mobile Number *</label>
                  <input name="phone" value={form.phone} onChange={handleFormChange} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email ID *</label>
                  <input name="email" value={form.email} onChange={handleFormChange} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Image (optional)</label>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">DOB (optional)</label>
                  <input type="date" name="dob" value={form.dob} onChange={handleFormChange} className="w-full border rounded px-3 py-2" />
                </div>
              </div>

              <div className="mt-2">
                <h3 className="font-medium">Bank Details (optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Account Number</label>
                    <input name="bankAccountNumber" value={form.bankAccountNumber} onChange={handleFormChange} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Bank Name</label>
                    <input name="bankName" value={form.bankName} onChange={handleFormChange} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">PAN Number</label>
                    <input name="panNumber" value={form.panNumber} onChange={handleFormChange} className="w-full border rounded px-3 py-2" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-2 rounded border">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-blue-600 text-white">{submitting ? 'Saving...' : isEditing ? 'Update User' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
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
