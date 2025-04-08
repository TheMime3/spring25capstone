import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Questionnaire from './pages/Questionnaire';
import ScriptGenerator from './pages/ScriptGenerator';
import Recording from './pages/Recording';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/questionnaire" element={
              <PrivateRoute>
                <Questionnaire />
              </PrivateRoute>
            } />
            <Route path="/script-generator" element={
              <PrivateRoute>
                <ScriptGenerator />
              </PrivateRoute>
            } />
            <Route path="/recording" element={
              <PrivateRoute>
                <Recording />
              </PrivateRoute>
            } />
            <Route path="/home" element={<Home />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </AnimatePresence>
      </Router>
    </AuthProvider>
  );
}

export default App;