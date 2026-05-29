import axios from "axios";

const BASE_URL="http://52.95.252.64:8080/api/trade";

const tradeApi=axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
})

export const order=async(param) => {
    const res=await tradeApi.post(`${BASE_URL}/order`, param);
    return res.data;
}
