// src/services/api.ts
import axios from 'axios'

// l'URL viendra de ton fichier .env
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Création d'une instance Axios configurée
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})
