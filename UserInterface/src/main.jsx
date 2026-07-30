import React from 'react'
import ReactDOM from 'react-dom/client'
import Routing from './routes/Routing'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";
axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Routing />
    </ErrorBoundary>
  </React.StrictMode>,
)

