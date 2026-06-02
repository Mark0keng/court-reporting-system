import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar.js';
import Header from '../components/Header/Header.js';

export const AuthenticatedLayout: React.FC = () => {
  return (
    <div className="app-container">
      
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Workspace */}
      <div className="app-workspace">
        
        {/* Dashboard Header Bar */}
        <Header />

        {/* Dynamic Scrollable Page Content */}
        <main className="app-main">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default AuthenticatedLayout;
