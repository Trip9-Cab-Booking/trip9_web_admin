'use client';

import { selectAccessToken } from '@/store/authSlice';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { DataGrid, GridColDef, GridSearchIcon } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import TableSkeleton from './skeleton/Table';
import { alpha, Button, Chip, IconButton, Menu, MenuItem, MenuProps, Stack, styled } from '@mui/material';
import { CheckCircleIcon, DownloadIcon } from '@/icons';
import { printTable } from '@/utils/export/drivers/print';
import CustomNoRowsOverlay from './CustomNoDataOverlay';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGaurd';
import { exportToPDFUsers } from '@/utils/export/users/pdf';
import { exportToExcelUsers } from '@/utils/export/users/excel';
import CustomSnackbar from './CustomSnackbar';

const BASE = process.env.NEXT_PUBLIC_BASE_URL;

export type UserData = {
  id: number;
  lastName: string | null;
  firstName: string | null;
  gender?: string;
  phone?: string | null;
  status: "active" | "blcoked" ;
  userId: string;
};


const paginationModel = { page: 0, pageSize: 5 };

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

//   const user = useSelector(selectCurrentUser);
  const token = useSelector(selectAccessToken);
  console.log(token);


  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [userData, setUserData] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearch, setShowSearch] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // New states for alert/snackbar
        const [alertMessage, setAlertMessage] = useState("");
        const [alertSeverity, setAlertSeverity] = useState<"success" | "error" | "info">("info");
        const [showAlert, setShowAlert] = useState(false);

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
    const fetchDrivers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': '69420',
          },
        });

        if (res.data.success === 401) {
        //   throw new Error(res.data.message);
            const msg = res?.data?.message || "Failed to update the status";
            showFeedback(msg, "error");
        }

        const data = res.data.data;
        console.log("data:", data);


        // Transform API data to Data[] structure
        const formatted: UserData[] = data.map((user: any, index: number) => ({
          id:index + 1,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          gender: user.gender,
          phone: user.phone || '',
          status: user.status?.toLowerCase() || 'pending', // default to pending
          userId: user._id,
        }));

        setUserData(formatted);
        showFeedback(res.data.message, "success");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Failed to update status:", errorMessage);
        showFeedback(`Failed to update status: ${errorMessage}`, "error");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchDrivers();
  }, [token]);

//   useEffect(() => {
//     let isMounted = true;
//     if (isMounted && drivers?.length > 0) {
//       const formatted = drivers.map((driver: any, idx: number) => ({
//         id: idx+1,
//         firstName: driver.firstName,
//         lastName: driver.lastName,
//         address: driver.address,
//         status: driver.status
//       }));
//       setUserData(formatted);
//     }else{
//         setUserData([]);
//     }
//     return () => {
//       isMounted = false;
//     };
//   }, [drivers]);

const columns: GridColDef[] = [
    { field: 'id', headerName: 'SL No'},
    { field: 'firstName', headerName: 'First name',minWidth:150, maxWidth:200,
      // disableColumnMenu: true,
    },
    { field: 'lastName', headerName: 'Last name',minWidth:150, maxWidth:200},
    { field: 'gender', headerName: 'Gender', maxWidth:100,
      disableColumnMenu: true,
      filterable: false,
      sortable: false
    },
    { field: 'phone', headerName: 'Phone', minWidth:130,maxWidth:160,
      disableColumnMenu: true,
      filterable: false,
      sortable: false
    },
    {
      field: 'status',
      headerName: 'Status',
      maxWidth: 100,
      renderCell: ({ value }) => {
        let color: 'default' | 'primary' | 'success' | 'warning' | 'error' = 'default';
        switch (value?.toLowerCase()) {
          case 'active':
            color = 'success';
            break;
          case 'blocked':
            color = 'error';
            break;
        }
        return <Chip label={value} color={color} variant="outlined" />;
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth:200,
      maxWidth: 220,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const id = params.row.userId;
        const status = params.row.status;

        const isApproved = status === 'active';
        const isBlocked  = status === 'blocked';
        return (
          <Stack direction="row" spacing={1} className='w-full h-full flex items-center justify-center' >
            <IconButton
              aria-label='view'
              size="small"
              onClick={() => viewHandler(id)}
              color='info'
              sx={{backgroundColor:"oklch(0.952 0 0)", ":hover": { backgroundColor: "lightgray", color:"darkcyan" }}}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
            </IconButton>
            {/* Approve */}
            <IconButton
              size="small"
              color='success'
              disabled={isApproved}
              onClick={() => statusHandler(id, "unblock")}
              sx={{backgroundColor:"oklch(0.952 0 0)", ":hover": { backgroundColor: "lightgray", color:"darkgreen" }}}
            >
              <CheckCircleIcon />
              </IconButton>
              {/* Reject */}
                {/* <IconButton
                size="small"
                color="error"
                disabled={isRejected}
                onClick={() => statusHandler(id, "rejected")}

                sx={{backgroundColor:"oklch(0.952 0 0)", ":hover": { backgroundColor: "lightgray", color:"darkred" }}}
                >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-x-icon lucide-circle-x"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                </IconButton> */}
              {/* Block */}
            <IconButton
              size="small"
              color="error"
              disabled={isBlocked}
              onClick={() => statusHandler(id, "block")}
              sx={{backgroundColor:"oklch(0.952 0 0)", ":hover": { backgroundColor: "lightgray", color:"darkred" }}}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ban-icon lucide-ban"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>
              </IconButton>
          </Stack>
        );
      }
    }
  ];

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

  //! Actions
  const viewHandler = (id: string) => {
    router.push(`/users/${id}`);
  }


const statusHandler = async (id: string, status: string) => {
    console.log(id, status);

    if (!token) {
      console.error("No auth token!");
      return;
    }
    try {
      const res = await axios.patch(`${BASE}/api/admin/users/${id}/status?action=${status}`,
        {}, // <-- no request body
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "69420",
            "Content-Type": "application/json",
          },
        }
      );

      console.log(res.data);


      if(res.status !== 200){
        // throw new Error(res.data.message);
        const msg = res?.data?.message || "Failed to update the status";
        showFeedback(msg, "error");
      }

      setUserData(userData.map(user =>
        user.userId === id
          ? { ...user, status: res.data.user.status?.toLowerCase() }
          : user
      ));
      console.log("Status updated:", res.data.data);
      showFeedback(res.data.message, "success");
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Failed to update status:", errorMessage);
        showFeedback(`Failed to update status: ${errorMessage}`, "error");
    }
  };


  if (userData.length === 0) return <TableSkeleton />

  return (
    <div>
      <header className='flex items-center justify-between mb-4'>
        <h1 className='font-semibold'>User Management</h1>
        <div className='flex items-center gap-2'>
        <div className="relative transition-all duration-300 ease-in-out">
    {showSearch ? (
      <input
        autoFocus
        type="text"
        placeholder="Search drivers..."
        className="px-3 py-1 rounded border bg-white dark:bg-gray-600 dark:text-slate-200 w-64"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onBlur={() => {
          if (!searchQuery) setShowSearch(false);
        }}
      />
    ) : (
      <Button
        size="medium"
        className='rounded-full'
        variant="contained"
        onClick={() => setShowSearch(true)}
        startIcon={<GridSearchIcon />}
      />
    )}
  </div>
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
            {/* <MenuItem onClick={() => {
                handleClose();
                printTable(userData, {
                title: "Drivers Report",
                logoUrl: "/images/logo/logo.svg", // Optional - use your app logo path
                });
                }} disableRipple>
                Print
            </MenuItem> */}
            <MenuItem onClick={() => {
                handleClose();
                exportToExcelUsers(userData.map(user => ({
                    ...user,
                    phone: user.phone || '', // Ensure phone is a string
                  })));
              }} disableRipple>
            Excel
            </MenuItem>
            <MenuItem onClick={() => {
                handleClose();
                exportToPDFUsers(userData.map(user => ({
                  ...user,
                  phone: user.phone || '', // Ensure phone is a string
                })));
            }} disableRipple>
            PDF
            </MenuItem>
        </StyledMenu>
      </header>

<div className="w-full overflow-hidden">
  <Paper
    elevation={0}
    sx={{ width: '95%', height: "100%", overflow: 'hidden',backgroundColor: "transparent" }}
  >
    <DataGrid
      rows={filteredData}
      columns={columns}
      initialState={{ pagination: { paginationModel } }}
      paginationMode='client'
      pageSizeOptions={[5, 10]}
      checkboxSelection={false}
      rowSelection={false}
      slots={{ noRowsOverlay: CustomNoRowsOverlay }}
      sx={(theme) => ({
        height: '100%',
        width: '100%',
        padding: "10px",
        backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#f9fafb', // slate-800 / gray-50
        color: theme.palette.mode === 'dark' ? '#f3f4f6' : '#1f2937', // gray-100 / gray-800

        '& .MuiDataGrid-cell': {
          borderBottom: `1px solid ${
            theme.palette.mode === 'dark' ? '#334155' : '#e5e7eb' // slate-700 / gray-200
          }`,
        },
        '& .MuiDataGrid-columnHeaders': {
          backgroundColor: theme.palette.mode === 'dark' ? '#0f172a' : '#f3f4f6', // slate-900 / gray-100
          color: theme.palette.mode === 'dark' ? '#cbd5e1' : '#111827', // slate-300 / gray-900
        },
        '& .MuiDataGrid-footerContainer': {
          backgroundColor: theme.palette.mode === 'dark' ? '#0f172a' : '#f3f4f6',
          color: theme.palette.mode === 'dark' ? '#cbd5e1' : '#111827',
        },
        '& .MuiDataGrid-row:hover': {
          backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#f1f5f9', // slate-800 / slate-100
        },
      })}

    />
  </Paper>
</div>
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
