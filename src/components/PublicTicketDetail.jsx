import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { BACKEND_URL } from '../config';
import { ArrowLeft, Send } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function PublicTicketDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const formatId = (id) => 'TKT-' + String(id).padStart(5, '0');

  useEffect(() => {
    if (!email) return;
    const fetchData = async () => {
      try {
        const ticketRes = await axios.get(`${BACKEND_URL}/api/tickets/user?email=${encodeURIComponent(email)}`);
        const found = ticketRes.data.find(t => t.id.toString() === id);
        if (found) setTicket(found);
        
        const msgRes = await axios.get(`${BACKEND_URL}/api/tickets/${id}/messages`);
        setMessages(msgRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, email]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const res = await axios.post(`${BACKEND_URL}/api/tickets/${id}/messages`, {
        sender: email,
        message: newMessage,
        isAdmin: false
      });
      setMessages([...messages, { id: res.data.messageId, sender: email, message: newMessage, createdAt: new Date() }]);
      setNewMessage('');
      toast.success('Respuesta enviada al equipo.');
    } catch (err) {
      console.error(err);
      toast.error('Error enviando.');
    }
  };

  if (loading) return <div className="app-container"><p>Cargando información...</p></div>;
  if (!ticket) return <div className="app-container"><p>Ticket no encontrado o acceso denegado.</p></div>;

  return (
    <div className="app-container" style={{ maxWidth: '800px' }}>
      <Link to={`/status?email=${encodeURIComponent(email)}`} className="btn btn-secondary mb-6" style={{ width: 'fit-content', padding: '8px 16px', fontSize: '0.85rem' }}>
        <ArrowLeft size={16} /> Volver a mis Casos
      </Link>
      
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{formatId(ticket.id)}</h1>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>{ticket.brand}</p>
          </div>
          <span className={`status-badge status-${ticket.status.replace(' ', '-').toLowerCase()}`}>{ticket.status}</span>
        </div>
        
        <h3 className="font-bold mb-2">{ticket.subject}</h3>
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem' }}>{ticket.description}</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
         <h2 className="text-xl font-bold mb-6">Hilo de Respuestas</h2>
         
         <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px', paddingRight: '10px' }}>
            {messages.length === 0 ? (
              <p className="text-center text-muted">Aún no hay respuestas en este ticket.</p>
            ) : (
              messages.map(msg => {
                const isAdminMsg = msg.sender === 'Development Team' || msg.sender === 'Admin';
                return (
                 <div key={msg.id} className={`message-bubble ${isAdminMsg ? 'message-admin' : 'message-user'}`}>
                   <div className="flex justify-between items-center mb-2">
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isAdminMsg ? 'var(--primary)' : 'var(--text-main)' }}>
                        {msg.sender === email ? 'Tú' : msg.sender}
                      </span>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{format(new Date(msg.createdAt), 'HH:mm • dd/MM')}</span>
                   </div>
                   <p style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>{msg.message}</p>
                 </div>
                )
              })
            )}
         </div>
         
         {ticket.status !== 'Cerrado' && ticket.status !== 'Resuelto' ? (
           <form onSubmit={handleSendMessage}>
             <textarea 
                className="form-textarea" 
                style={{ minHeight: '80px', marginBottom: '12px' }} 
                placeholder="Escribe tu respuesta para el equipo técnico..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
             />
             <button type="submit" className="btn" style={{ width: '100%' }}>
               <Send size={16} /> Enviar Respuesta
             </button>
           </form>
         ) : (
           <div className="text-center p-4 border rounded" style={{ borderColor: 'var(--glass-border)', background: 'var(--bg-main)', borderRadius: '8px' }}>
             <p className="text-muted">Este caso ha sido marcado como Cerrado o Resuelto y no admite más mensajes.</p>
           </div>
         )}
      </div>
    </div>
  );
}
