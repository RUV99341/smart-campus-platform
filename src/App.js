import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Landing from './components/Landing';
import Home from './pages/Home';
import Submit from './pages/Submit';
import Feed from './pages/Feed';
import MyComplaints from './pages/MyComplaints';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

function App(){
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing/>} />
          <Route path="/home" element={<ProtectedRoute><DashboardLayout><Home/></DashboardLayout></ProtectedRoute>} />
          <Route path="/submit" element={<ProtectedRoute><DashboardLayout><Submit/></DashboardLayout></ProtectedRoute>} />
          <Route path="/feed" element={<ProtectedRoute><DashboardLayout><Feed/></DashboardLayout></ProtectedRoute>} />
          <Route path="/my-complaints" element={<ProtectedRoute><DashboardLayout><MyComplaints/></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requireRole={'admin'}><DashboardLayout><Admin/></DashboardLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><DashboardLayout><Profile/></DashboardLayout></ProtectedRoute>} />
          <Route path="/signup" element={<Signup/>} />
          <Route path="/forgot-password" element={<ForgotPassword/>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
