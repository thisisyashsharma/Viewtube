import React from 'react'
import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
import Routing from './routes/Routing'
import './index.css'

import axios from "axios";
axios.defaults.withCredentials = true;


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
     <Routing/>
  </React.StrictMode>,
)
