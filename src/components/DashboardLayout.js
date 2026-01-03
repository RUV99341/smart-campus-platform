
import React from 'react';
import Navbar from './Navbar';
import { Box } from '@mui/material';

export default function DashboardLayout({ children }){
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f4f6f8' }}>
        {children}
      </Box>
    </Box>
  );
}
