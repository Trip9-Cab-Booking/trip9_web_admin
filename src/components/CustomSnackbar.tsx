// components/ui/CustomSnackbar.tsx

"use client";

import React from "react";
import { Alert, Snackbar } from "@mui/material";

interface CustomSnackbarProps {
  message: string;
  severity?: "success" | "error" | "info";
  open: boolean;
  onClose: () => void;
}

const CustomSnackbar: React.FC<CustomSnackbarProps> = ({
  message,
  severity = "info",
  open,
  onClose,
}) => {

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    >
      <Alert severity={severity} variant="filled" onClose={onClose} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackbar;
