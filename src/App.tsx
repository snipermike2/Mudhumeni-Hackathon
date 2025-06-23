import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ChatInterface from './components/ChatInterface';
import CropRecommendations from './components/CropRecommendations';
import WeatherDashboard from './components/WeatherDashboard';
import UserProfile from './components/UserProfile';
import AuthForm from './components/AuthForm';
import Navigation from './components/Navigation';

// Auth wrapper component
const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Mudhumeni AI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return <>{children}</>;
};

// Auth page component
const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register } = useAuth();

  const handleAuth = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        await login(data.email, data.password);
      } else {
        await register(data);
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md z-50">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <AuthForm 
        mode={mode} 
        onSubmit={handleAuth} 
        loading={loading}
      />
      
      <div className="fixed bottom-4 right-4">
        <button
          onClick={toggleMode}
          className="bg-white text-green-600 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-green-200 hover:border-green-300"
        >
          {mode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
        </button>
      </div>
    </div>
  );
};

// Main app layout
const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/crops" element={
            <div className="flex-1 overflow-hidden">
              <CropRecommendations />
            </div>
          } />
          <Route path="/weather" element={
            <div className="flex-1 overflow-hidden">
              <WeatherDashboard />
            </div>
          } />
          <Route path="/profile" element={
            <div className="flex-1 overflow-hidden">
              <UserProfile />
            </div>
          } />
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </main>
    </div>
  );
};

// Main App component
function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <AuthWrapper>
            <AppLayout />
          </AuthWrapper>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
