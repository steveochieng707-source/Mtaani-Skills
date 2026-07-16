import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Fundis from './pages/Fundis';
import FundiProfile from './pages/FundiProfile';
import Book from './pages/Book';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Admin from './pages/Admin';
import AdminVerify from './pages/AdminVerify';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/fundis" component={Fundis} />
      <Route path="/fundis/:id" component={FundiProfile} />
      <Route path="/book/:fundiId" component={Book} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/jobs/:id" component={JobDetail} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/verify/:id" component={AdminVerify} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, '') || ''}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
