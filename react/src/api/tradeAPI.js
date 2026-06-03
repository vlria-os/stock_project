import axios from "axios";

const BASE_URL="http://52.95.252.64:8080/api/trade";

const tradeApi=axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
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
            status: status,
            page: page,
            sort: sort,
            size: 10
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
