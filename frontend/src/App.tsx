import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DevModeSwitch } from "@/components/DevModeSwitch";
import Landing from "./pages/Landing";
import CitizenLogin from "./pages/CitizenLogin";
import CitizenOnboarding from "./pages/CitizenOnboarding";
import CitizenDrive from "./pages/CitizenDrive";
import CitizenHub from "./pages/CitizenHub";
import CitizenProfile from "./pages/CitizenProfile";
import MunicipalityLogin from "./pages/MunicipalityLogin";
import MunicipalityOnboarding from "./pages/MunicipalityOnboarding";
import MunicipalityMap from "./pages/MunicipalityMap";
import MunicipalityReports from "./pages/MunicipalityReports";
import MunicipalityHub from "./pages/MunicipalityHub";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/citizen/login" element={<CitizenLogin />} />
          <Route path="/citizen/onboarding" element={<CitizenOnboarding />} />
          <Route path="/citizen/drive" element={<CitizenDrive />} />
          <Route path="/citizen/hub" element={<CitizenHub />} />
          <Route path="/citizen/profile" element={<CitizenProfile />} />
          <Route path="/municipality/login" element={<MunicipalityLogin />} />
          <Route path="/municipality/onboarding" element={<MunicipalityOnboarding />} />
          <Route path="/municipality/map" element={<MunicipalityMap />} />
          <Route path="/municipality/reports" element={<MunicipalityReports />} />
          <Route path="/municipality/hub" element={<MunicipalityHub />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <DevModeSwitch />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
