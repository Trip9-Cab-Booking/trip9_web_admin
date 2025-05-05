'use client';

import { logout, selectAccessToken } from '@/store/authSlice';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import TableSkeleton from './skeleton/Table';
import { alpha, Button, Chip, IconButton, Menu, MenuItem, MenuProps, Stack, styled } from '@mui/material';
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

    const {
        page,
        pageSize,
        setPage,
      } = useTableQueryParams();

//   const user = useSelector(selectCurrentUser);
  const token = useSelector(selectAccessToken);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [userData, setUserData] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

//   * Pagination
// const [pageNumber, setPageNumber] = useState<number>(1);
// const [pageSize, setPageSize] = useState<number>(10);
 const [totalRowSize, setTotalRowSize] = useState<number>(0);



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
          if (typeof window !== 'undefined') {
            localStorage.setItem('page', JSON.stringify(page));
          }
        }, [page]);

  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE}/api/admin/users`, {
            params : {
                page:page,
                limit: pageSize,
                ...(searchQuery && { searchText: searchQuery})
            },
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
        setTotalRowSize(res.data.pageMeta.total);


        // Transform API data to Data[] structure
        const formatted: UserData[] = data.map((user: { firstName?: string; lastName?: string; gender?: string; phone?: string; status?: string; _id: string }, index: number) => ({
          id:(page - 1) * pageSize + index + 1,
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
        if (error instanceof Object && 'status' in error && error.status === 401) {
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

  const paginationModel = { page: page-1, pageSize };
//   console.log(paginationModel);


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

    const handleSearch = useCallback((query: string) => {
      setSearchQuery(query);
    }, []);


  return (
    <div>
      <header className='flex items-center justify-between mb-4'>
        <h1 className='font-semibold'>User Management</h1>
        <div className='flex items-center gap-2'>
        <Search onSearch={handleSearch} />
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

            <MenuItem onClick={() => downloadData({ context: 'users', format: 'pdf' })} disableRipple>
                PDF
            </MenuItem>
            <MenuItem onClick={() => downloadData({ context: 'users', format: 'csv' })} disableRipple>
                Excel
            </MenuItem>
        </StyledMenu>
      </header>

        {
            loading ? <TableSkeleton /> : (
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
                    paginationModel={{ page: page - 1, pageSize }}
                    onPaginationModelChange={(model) => {
                        setPage(model.page +1)
                    }}
                    rowCount={totalRowSize} // You should keep total count in state too
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

export default UserManagement;
