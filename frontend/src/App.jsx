import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import client from "./api/client.js";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import { ToastProvider } from "./components/Toast.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Jobs from "./pages/Jobs.jsx";
import Companies from "./pages/Companies.jsx";
import Applications from "./pages/Applications.jsx";
import ResumePage from "./pages/ResumePage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import Preferences from "./pages/Preferences.jsx";
import Settings from "./pages/Settings.jsx";

const titles = {
  "/": "Dashboard",
  "/jobs": "Jobs",
  "/companies": "Companies",
  "/applications": "Applications",
  "/resume": "My Resume",
  "/profile": "My Profile",
  "/preferences": "Preferences",
  "/settings": "Settings",
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const pingBackend = () => client.get("/health").catch(() => undefined);
    pingBackend();
    const intervalId = setInterval(pingBackend, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 min-w-0 flex flex-col">
          <RoutedTopbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl w-full mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/resume" element={<ResumePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/preferences" element={<Preferences />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

function RoutedTopbar({ onMenuClick }) {
  const location = useLocation();
  const title = titles[location.pathname] || "Job Agent";
  return <Topbar title={title} onMenuClick={onMenuClick} />;
}
