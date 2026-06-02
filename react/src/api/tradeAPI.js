import axios from "axios";

const BASE_URL="http://52.95.252.64:8080/api/trade";

const tradeApi=axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

export const order=async(param) => {
    const res=await tradeApi.post(`${BASE_URL}/order`, param);
    return res.data;
}

export const cancelOrder=async(id) => {
    const res=await tradeApi.delete(`${BASE_URL}/order/${id}`);
    return res.data;
}

export const orders=async(status, page, sort) => {
    const res=await tradeApi.get(`${BASE_URL}/orders`, {
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
    const res=await tradeApi.get(`${BASE_URL}/trades`, {
        params: {
            page: page,
            sort: sort,
            size: 10
        }
    });

    return res.data;
}

export const holdings=async(page) => {
    const res=await tradeApi.get(`${BASE_URL}/holdings`, {
        params: {
            page: page,
            size: 10
        }
    });

    return res.data;
}
