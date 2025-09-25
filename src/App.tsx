import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/auth/Login";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import RoomManagement from "./components/rooms/RoomManagement";
import TimetableView from "./components/schedule/TimetableView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<{ role: 'admin' | 'scheduler' } | null>(null);

  const handleLogin = (role: 'admin' | 'scheduler') => {
    setUser({ role });
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Login onLogin={handleLogin} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DashboardLayout userRole={user.role} onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard userRole={user.role} />} />
              <Route path="/dashboard/rooms" element={<RoomManagement />} />
              <Route path="/dashboard/faculty" element={<div className="p-8 text-center text-muted-foreground">Faculty Management - Coming Soon</div>} />
              <Route path="/dashboard/batches" element={<div className="p-8 text-center text-muted-foreground">Batch Management - Coming Soon</div>} />
              <Route path="/dashboard/subjects" element={<div className="p-8 text-center text-muted-foreground">Subject Management - Coming Soon</div>} />
              <Route path="/dashboard/schedule" element={<TimetableView />} />
              <Route path="/dashboard/analytics" element={<div className="p-8 text-center text-muted-foreground">Analytics - Coming Soon</div>} />
              <Route path="/dashboard/settings" element={<div className="p-8 text-center text-muted-foreground">Settings - Coming Soon</div>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DashboardLayout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
