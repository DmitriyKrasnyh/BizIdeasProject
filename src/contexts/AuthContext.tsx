import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react';
import { supabase } from '../lib/supabase';

export type UserStatus = 'standard' | 'plus' | 'admin';

export interface User {
  user_id: number;
  email: string;
  region: string;
  business_sector: string;
  transition_goal?: string;
  experience_level?: string;
  status: UserStatus;
  telegram?: string;
  user_text?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (fields: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const saved = localStorage.getItem('user');
      if (!saved) return;

      try {
        const parsed = JSON.parse(saved);

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', parsed.email)
          .single();

        if (error || !data) {
          console.warn('⚠️ Не удалось загрузить пользователя:', error?.message);
          return;
        }

        const freshUser: User = {
          user_id: data.user_id ?? data.id,
          email: data.email,
          region: data.region,
          business_sector: data.business_sector,
          transition_goal: data.transition_goal,
          experience_level: data.experience_lvl,
          status: data.status as UserStatus,
          telegram: data.telegram,
          user_text: data.user_text
        };

        setUser(freshUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(freshUser));
      } catch (err) {
        console.error('❌ Ошибка при чтении localStorage:', err);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) throw new Error(authError.message);

    const { data, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !data) throw new Error('Пользователь не найден');

    const userData: User = {
      user_id: data.user_id ?? data.id,
      email: data.email,
      region: data.region,
      business_sector: data.business_sector,
      transition_goal: data.transition_goal,
      experience_level: data.experience_lvl,
      status: data.status as UserStatus,
      telegram: data.telegram,
      user_text: data.user_text
    };

    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));

    return userData;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (fields: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...fields };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
