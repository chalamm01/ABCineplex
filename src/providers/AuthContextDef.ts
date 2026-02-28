import { createContext } from 'react';
import type { AuthContextType } from '@/providers/AuthContext';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
