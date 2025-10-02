import fs from 'fs';

const rawCredentials = fs.readFileSync('../../credenciales.json', 'utf-8');

export const CORS_url = process.env.CORS_url || 'http://localhost:5173'
export const GOOGLE_CREDENTIALS= process.env.GOOGLE_CREDENTIALS || rawCredentials

export const PORT = process.env.PORT || 3100