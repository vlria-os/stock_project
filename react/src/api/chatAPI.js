import axios from "axios";

const BASE_URL=`${import.meta.env.VITE_GATEWAY_URL}/api/ai`;

const chatApi=axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

chatApi.interceptors.request.use((config) => {
    const token=localStorage.getItem('token');
    if(token){
        config.headers.Authorization=`Bearer ${token}`;
    }

    return config;
});

export const chatOrder=async(threadId, message) => {
    const res=await chatApi.post("/chat", {
        thread_id: threadId,
        message: message
    });

    return res.data;
}