// src/main.tsx
/**
 * @file main.tsx
 * @description main entry point for the React application. It sets up the React application and renders it to the DOM. 
 * It also wraps the application in a BrowserRouter to enable routing within the app.
 * @author Mauro Sakugawa
 * @date 2024-06-01
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)