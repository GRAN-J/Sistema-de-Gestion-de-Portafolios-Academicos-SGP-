import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import PortfolioList from './pages/PortfolioList';
import PortfolioForm from './pages/PortfolioForm';
import Assignments from './pages/Assignments';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <div className="App" style={{ width: '100%', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            
            {/* Rutas Públicas de Recuperación */}
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/portfolios" element={<PortfolioList />} />
              <Route path="/portfolios/new" element={<PortfolioForm />} />
              <Route path="/portfolios/:id" element={<PortfolioForm />} />
              <Route path="/assignments" element={<Assignments />} />
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
