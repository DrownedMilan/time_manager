import axios from 'axios'

// export const API_URL = import.meta.env.VITE_API_URL
export const API_URL = 'http://localhost:4000/api'

export const axios_api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})
