import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const TeamProgressChat = () => {
  const { taskId } = useParams(); 
  const navigate = useNavigate();
  
  const [task, setTask] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false); 
  
  const chatEndRef = useRef(null);

  const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || { name: 'Unknown' };
  const isAdmin = window.location.pathname.includes('/admin');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchChatSync = async () => {
    if (isSending) return; 
    try {
      const timestamp = new Date().getTime();
      const response = await api.get(`/tasks/${taskId}?t=${timestamp}`);
      
      const taskData = response.data.task || response.data;
      
      if (taskData) {
        setTask(taskData);
        setMessages(taskData.chat || []);
      }
    } catch (error) {
      console.error("Error syncing chat:", error);
    }
  };

  // Poll database every 2 seconds
  useEffect(() => {
    fetchChatSync(); 
    const interval = setInterval(fetchChatSync, 2000);
    return () => clearInterval(interval); 
  }, [taskId, isSending]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);

    const newMsgObj = {
      sender: currentUser.name || (isAdmin ? 'Admin' : 'Member'),
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, newMsgObj];
    setMessages(updatedMessages);
    setNewMessage("");

    try {
      await api.put(`/tasks/${taskId}`, { chat: updatedMessages });
      await fetchChatSync(); 
    } catch (error) {
      console.error("Error saving message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ padding: '20px', color: 'white', display: 'flex', flexDirection: 'column', height: '85vh' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: '#334155', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          ← Back
        </button>
        <div>
          <h2 style={{ margin: 0, color: '#60a5fa' }}>{task?.taskName || task?.name || 'Task Progress Chat'}</h2>
          <p style={{ margin: 0, color: 'gray', fontSize: '13px' }}>Live Sync Active • Secure Workspace</p>
        </div>
      </div>

      <div style={{ flex: 1, background: '#1a1b2e', padding: '20px', borderRadius: '10px', overflowY: 'auto', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid #334155' }}>
        
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'gray', marginTop: 'auto', marginBottom: 'auto' }}>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender === currentUser.name || (isAdmin && msg.sender === 'Admin');
            
            return (
              <div key={index} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                <span style={{ fontSize: '11px', color: 'gray', marginLeft: '5px', marginBottom: '3px', display: 'block', textAlign: isMe ? 'right' : 'left' }}>
                  {msg.sender} • {msg.timestamp}
                </span>
                <div style={{ 
                  background: isMe ? '#4f46e5' : '#334155', 
                  padding: '12px 16px', 
                  borderRadius: '12px',
                  borderBottomRightRadius: isMe ? '2px' : '12px',
                  borderBottomLeftRadius: isMe ? '12px' : '2px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{msg.text}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type an update or question..." 
          style={{ flex: 1, padding: '15px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none', fontSize: '15px' }}
          disabled={isSending}
        />
        <button type="submit" disabled={isSending} style={{ background: isSending ? '#94a3b8' : '#60a5fa', color: '#0f172a', border: 'none', padding: '0 25px', borderRadius: '8px', cursor: isSending ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
          {isSending ? '...' : 'Send'}
        </button>
      </form>
      
    </div>
  );
};

export default TeamProgressChat;