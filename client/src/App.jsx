import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }        from './context/AuthContext.jsx';
import { TransactionProvider } from './context/TransactionContext.jsx';
import { CurrencyProvider }    from './context/CurrencyContext.jsx';
import { ToastProvider }       from './context/ToastContext.jsx';
import ProtectedRoute          from './components/common/ProtectedRoute.jsx';
import Sidebar                 from './components/layout/Sidebar.jsx';
import Footer                  from './components/layout/Footer.jsx';
import Dashboard               from './pages/Dashboard.jsx';
import Transactions            from './pages/Transactions.jsx';
import MonthlyHistory          from './pages/MonthlyHistory.jsx';
import Settings                from './pages/Settings.jsx';
import ForgotPassword          from './pages/ForgotPassword.jsx';
import ResetPassword           from './pages/ResetPassword.jsx';
import Login                   from './pages/Login.jsx';
import Register                from './pages/Register.jsx';
import NotFound                from './pages/NotFound.jsx';
import { useAuth }             from './hooks/useAuth.js';
import Spinner                 from './components/common/Spinner.jsx';
import styles                  from './styles/App.module.css';

function AppLayout({ children }) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <main className={styles.content}>{children}</main>
        <Footer />
      </div>
    </div>
  );
}

function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Spinner fullPage />;
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CurrencyProvider>
          <ToastProvider>
            <TransactionProvider>
              <Routes>
                <Route path="/" element={<RootRedirect />} />

                <Route path="/login"              element={<Login />} />
                <Route path="/register"          element={<Register />} />
                <Route path="/forgot-password"   element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <AppLayout><Dashboard /></AppLayout>
                  </ProtectedRoute>
                } />

                <Route path="/transactions" element={
                  <ProtectedRoute>
                    <AppLayout><Transactions /></AppLayout>
                  </ProtectedRoute>
                } />

                <Route path="/history" element={
                  <ProtectedRoute>
                    <AppLayout><MonthlyHistory /></AppLayout>
                  </ProtectedRoute>
                } />

                <Route path="/settings" element={
                  <ProtectedRoute>
                    <AppLayout><Settings /></AppLayout>
                  </ProtectedRoute>
                } />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </TransactionProvider>
          </ToastProvider>
        </CurrencyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
