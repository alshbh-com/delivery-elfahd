
import React, { useState, useEffect } from 'react';
import AdminPanel from '@/components/AdminPanel';
import AdminLogin from '@/components/admin/AdminLogin';

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if admin is already logged in
    const adminLoggedIn = localStorage.getItem('admin_logged_in') === 'true';
    setIsLoggedIn(adminLoggedIn);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminPanel onLogout={handleLogout} />;
};

export default Admin;
