import { createContext } from 'react';

export const MeetingContext = createContext(null);

export function MeetingProvider({ children }) {
  return children;
}