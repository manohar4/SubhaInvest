import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "./context/AuthContext";
import { InvestmentProvider } from "./context/InvestmentContext";
import LoginPage from "./pages/auth/LoginPage";
import OtpVerificationPage from "./pages/auth/OtpVerificationPage";
import ProfileSetupPage from "./pages/auth/ProfileSetupPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ProfilePage from "./pages/profile/ProfilePage";
import InvestPage from "./pages/invest/InvestPage";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import { RequireAuth } from "./context/AuthContext";

// Logo import
import subhaLogo from "./assets/subha-logo.svg";

// Temporary bypass for authentication
const BypassAuth = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

function Router() {
  // Use a bypass component instead of RequireAuth to skip authentication requirement
  const AuthWrapper = BypassAuth;

  return (
    <Switch>
      <Route path="/">{() => <Redirect to="/login" />}</Route>
      <Route path="/login" component={LoginPage} />
      {/* <Route path="/verify-otp" component={OtpVerificationPage} />
      <Route path="/profile-setup" component={ProfileSetupPage} /> */}
      <Route path="/dashboard">
        {() => (
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        )}
      </Route>
      <Route path="/admin-dashboard">
        {() => (
          <RequireAuth>
            <AdminDashboard />
          </RequireAuth>
        )}
      </Route>
      <Route path="/profile">
        {() => (
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        )}
      </Route>
      <Route path="/invest/:projectId">
        {(params) => (
          <RequireAuth>
            <InvestPage />
          </RequireAuth>
        )}
      </Route>

      {/* Redirect all project-related routes to dashboard */}
      <Route path="/projects/:rest*">
        {() => <Redirect to="/dashboard" />}
      </Route>
      <Route path="/payment">{() => <Redirect to="/dashboard" />}</Route>

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <InvestmentProvider>
        <Router />
        <Toaster />
      </InvestmentProvider>
    </AuthProvider>
  );
}

export default App;
