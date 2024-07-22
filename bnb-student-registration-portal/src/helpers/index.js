import axios from "axios";
import { toast } from "react-toastify";
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

// Intercept responses to handle errors
server.interceptors.response.use(
    (response) => {
        // Any status code that lie within the range of 2xx cause this function to trigger
        return response;
    },
    (error) => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            switch (error.response.status) {
                case 400:
                    // Handle bad request errors
                    toast.error("Bad request", error.response.data);
                    break;
                case 401:
                    // Handle unauthorized errors
                    toast.error("Unauthorized", error.response.data);
                    // Optionally, you could log out the user or redirect to login page
                    break;
                case 403:
                    // Handle forbidden errors
                    toast.error("Forbidden", error.response.data);
                    break;
                case 404:
                    // Handle not found errors
                    toast.error("Not found", error.response.data);
                    break;
                case 500:
                    // Handle internal server errors
                    toast.error("Internal server error", error.response.data);
                    break;
                default:
                    // Handle other status codes
                    toast.error("Error", error.response.data);
            }
        } else if (error.request) {
            // The request was made but no response was received
            toast.error("No response received", error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            toast.error("Error", error.message);
        }
        return Promise.reject(error);
    }
);
