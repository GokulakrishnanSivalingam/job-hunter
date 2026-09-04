import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? "/api" : "https://job-hunter-xp4k.onrender.com/api"),
});

export default client;
