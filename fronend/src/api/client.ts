import axios from 'axios'

export const api = axios.create({
    baseURL: 'https://tet-a-tet-api.onrender.com/api',
})