import { createContext } from 'react';
import type { CartContextType } from '@/context/CartContext';

export const CartContext = createContext<CartContextType | undefined>(undefined);
