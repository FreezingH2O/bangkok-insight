import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TicketProvider } from "@/contexts/TicketContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import MapPage from "./pages/MapPage";
import QueuePage from "./pages/QueuePage";
import DRRPage from "./pages/DRRPage";
import SustainabilityPage from "./pages/SustainabilityPage";
import BenchmarkPage from "./pages/BenchmarkPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TicketProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/queue" element={<QueuePage />} />
                <Route path="/drr" element={<DRRPage />} />
                <Route path="/sustainability" element={<SustainabilityPage />} />
                <Route path="/benchmark" element={<BenchmarkPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DashboardLayout>
          </BrowserRouter>
        </TooltipProvider>
      </TicketProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
