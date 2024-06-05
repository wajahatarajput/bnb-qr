import axios from "axios";
import { SERVER_URL } from "../config";

// Create Axios instance with default headers
export const server = axios.create({
    baseURL: `${SERVER_URL}`, // Replace with your API base URL
    headers: {
        "Content-Type": "application/json",
    },
});

// Intercept requests to include JWT token in headers if available
server.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("authToken"); // Assuming you store token in localStorage
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);