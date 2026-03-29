import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Всегда используем local-режим (DockerDesktop backend).
localStorage.setItem("sa_apiMode", "local");

createRoot(document.getElementById("root")!).render(<App />);