import { createContext } from 'react';
import type { AuthContextType } from '@/context/AuthContext';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
