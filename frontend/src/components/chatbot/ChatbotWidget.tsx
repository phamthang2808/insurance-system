import React, { useState, useRef, useEffect } from "react";
import { Box, IconButton, Paper, Typography, TextField, Button, Avatar, CircularProgress } from "@mui/material";
import apiClient from "@/services/apiClient";

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 24, height: 24 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 20, height: 20 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
}

export const ChatbotWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", sender: "bot", text: "Xin chào! Tôi là trợ lý ảo. Tôi có thể giúp gì cho bạn hôm nay?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), sender: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await apiClient.post("/chatbot/ask", { question: userMsg.text });
      const data = res.data;
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        sender: "bot", 
        text: data.answer || "Xin lỗi, đã có lỗi xảy ra." 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: "bot", text: "Mất kết nối máy chủ." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
      {open ? (
        <Paper elevation={6} sx={{ width: 350, height: 500, display: "flex", flexDirection: "column", borderRadius: 3, overflow: "hidden" }}>
          {/* Header */}
          <Box sx={{ p: 2, backgroundColor: "#4f46e5", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle1" fontWeight={600}>Trợ lý Ảo AI</Typography>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          {/* Messages */}
          <Box sx={{ flex: 1, p: 2, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1.5, backgroundColor: "#f8fafc" }}>
            {messages.map(msg => (
              <Box key={msg.id} sx={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start" }}>
                {msg.sender === "bot" && (
                  <Avatar sx={{ width: 28, height: 28, mr: 1, bgcolor: "#4f46e5", fontSize: "0.8rem" }}>AI</Avatar>
                )}
                <Box sx={{
                  maxWidth: "75%",
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: msg.sender === "user" ? "#4f46e5" : "white",
                  color: msg.sender === "user" ? "white" : "#1e293b",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                }}>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>{msg.text}</Typography>
                </Box>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: "flex" }}>
                <Avatar sx={{ width: 28, height: 28, mr: 1, bgcolor: "#4f46e5", fontSize: "0.8rem" }}>AI</Avatar>
                <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: "white" }}>
                  <CircularProgress size={16} />
                </Box>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>
          
          {/* Input */}
          <Box sx={{ p: 1.5, borderTop: "1px solid #e2e8f0", backgroundColor: "white", display: "flex", gap: 1 }}>
            <TextField 
              fullWidth 
              size="small" 
              placeholder="Nhập câu hỏi..." 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === "Enter" && handleSend()}
              disabled={loading}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 5 } }}
            />
            <Button variant="contained" onClick={handleSend} disabled={loading || !input.trim()} sx={{ borderRadius: 5, minWidth: "auto", px: 2, backgroundColor: "#4f46e5" }}>
              Gửi
            </Button>
          </Box>
        </Paper>
      ) : (
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            width: 56, height: 56,
            backgroundColor: "#4f46e5",
            color: "white",
            boxShadow: 3,
            "&:hover": { backgroundColor: "#4338ca" }
          }}
        >
          <ChatIcon />
        </IconButton>
      )}
    </Box>
  );
};
