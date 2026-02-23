import { createContext } from 'react';
import type { CartContextType } from '@/providers/CartContext';

export const CartContext = createContext<CartContextType | undefined>(undefined);
