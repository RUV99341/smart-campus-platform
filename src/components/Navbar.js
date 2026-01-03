
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import defaultProfile from '../assets/defaultProfile.svg';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { AccountCircle, ExitToApp } from '@mui/icons-material';
import logo from '../assets/logo.png'; // Assuming you have a logo file

const Navbar = () => {
  const navigate = useNavigate();
  const { user, signOut: contextSignOut } = useAuth();
  const [role, setRole] = useState(user?.role || '');
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await contextSignOut();
      navigate('/');
    } catch (err) {
      console.error('Logout failed', err);
    }
    handleClose();
  };

  useEffect(() => {
    let mounted = true;
    async function fetchRole() {
      if (!user || user.role) return;
      try {
        const uDoc = await getDoc(doc(db, 'users', user.uid));
        if (mounted && uDoc.exists()) {
          const data = uDoc.data();
          setRole(data.role || '');
        }
      } catch (err) {
        console.error('Failed to fetch user role', err);
      }
    }
    fetchRole();
    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <AppBar position="static" color="default" elevation={1} sx={{ backgroundColor: 'white' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/home')}>
          <img src={logo} alt="Smart Campus" style={{ height: 40, marginRight: 10 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'black' }}>
            Smart Campus
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
          <Button component={Link} to="/submit" color="inherit">Submit Complaint</Button>
          <Button component={Link} to="/feed" color="inherit">Complaint Feed</Button>
          {(user?.role === 'admin' || role === 'admin') && (
            <>
              <Button component={Link} to="/admin-dashboard" color="inherit">Admin Dashboard</Button>
              <Button component={Link} to="/user-management" color="inherit">User Management</Button>
            </>
          )}
        </Box>
        <Box sx={{ flexGrow: 1 }} />

        <div>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar src={user?.avatar || user?.photoURL || defaultProfile} alt="Profile" />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={open}
            onClose={handleClose}
          >
            <MenuItem component={Link} to="/profile" onClick={handleClose}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <ExitToApp fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
