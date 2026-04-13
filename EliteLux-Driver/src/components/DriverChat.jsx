import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { X, Send } from 'lucide-react';

export default function DriverChat({ bookingId, driverId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const sub = supabase.channel('chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `booking_id=eq.${bookingId}` }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [bookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    const { data } = await supabase.from('chat_messages').select('*').eq('booking_id', bookingId).order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await supabase.from('chat_messages').insert({
        booking_id: bookingId,
        sender_id: driverId,
        text: newMessage
      });
      setNewMessage('');
    } catch {
      alert('Failed to send.');
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', width: '350px', height: '500px', background: '#111', border: '1px solid #333', borderRadius: '12px', display: 'flex', flexDirection: 'column', zIndex: 1000, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
      <div style={{ background: '#0a0a0a', padding: '15px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>Customer Comm Channel</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={20} /></button>
      </div>
      
      <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.map((msg, idx) => {
          const isMe = msg.sender_id === driverId;
          return (
            <div key={idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%', padding: '10px 15px', borderRadius: '8px', background: isMe ? '#c6a87c' : '#222', color: isMe ? '#000' : '#fff' }}>
              {msg.text}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={{ padding: '15px', borderTop: '1px solid #333', display: 'flex', gap: '10px', background: '#0a0a0a' }}>
        <input 
          type="text" 
          value={newMessage} 
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Message Customer..." 
          style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #333', background: '#111', color: '#fff' }}
        />
        <button type="submit" style={{ background: '#c6a87c', color: '#000', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
