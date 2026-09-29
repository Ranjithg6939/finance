import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function MainLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 w-full max-w-full overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        closeMobileSidebar={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 w-full max-w-full overflow-x-hidden">
        <Navbar toggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)} />
        <main className="flex-1 px-3.5 py-4 sm:p-6 lg:p-8 max-w-7xl w-full min-w-0 mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
