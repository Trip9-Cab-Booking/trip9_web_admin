"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Logout from "@mui/icons-material/Logout";
import { logout, selectCurrentUser } from "@/store/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function AccountMenu() {
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();

  const [initial, setInitial] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (currentUser?.firstName) {
      setInitial(currentUser.firstName.charAt(0).toUpperCase());
    } else {
      setInitial(null);
    }
  }, [currentUser?.firstName]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const goToProfile = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAnchorEl(null);
    router.push("/profile");
  };

  const handleLogout = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    dispatch(logout());
    setAnchorEl(null);
    router.push("/signin");
  };

  return (
    <React.Fragment>
      <Box sx={{ display: "flex", alignItems: "start", textAlign: "center" }}>
        <Tooltip title="Profile">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <Avatar sx={{ width: 32, height: 32 }}>{initial}</Avatar>
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 5.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "bottom" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={goToProfile} className="flex flex-col">
          <Typography variant="inherit">{currentUser?.firstName}</Typography>
          <Typography variant="body2">{currentUser?.email}</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
