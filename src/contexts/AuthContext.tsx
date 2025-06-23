import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuth = async () => {
      try {
        // In a real app, this would check localStorage/sessionStorage or make an API call
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, _password: string): Promise<void> => {
    setLoading(true);
    try {
      // Mock login - in real app, this would be an API call
      // Note: password parameter is prefixed with underscore to indicate it's intentionally unused
      const mockUser: User = {
        id: '1',
        name: 'John Farmer',
        email: email,
        phone: '+263 77 123 4567',
        location: 'Harare, Zimbabwe',
        farmSize: 5,
        preferredLanguage: 'en',
        createdAt: new Date(),
        primaryCrops: ['Maize', 'Tomatoes'],
        joinedAt: new Date('2023-01-15')
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Partial<User> & { password: string }): Promise<void> => {
    setLoading(true);
    try {
      // Mock registration - in real app, this would be an API call
      // Note: password is extracted but not used in mock implementation
      const { password: _password, ...userDataWithoutPassword } = userData;
      
      const newUser: User = {
        id: Date.now().toString(),
        name: userDataWithoutPassword.name || '',
        email: userDataWithoutPassword.email || '',
        phone: userDataWithoutPassword.phone,
        location: userDataWithoutPassword.location,
        farmSize: userDataWithoutPassword.farmSize ? parseFloat(userDataWithoutPassword.farmSize.toString()) : undefined,
        preferredLanguage: userDataWithoutPassword.preferredLanguage || 'en',
        createdAt: new Date(),
        primaryCrops: userDataWithoutPassword.primaryCrops || [],
        joinedAt: new Date()
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      throw new Error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { 
        ...user, 
        ...updates,
        primaryCrops: updates.primaryCrops || user.primaryCrops || []
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};