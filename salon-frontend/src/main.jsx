import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './css/index.css' // <-- Make sure this path is updated!
import axios from 'axios'; 

// On Vercel / in production, always use relative URLs ('') so requests route via /api/* on the same domain.
// Never use localhost in production!
const apiUrl = import.meta.env.VITE_API_URL;
axios.defaults.baseURL = (import.meta.env.PROD || !apiUrl || apiUrl.includes('localhost')) ? '' : apiUrl;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)