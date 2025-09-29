import React from 'react'
import ReactDOM from 'react-dom/client'
import Routing from './routes/Routing'
import './index.css'

//EU7u1.p7.a1.1ln - Auth toggle firebase/mongo - global switch interceptor reads
window.__AUTH_PROVIDER__ = import.meta.env.VITE_AUTH_PROVIDER || "mongodb";       

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
     <Routing/>
  </React.StrictMode>,
)
