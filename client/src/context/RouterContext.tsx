import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface RouterContextType {
  currentPath: string;
  navigate: (path: string, options?: { replace?: boolean; studentId?: string }) => void;
  selectedStudentId?: string;
  setSelectedStudentId: (id: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

// Helper to sanitize paths
function sanitizePath(pathname: string): string {
  const clean = pathname.trim().replace(/\/+$/, '') || '/';
  return clean;
}

export const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, role, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => sanitizePath(window.location.pathname));
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Extract student ID from URL like /teacher/student/:id
  useEffect(() => {
    const studentMatch = currentPath.match(/^\/teacher\/student\/([^/]+)/);
    if (studentMatch && studentMatch[1]) {
      setSelectedStudentId(studentMatch[1]);
    }
  }, [currentPath]);

  // Synchronize on browser Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const path = sanitizePath(window.location.pathname);
      setCurrentPath(path);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((path: string, options?: { replace?: boolean; studentId?: string }) => {
    let target = sanitizePath(path);

    if (options?.studentId) {
      setSelectedStudentId(options.studentId);
      if (target === '/teacher/student') {
        target = `/teacher/student/${options.studentId}`;
      }
    }

    if (options?.replace) {
      window.history.replaceState({}, '', target);
    } else {
      window.history.pushState({}, '', target);
    }

    setCurrentPath(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Enforce Role & Authentication Guarantees
  useEffect(() => {
    if (isLoading) return;

    const path = currentPath;

    // 1. Unauthenticated users:
    if (!isAuthenticated || !role) {
      if (path !== '/login' && path !== '/register' && path !== '/') {
        navigate('/login', { replace: true });
      }
      return;
    }

    // 2. Authenticated Student:
    if (role === 'student') {
      // If student is on landing, login, register, or root, take to /home
      if (path === '/' || path === '/login' || path === '/register') {
        navigate('/home', { replace: true });
        return;
      }
      // If student tries to access teacher-only routes, block and redirect to /home
      if (path.startsWith('/teacher')) {
        navigate('/home', { replace: true });
        return;
      }
    }

    // 3. Authenticated Teacher:
    if (role === 'teacher') {
      // If teacher is on student routes, login, register, or root, take to /teacher
      if (
        path === '/' || 
        path === '/login' || 
        path === '/register' || 
        path === '/home' || 
        path === '/learn' || 
        path === '/practice' || 
        path === '/progress' || 
        path === '/insights' || 
        path === '/course' || 
        path === '/topics' || 
        path === '/history'
      ) {
        navigate('/teacher', { replace: true });
        return;
      }
    }
  }, [isAuthenticated, role, isLoading, currentPath, navigate]);

  return (
    <RouterContext.Provider value={{ currentPath, navigate, selectedStudentId, setSelectedStudentId }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = (): RouterContextType => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};
