import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import { ToastProvider } from './components/Toast';
import { Layout } from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import AvailableFood from './pages/AvailableFood';
import QuickDonate from './pages/QuickDonate';
import SmartMatches from './pages/SmartMatches';
import PickupDelivery from './pages/PickupDelivery';
import Impact from './pages/Impact';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/available" element={<AvailableFood />} />
              <Route path="/donate" element={<QuickDonate />} />
              <Route path="/matches" element={<SmartMatches />} />
              <Route path="/delivery" element={<PickupDelivery />} />
              <Route path="/impact" element={<Impact />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/home" element={<Navigate to="/dashboard" replace />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </StoreProvider>
  );
}
