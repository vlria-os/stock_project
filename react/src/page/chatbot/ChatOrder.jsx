import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid';
import { chatOrder } from '../../api/chatAPI';

const ChatOrder = () => {
  const [messages, setMessages]=useState([]);
  const [input, setInput]=useState("");
  const [threadId]=useState(() => uuidv4());
  const [isLoading, setIsLoading]=useState(false);

  const sendMessage=async() => {
    if(!input.trim() || isLoading) return;

    const userMessage={role: "user", content: input.trim()};
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const res=await chatOrder(threadId, input.trim());

    const assistantMessage={role: "assistant", content: res.message};
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  }

  return (
    <div>ChatOrder</div>
  )
}

export default ChatOrder