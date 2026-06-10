import axios from "axios";

const BASE_URL=`${import.meta.env.VITE_GATEWAY_URL}/api/trade`;

const tradeApi=axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

tradeApi.interceptors.request.use((config) => {
    const token=localStorage.getItem('token');
    if(token){
        config.headers.Authorization=`Bearer ${token}`;
    }

    return config;
});

export const order=async(param) => {
    const res=await tradeApi.post(`/order`, param);
    return res.data;
}

export const cancelOrder=async(id) => {
    const res=await tradeApi.delete(`/order/${id}`);
    return res.data;
}

export const orders=async(status, page, sort) => {
    const res=await tradeApi.get(`/orders`, {
        params: {
            page: page,
            sort: sort,
            size: 10,
            ...(status && { status })
        }
    });

    return res.data;
}

export const trades=async(page, sort) => {
    const res=await tradeApi.get(`/trades`, {
        params: {
            page: page,
            sort: sort,
            size: 10
        }
    });

    return res.data;
}

export const holdings=async(page) => {
    const res=await tradeApi.get(`/holdings`, {
        params: {
            page: page,
            size: 10
        }
    });

    return res.data;
}
