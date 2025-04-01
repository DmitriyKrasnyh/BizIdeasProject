import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';
import './transitions.css'; // <-- 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>  {/* ✅ Здесь Router */}
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
