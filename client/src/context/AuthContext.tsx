import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, Teacher, UserRole, UserProfile, RegisterRequest, LoginRequest } from '@shared/types';
import { api, getStoredToken, getStoredUser } from '../services/api';

interface AuthContextType {
  role: UserRole | null;
  user: UserProfile | null;
  currentStudent: Student | null;
  currentTeacher: Teacher | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (req: LoginRequest) => Promise<UserProfile>;
  register: (req: RegisterRequest) => Promise<UserProfile>;
  logout: () => void;
  loginAsStudent: (studentId?: string) => Promise<void>;
  loginAsTeacher: (teacherId?: string) => Promise<void>;
  switchStudent: (studentId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cachedUser = getStoredUser();
  const [role, setRole] = useState<UserRole | null>(() => cachedUser?.role || null);
  const [user, setUser] = useState<UserProfile | null>(() => cachedUser);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(() => {
    if (cachedUser && cachedUser.role === 'student') {
      return {
        id: cachedUser.id,
        name: cachedUser.name,
        email: cachedUser.email,
        gradeLevel: cachedUser.gradeLevel || 'Grade 9',
        currentTopicId: cachedUser.currentTopicId || 'linear_equations',
        enrolledAt: cachedUser.createdAt,
        lastActiveAt: cachedUser.lastActiveAt || cachedUser.createdAt,
        isDemo: cachedUser.isDemo ?? false
      };
    }
    return null;
  });
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(() => {
    if (cachedUser && cachedUser.role === 'teacher') {
      return {
        id: cachedUser.id,
        name: cachedUser.name,
        email: cachedUser.email,
        school: cachedUser.school || 'MindTrace Academy',
        department: cachedUser.department || cachedUser.subject || 'Mathematics',
        assignedClasses: ['Grade 9 Algebra', 'Grade 10 Geometry'],
        isDemo: cachedUser.isDemo ?? false
      };
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !cachedUser && !!getStoredToken();
  });

  const applyUser = (profile: UserProfile) => {
    setUser(profile);
    setRole(profile.role);
    if (profile.role === 'student') {
      setCurrentStudent({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        gradeLevel: profile.gradeLevel || 'Grade 9',
        currentTopicId: profile.currentTopicId || 'linear_equations',
        enrolledAt: profile.createdAt,
        lastActiveAt: profile.lastActiveAt || profile.createdAt,
        isDemo: profile.isDemo ?? false
      });
      setCurrentTeacher(null);
    } else {
      setCurrentTeacher({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        school: profile.school || 'MindTrace Academy',
        department: profile.department || profile.subject || 'Mathematics',
        assignedClasses: ['Grade 9 Algebra', 'Grade 10 Geometry'],
        isDemo: profile.isDemo ?? false
      });
      setCurrentStudent(null);
    }
  };

  const clearAuth = () => {
    setUser(null);
    setRole(null);
    setCurrentStudent(null);
    setCurrentTeacher(null);
  };

  useEffect(() => {
    async function restoreSession() {
      const token = getStoredToken();
      if (!token) {
        clearAuth();
        setIsLoading(false);
        return;
      }
      try {
        const profile = await api.getMe();
        applyUser(profile);
      } catch (err: any) {
        // Only clear if server explicitly denied auth
        if (err?.message?.includes('Session expired') || err?.message?.includes('not authenticated') || err?.message?.includes('401')) {
          console.warn('[Auth] Session invalidated by server:', err);
          clearAuth();
        } else {
          console.warn('[Auth] Network warning during session check:', err);
        }
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = async (req: LoginRequest): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const res = await api.login(req);
      applyUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (req: RegisterRequest): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const res = await api.register(req);
      applyUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    clearAuth();
  };

  // Compatibility stubs for legacy references if any
  const loginAsStudent = async (_studentId?: string) => {
    // Legacy fallback replaced by real login
  };

  const loginAsTeacher = async (_teacherId?: string) => {
    // Legacy fallback replaced by real login
  };

  const switchStudent = async (_studentId: string) => {
    // Replaced by isolated persistent accounts
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        user,
        currentStudent,
        currentTeacher,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        loginAsStudent,
        loginAsTeacher,
        switchStudent
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
