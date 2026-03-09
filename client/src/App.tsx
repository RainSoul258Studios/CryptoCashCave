import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useAuthStore } from "@/store/use-auth-store";

// Layout & Pages
import Layout from "@/components/layout";
import AuthPage from "@/pages/auth";
import CavePage from "@/pages/cave";
import ShopPage from "@/pages/shop";
import InventoryPage from "@/pages/inventory";
import WalletPage from "@/pages/wallet";

// Protected Route Wrapper
const ProtectedRoute = ({ component: Component, ...rest }: any) => {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  return <Component {...rest} />;
};

function Router() {
  return (
    <Switch>
      <Route path="/login" component={AuthPage} />
      
      {/* Wrapped in Layout for authenticated users */}
      <Route path="/">
        <Layout><ProtectedRoute component={CavePage} /></Layout>
      </Route>
      <Route path="/shop">
        <Layout><ProtectedRoute component={ShopPage} /></Layout>
      </Route>
      <Route path="/inventory">
        <Layout><ProtectedRoute component={InventoryPage} /></Layout>
      </Route>
      <Route path="/wallet">
        <Layout><ProtectedRoute component={WalletPage} /></Layout>
      </Route>

      {/* Fallback */}
      <Route>
        <Layout><NotFound /></Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
