import fs from 'fs';
import 'dotenv/config'

export const CORS_url = process.env.CORS_url || 'http://localhost:5173'
export const GOOGLE_CREDENTIALS = process.env.GOOGLE_CREDENTIALS || fs.readFileSync('./credenciales.json', 'utf-8')

export const PORT = process.env.PORT || 3000

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export const backend = process.env.BACKEND || 'http://localhost:3000'
export const client_id = process.env.CLIENT_ID
export const client_secret = process.env.CLIENT_SECRET
export const refresh_token = process.env.REFRESH_TOKEN
