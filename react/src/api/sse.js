const BASE_URL=import.meta.env.VITE_GATEWAY_URL;

//sse 전용 쿠키 발급
async function issueSseCookie(){
    await fetch(`${BASE_URL}/auth/sse-cookie`, {
        method: 'POST',
        credentials: "include" //Refresh Token 쿠키 자동 전송
    });
}

export async function connectTradeSSE(onTrade, onTradeError) {
    // await issueSseCookie(); //sse 연결 전에 쿠키 발급(https 처리 후 다시 동작)

    const eventSource=new EventSource(`${BASE_URL}/api/trade/sse/connect`, {
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
        if(!e.data) return;
        const data=JSON.parse(e.data);
        onTradeError(data);
    });

    return eventSource;
}