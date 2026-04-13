import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Chat.css';

export default function Chat({ isOpen, onClose, driverName = "Your Driver", bookingId, customerId }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchMessages();
      const sub = supabase.channel('customer-chat')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `booking_id=eq.${bookingId}` }, (payload) => {
          setMessages(prev => [...prev, payload.new]);
          setTimeout(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight), 100);
        })
        .subscribe();
      return () => supabase.removeChannel(sub);
    }
  }, [isOpen, bookingId]);

  const fetchMessages = async () => {
    const { data } = await supabase.from('chat_messages').select('*').eq('booking_id', bookingId).order('created_at', { ascending: true });
    if (data) {
      setMessages(data);
      setTimeout(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight), 100);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !bookingId) return;

    try {
      await supabase.from('chat_messages').insert({
        booking_id: bookingId,
        sender_id: customerId,
        text: inputValue
      });
      setInputValue('');
    } catch {
      alert("Failed to send message.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="chat-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="chat-container" initial={{ y: 50, scale: 0.9, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 20, scale: 0.95, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
            <div className="chat-header">
              <div className="driver-info">
                <div className="driver-avatar"><User size={20} /></div>
                <div>
                  <h4>{driverName}</h4>
                  <p>Executive Fleet Driver</p>
                </div>
              </div>
              <button className="close-btn" onClick={onClose}><X size={20} /></button>
            </div>

            <div className="chat-messages" ref={scrollRef}>
              {messages.map((msg) => {
                const isMe = msg.sender_id === customerId;
                return (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`chat-bubble-wrapper ${isMe ? 'user' : 'driver'}`}>
                    <div className={`chat-bubble ${isMe ? 'user' : 'driver'}`}>
                      <p>{msg.text}</p>
                    </div>
                  </motion.div>
                );
              })}
              {messages.length === 0 && <p style={{textAlign: 'center', color: '#888', marginTop: '20px'}}>Say hello to your driver.</p>}
            </div>

            <form className="chat-input-area" onSubmit={handleSend}>
              <input type="text" placeholder="Message your driver..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
              <button type="submit" disabled={!inputValue.trim()} className="send-btn"><Send size={18} /></button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
