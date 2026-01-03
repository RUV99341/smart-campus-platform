
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user, signOut: contextSignOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await contextSignOut();
      navigate('/');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  if (!user) {
    return null;
  }

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  const roleDisplayName = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student';
  
  const roleBadgeStyles = user.role === 'admin' 
    ? 'bg-green-100 text-green-700' 
    : 'bg-blue-100 text-blue-700';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#F6F8FA] py-10 px-4"
    >
      <div className="max-w-4xl mx-auto space-y-6">

        {/* HEADER CARD */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
            {getInitials(user.name)}
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {user.name || 'User'}
            </h1>
            <p className="text-gray-500">{user.email}</p>

            <span className={`inline-block mt-2 px-3 py-1 text-sm rounded-full ${roleBadgeStyles}`}>
              {roleDisplayName}
            </span>
          </div>
        </div>

        {/* PROFILE DETAILS CARD */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Profile Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium text-gray-800">
                {user.name || 'Not set'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="font-medium text-gray-800">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium text-gray-800">{roleDisplayName}</p>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS CARD */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/my-complaints" className="flex-1">
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                My Complaints
              </button>
            </Link>

            <button
              disabled
              className="flex-1 bg-gray-200 text-gray-500 py-2 rounded-lg cursor-not-allowed"
            >
              Edit Profile
            </button>

            <button onClick={handleLogout} className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition">
              Logout
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
