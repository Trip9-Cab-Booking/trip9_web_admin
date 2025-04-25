import * as React from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import {  CloseLineIcon } from '@/icons';
// import CloseIcon from '@mui/icons-material/Close';

interface Data {
    status : "error" | "success";
    message : string;
}

export default function MyAlert({status, message}: Data) {
  const [open, setOpen] = React.useState(true);

  return (
    <Box sx={{ width: '100%' }}>
      <Collapse in={open}>
        <Alert severity={status}
          action={
            <IconButton
              aria-label="close"
              color={status}
              size="small"
              onClick={() => {
                setOpen(false);
              }}
            >
              <CloseLineIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {message}
        </Alert>
      </Collapse>
    </Box>
  );
}
