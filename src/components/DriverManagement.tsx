'use client';

import { selectAccessToken } from '@/store/authSlice';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { DataGrid, GridColDef, GridSearchIcon } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import TableSkeleton from './skeleton/Table';
import { alpha, Button, Chip, IconButton, Menu, MenuItem, MenuProps, Stack, styled } from '@mui/material';
import { CheckCircleIcon, DownloadIcon } from '@/icons';
import { exportToExcel } from '@/utils/export/drivers/excel';
import { exportToPDF } from '@/utils/export/drivers/pdf';
import CustomNoRowsOverlay from './CustomNoDataOverlay';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGaurd';
import CustomSnackbar from './CustomSnackbar';

const BASE = process.env.NEXT_PUBLIC_BASE_URL;

export type Data = {
  id: number;
  lastName: string | null;
  firstName: string | null;
  address: string | null;
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
//   const user = useSelector(selectCurrentUser);
  const token = useSelector(selectAccessToken);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [userData, setUserData] = useState<Data[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearch, setShowSearch] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

      // New states for alert/snackbar
      const [alertMessage, setAlertMessage] = useState("");
      const [alertSeverity, setAlertSeverity] = useState<"success" | "error" | "info">("info");
      const [showAlert, setShowAlert] = useState(false);

      //   * Pagination
      const [pageNumber, setPageNumber] = useState<number>(1);
      const [pageSize, setPageSize] = useState<number>(10);
      const [pageTotalSize, setPageTotalSize] = useState<number>(10);

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
        const res = await axios.get(`${BASE}/api/admin/drivers?page=${pageNumber}&limit=${pageSize}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': '69420',
          },
        });

        if (res.data.success === 401) {
          throw new Error(res.data.message);
        }

        const data = res.data.data;
        // console.log(res.data);

        setPageNumber(res.data.pageMeta.page);
        setPageSize(res.data.pageMeta.limit);
        setPageTotalSize(res.data.pageMeta.total);


        // Transform API data to Data[] structure
        const formatted: Data[] = data.map((driver: { firstName?: string; lastName?: string; gender?: string; address?: string; status?: string; _id: string }, index: number) => ({
          id:(pageNumber - 1) * pageSize + index + 1,
          firstName: driver.firstName || '',
          lastName: driver.lastName || '',
          gender: driver.gender,
          address: driver.address || '',
          status: driver.status?.toLowerCase() || 'pending', // default to pending
          driverId: driver._id,
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
  }, [token, pageNumber, pageSize]);

  const paginationModel = { page: pageNumber-1, pageSize: pageSize };
  console.log(paginationModel);

const columns: GridColDef[] = [
    { field: 'id', headerName: 'SL No'},
    { field: 'firstName', headerName: 'First name', maxWidth:100,
      // disableColumnMenu: true,
    },
    { field: 'gender', headerName: 'Gender', maxWidth:100,
      disableColumnMenu: true,
      filterable: false,
      sortable: false
    },
    { field: 'lastName', headerName: 'Last name', maxWidth:100},
  {
      field: "address",
      headerName: "Address",
      minWidth: 200,
      maxWidth:250
  },
    {
      field: 'status',
      headerName: 'Status',
      maxWidth: 100,
      renderCell: ({ value }) => {
        let color: 'default' | 'primary' | 'success' | 'warning' | 'error' = 'default';
        switch (value?.toLowerCase()) {
          case 'approved':
            color = 'success';
            break;
          case 'pending':
            color = 'warning';
            break;
          case 'rejected':
            color = 'error';
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
        const id = params.row.driverId;
        const status = params.row.status;

        const isApproved = status === 'approved';
        const isRejected = status === 'rejected';
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
              onClick={() => statusHandler(id, "approved")}
              sx={{backgroundColor:"oklch(0.952 0 0)", ":hover": { backgroundColor: "lightgray", color:"darkgreen" }}}
            >
              <CheckCircleIcon />
              </IconButton>
              {/* Reject */}
            <IconButton
              size="small"
              color="error"
              disabled={isRejected}
              onClick={() => statusHandler(id, "rejected")}

              sx={{backgroundColor:"oklch(0.952 0 0)", ":hover": { backgroundColor: "lightgray", color:"darkred" }}}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-x-icon lucide-circle-x"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
              </IconButton>
              {/* Block */}
            <IconButton
              size="small"
              color="error"
              disabled={isBlocked}
              onClick={() => statusHandler(id, "blocked")}
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
      row.address?.toLowerCase().includes(search) ||
      row.status.toLowerCase().includes(search) ||
      String(row.id).includes(search)
    );
  });

  //! Actions
  const viewHandler = (id: string) => {
    router.push(`/drivers/${id}`);
  }

//   const statusHandler = async (id: string, status: string) => {
//     console.log(status);

//     try {
//         if(token){
//             const res = await axios.patch(`${BASE}/api/admin/drivers/update-status/${id}`, {
//                 params: { status: status },
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     'ngrok-skip-browser-warning': '69420',
//                     'Content-Type' : 'application/json'
//                   },
//             });
//             console.log(res);
//         }

//         // const data = res.data.data;
//         // console.log(data);
//     } catch (error) {
//         console.log(error);

//     }
//   }

const statusHandler = async (id: string, status: string) => {
    if (!token) {
      console.error("No auth token!");
      return;
    }
    try {
      const res = await axios.patch(
        // make sure BASE ends with no slash, we add one here:
        `${BASE}/api/admin/drivers/update-status/${id}?status=${status}`,
        {}, // <-- no request body
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


  if (loading) return <TableSkeleton />

  return (
    <div>
      <header className='flex items-center justify-between mb-4'>
        <h1 className='font-semibold'>Driver Management</h1>
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
                exportToExcel(userData);
            }} disableRipple>
            Excel
            </MenuItem>
            <MenuItem onClick={() => {
                handleClose();
                exportToPDF(userData);
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
      paginationMode="server"
        paginationModel={{ page: pageNumber - 1, pageSize }}
        onPaginationModelChange={({ page, pageSize }) => {
            setPageNumber(page + 1); // Convert zero-based to one-based
            setPageSize(pageSize);
        }}
        rowCount={pageTotalSize} // You should keep total count in state too
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

export default DriverManagement;
