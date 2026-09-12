import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import LiveMonitoring from './pages/LiveMonitoring';
import TransactionDetails from './pages/TransactionDetails';
import WalletIntelligence from './pages/WalletIntelligence';
import TransactionGraph from './pages/TransactionGraph';
import Alerts from './pages/Alerts';
import Investigations from './pages/Investigations';
import AiIntelligence from './pages/AiIntelligence';
import Analytics from './pages/Analytics';
import AuditTrail from './pages/AuditTrail';
import Settings from './pages/Settings';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/live" element={<LiveMonitoring />} />
        <Route path="/transactions/:hash?" element={<TransactionDetails />} />
        <Route path="/wallets/:address?" element={<WalletIntelligence />} />
        <Route path="/graph" element={<TransactionGraph />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/investigations/:id?" element={<Investigations />} />
        <Route path="/ai" element={<AiIntelligence />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/audit" element={<AuditTrail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/risk" element={<Dashboard />} />
        <Route path="/cases" element={<Investigations />} />
      </Route>
    </Routes>
  );
}

export default App;
