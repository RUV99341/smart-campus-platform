import React from 'react';
import Navbar from './Navbar';

export default function DashboardLayout({ children }){
  return (
    <div className="app-root">
      <Navbar />
      <main className="app-main">{children}</main>
    </div>
  );
}
