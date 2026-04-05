import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import MapPage from "@/pages/MapPage";
import ScientificCollection from "@/pages/ScientificCollection";
import CommunityReports from "@/pages/CommunityReports";
import DataExport from "@/pages/DataExport";
import AdminPanel from "@/pages/AdminPanel";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/mapa" element={<ProtectedRoute><AppLayout><MapPage /></AppLayout></ProtectedRoute>} />
            <Route path="/coleta" element={
              <ProtectedRoute allowedRoles={["admin", "professor", "student"]}>
                <AppLayout><ScientificCollection /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/comunidade" element={<ProtectedRoute><AppLayout><CommunityReports /></AppLayout></ProtectedRoute>} />
            <Route path="/dados" element={
              <ProtectedRoute allowedRoles={["admin", "professor", "student"]}>
                <AppLayout><DataExport /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout><AdminPanel /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
