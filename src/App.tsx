import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthPage } from "@/components/auth/AuthPage";
import Dashboard from "@/pages/Dashboard";
import Practice from "@/pages/Practice";
import Competitions from "@/pages/Competitions";
import CompetitionArena from "@/pages/CompetitionArena";
import AdminDashboard from "@/pages/AdminDashboard";
import GodView from "@/pages/GodView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/competitions" element={<Competitions />} />
            <Route path="/competition/:id" element={<CompetitionArena />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/god-view/:id" element={<GodView />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
