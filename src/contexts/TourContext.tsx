// src/contexts/TourContext.tsx
import React, { createContext, useContext, useState } from 'react';

type Ctx = { seen: boolean; complete: () => void };
const TourContext = createContext<Ctx>({ seen: true, complete: () => {} });

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [seen, setSeen] = useState(() => localStorage.getItem('tourDone') === '1');
  const complete = () => {
    localStorage.setItem('tourDone', '1');
    setSeen(true);
  };
  return (
    <TourContext.Provider value={{ seen, complete }}>
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => useContext(TourContext);
