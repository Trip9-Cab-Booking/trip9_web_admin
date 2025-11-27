'use client';
import { logout, selectAccessToken } from '@/store/authSlice';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Paper from '@mui/material/Paper';
import TableSkeleton from './skeleton/Table';
import { alpha, Button, IconButton, Menu, MenuItem, MenuProps, styled } from '@mui/material';
import { CheckCircleIcon, DownloadIcon } from '@/icons';
import CustomNoRowsOverlay from './CustomNoDataOverlay';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGaurd';
import CustomSnackbar from './CustomSnackbar';
import Search from './Search';
import { useTableQueryParams } from '@/hooks/useQueryParams';
import { downloadData } from '@/utils/downloadData';
import { FaEye } from "react-icons/fa";
import { IoBanOutline } from "react-icons/io5";
import { RxCrossCircled } from "react-icons/rx";

const BASE = process.env.NEXT_PUBLIC_BASE_URL;

export type Data = {
  id: number;
  lastName: string | null;
  firstName: string | null;
  gender: string | null;
  address: string | null;
  phone: string | null;
  status: string ;
  driverId: string;
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

const DriverManagement = () => {
    useAuthGuard();
    const dispatch = useDispatch();

    const {
        page,
        pageSize,
        setPage,
      } = useTableQueryParams();
  const token = useSelector(selectAccessToken);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [userData, setUserData] = useState<Data[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
      const [alertMessage, setAlertMessage] = useState("");
      const [alertSeverity, setAlertSeverity] = useState<"success" | "error" | "info">("info");
      const [showAlert, setShowAlert] = useState(false);
      const [totalRowSize, setTotalRowSize] = useState<number>(0);

      const showFeedback = (message: string, severity: "success" | "error" | "info" = "info") => {
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

  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE}/api/admin/drivers`, {
            params: {
                page:page,
                limit: pageSize,
                ...(searchQuery && { searchText: searchQuery }),
              },
          headers: {
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': '69420',
          },
        });

        if (res.data.success === 401) {
            console.log("logout for 401");
            dispatch(logout());
        }

        const data = res.data.data;
        setTotalRowSize(res.data.pageMeta.total);

        // Transform API data to Data[] structure
        const formatted: Data[] = data.map((driver: { firstName?: string; lastName?: string; gender?: string; address?: string;phone?: string; status?: string; _id: string }, index: number) => ({
          id:(page - 1) * pageSize + index + 1,
          firstName: driver.firstName || '',
          lastName: driver.lastName || '',
          gender: driver.gender,
          address: driver.address || '',
          phone: driver.phone || '',
          status: driver.status?.toLowerCase() || 'pending',
          driverId: driver._id,
        }));

        setUserData(formatted);
        showFeedback(res.data.message, "success");
      } catch (error) {
        if (error instanceof Object && 'status' in error && (error as any).status === 401) {
                console.log("logout for 401");
                dispatch(logout());
            }
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Failed to update status:", errorMessage);
        showFeedback(`Failed to update status: ${errorMessage}`, "error");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchDrivers();
  }, [token, page, pageSize, searchQuery, dispatch]);

  const viewHandler = (id: string) => {
    router.push(`/drivers/${id}`);
  }

  const statusHandler = async (id: string, status: string) => {
    if (!token) {
      console.error("No auth token!");
      return;
    }
    try {
      const res = await axios.patch(
        `${BASE}/api/admin/drivers/update-status/${id}?status=${status}`,
        {}, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "69420",
            "Content-Type": "application/json",
          },
        }
      );

      if(!res.data.success){
        const msg = res?.data?.message || "Failed to update the status";
        showFeedback(msg, "error");
      }

      setUserData(userData.map(driver =>
        driver.driverId === id
          ? { ...driver, status: res.data.data.status?.toLowerCase() }
          : driver
      ));
      showFeedback(res.data.message, "success");
      console.log("Status updated:", res.data.data);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Failed to update status:", errorMessage);
        showFeedback(`Failed to update status: ${errorMessage}`, "error");
    }
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const statusBadgeClasses = (status?: string) => {
    if (!status) return 'text-gray-700 bg-gray-100 border-gray-200';
    switch (status.toLowerCase()) {
      case 'approved':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-800 bg-yellow-50 border-yellow-200';
      case 'rejected':
      case 'blocked':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const canPrev = page > 1;
  const canNext = page * pageSize < totalRowSize;

  const handlePrev = () => {
    if (canPrev) setPage(page - 1);
  };
  const handleNext = () => {
    if (canNext) setPage(page + 1);
  };

  return (
    <div>
      <header className='flex items-center justify-between mb-4'>
        <h1 className='font-semibold'>Driver Management</h1>
        <div className='flex items-center gap-2'>
        <Search onSearch={handleSearch}/>
        <Button
            id="demo-customized-button"
            aria-controls={open ? 'demo-customized-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            variant="outlined"
            disableElevation
            onClick={handleClick}
            endIcon={<DownloadIcon />}
        >
            Export
        </Button>
        </div>
        <StyledMenu
            id="demo-customized-menu"
            aria-labelledby="demo-customized-button"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
        >
            <MenuItem onClick={() => downloadData({ context: 'drivers', format: 'pdf' })} disableRipple>
                PDF
            </MenuItem>
            <MenuItem onClick={() => {
                downloadData({ context: 'drivers', format: 'csv' });
            }} disableRipple>
                Excel
            </MenuItem>
        </StyledMenu>
      </header>

      {
        (loading) ? <TableSkeleton /> : (
            <div className="w-full overflow-auto">
              <Paper
                elevation={0}
                sx={{ width: '95%', height: "100%", overflow: 'hidden',backgroundColor: "transparent" }}
              >
                <div className="min-w-full">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SL No</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First name</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last name</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {userData.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-500">
                            <CustomNoRowsOverlay />
                          </td>
                        </tr>
                      ) : (
                        userData.map((row) => (
                          <tr key={row.driverId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{row.id}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{row.firstName}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{row.lastName}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{row?.gender || '-'}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{row.phone || '-'}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 max-w-xs truncate">{row.address || '-'}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadgeClasses(row.status)}`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center justify-center space-x-1">
                                <IconButton
                                  aria-label='view'
                                  size="small"
                                  onClick={() => viewHandler(row.driverId)}
                                  color='info'
                                 sx={{
                                  ":hover": {
                                    backgroundColor: "lightgray",
                                    color: "darkcyan"
                                  }
                                }}
                                >
                                   <FaEye size={20} color='#465fff' />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  // color='success'
                                  disabled={row.status === 'approved'}
                                  onClick={() => statusHandler(row.driverId, "approved")}
                                  sx={{color: "#465fff", ":hover": { backgroundColor: "lightgray", color:"darkgreen" }}}
                                >
                                  <CheckCircleIcon size={20} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  disabled={row.status === 'rejected'}
                                  onClick={() => statusHandler(row.driverId, "rejected")}
                                  sx={{":hover": { backgroundColor: "lightgray", color:"darkred" }}}
                                >
                                  <RxCrossCircled color='#465fff' size={20} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  disabled={row.status === 'blocked'}
                                  onClick={() => statusHandler(row.driverId, "blocked")}
                                  sx={{":hover": { backgroundColor: "lightgray", color:"darkred" }}}
                                >
                                  <IoBanOutline size={20} color='#465fff'/>
                                </IconButton>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{userData.length === 0 ? 0 : (page - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(page * pageSize, totalRowSize)}</span> of <span className="font-medium">{totalRowSize}</span> results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePrev}
                      disabled={!canPrev}
                      className={`px-3 py-1 rounded-md text-sm font-medium border ${canPrev ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
                    >
                      Prev
                    </button>
                    <div className="text-sm text-gray-700">Page {page}</div>
                    <button
                      onClick={handleNext}
                      disabled={!canNext}
                      className={`px-3 py-1 rounded-md text-sm font-medium border ${canNext ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
                    >
                      Next
                    </button>
                  </div>
                </div>

              </Paper>
            </div>
        )
      }

        <CustomSnackbar
        open={showAlert}
        message={alertMessage}
        severity={alertSeverity}
        onClose={() => setShowAlert(false)}
        />

    </div>
  );
};

export default DriverManagement;


