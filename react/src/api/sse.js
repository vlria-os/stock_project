const BASE_URL="http://52.95.252.64:8080/api/trade";

export function connectTradeSSE(onTrade, onTradeError) {
    const eventSource=new EventSource(`${BASE_URL}/sse/connect`, {
        withCredentials: true
    });

    //connect 이벤트는 무시
    eventSource.addEventListener("connect", () => {});

    //체결 성공
    eventSource.addEventListener("trade", (e) => {
        const data=JSON.parse(e.data);
        onTrade(data);
    });

    //시스템 에러
    eventSource.addEventListener("error", (e) => {
        const data=JSON.parse(e.data);
        onTradeError(data);
    });

    return eventSource;
}