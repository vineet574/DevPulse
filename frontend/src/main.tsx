import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from "@react-oauth/google"
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>

    <GoogleOAuthProvider clientId="378892758986-8m7434jcaf9b7798sdlvj28bhkjp5bjr.apps.googleusercontent.com">

      <App />

    </GoogleOAuthProvider>

  </StrictMode>,
)