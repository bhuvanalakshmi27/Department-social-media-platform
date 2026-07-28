import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-dark-950">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Panel */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Header Topbar */}
        <Topbar />

        {/* Content Area */}
        <main className="flex-1 mt-16 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
