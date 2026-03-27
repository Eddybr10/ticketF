import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BACKEND_URL } from '../config';
import { ArrowLeft, Send, Download, Calendar, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [status, setStatus] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [updating, setUpdating] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const formatId = (id) => 'TKT-' + String(id).padStart(5, '0');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return navigate('/admin/login');
    
    const fetchTicket = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/admin/tickets/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTicket(res.data);
        setStatus(res.data.status);
        setDueDate(res.data.dueDate || '');
        
        const msgRes = await axios.get(`${BACKEND_URL}/api/tickets/${id}/messages`);
        setMessages(msgRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTicket();
  }, [id, navigate]);

  const handleUpdate = async (overrideStatus = null) => {
    setUpdating(true);
    const token = localStorage.getItem('adminToken');
    const finalStatus = overrideStatus || status;
    try {
      await axios.put(`${BACKEND_URL}/api/admin/tickets/${id}`, {
        status: finalStatus, dueDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus(finalStatus);
      toast.success('Ticket guardado y notificado.');
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar.');
    }
    setUpdating(false);
  };

  const handleRequestApproval = async () => {
    if (updating) return;
    setUpdating(true);
    const token = localStorage.getItem('adminToken');
    try {
      await axios.post(`${BACKEND_URL}/api/admin/tickets/${id}/request-approval`, { comment: approvalComment }, { headers: { Authorization: `Bearer ${token}` }});
      toast.success('Ticket mandado a Aprobación');
      setShowApprovalModal(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error(err);
      toast.error('Error al enviar a aprobación');
      setUpdating(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const res = await axios.post(`${BACKEND_URL}/api/tickets/${id}/messages`, {
        sender: 'Development Team',
        message: newMessage,
        isAdmin: true
      });
      setMessages([...messages, { id: res.data.messageId, sender: 'Development Team', message: newMessage, createdAt: new Date() }]);
      setNewMessage('');
      toast.success('Mensaje enviado al usuario.');
    } catch (err) {
      console.error(err);
      toast.error('Error enviando.');
    }
  };

  if (!ticket) return <div className="app-container"><p>Iniciando...</p></div>;

  return (
    <div className="app-container" style={{ maxWidth: '1000px' }}>
      <Link to="/admin" className="btn btn-secondary mb-6" style={{ width: 'fit-content', padding: '8px 16px', fontSize: '0.85rem' }}>
        <ArrowLeft size={16} /> Lista de Tickets
      </Link>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Detail Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>{ticket.brand}</p>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{formatId(ticket.id)}</h1>
              </div>
              <span className={`status-badge status-${status.replace(' ', '-').toLowerCase()}`}>
                {status}
              </span>
            </div>
            
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Solicitante</p>
                  <p style={{ fontSize: '0.9rem' }}>{ticket.email}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Fecha</p>
                  <p style={{ fontSize: '0.9rem' }}>{format(new Date(ticket.createdAt), 'dd MMM yyyy, HH:mm')}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Categoría / SLA</p>
                  <p style={{ fontSize: '0.9rem' }}>{ticket.category} • <span style={{ color: ticket.urgency === 'Crítica' ? '#ef4444' : 'inherit' }}>{ticket.urgency}</span></p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Teléfono</p>
                  <p style={{ fontSize: '0.9rem' }}>{ticket.phone || '-'}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6 p-4" style={{ background: 'var(--bg-dark)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <h3 className="font-bold mb-2" style={{ fontSize: '1rem' }}>{ticket.subject}</h3>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem', color: '#d4d4d8' }}>{ticket.description}</p>
            </div>
            
            {ticket.filePath && (
              <div>
                <a href={`${BACKEND_URL}/uploads/${ticket.filePath}`} target="_blank" rel="noreferrer" className="btn btn-secondary flex items-center gap-2" style={{ width: '100%' }}>
                  <Download size={16} /> Adjunto: {ticket.originalFileName}
                </a>
              </div>
            )}
          </div>
          
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 className="font-bold mb-4">Manejo de Caso</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
               <div className="form-group" style={{ margin: 0 }}>
                 <label className="form-label">Modificar Estado</label>
                 <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                   <option value="Abierto">Abierto</option>
                   <option value="En progreso">En progreso</option>
                   <option value="En espera">En espera</option>
                   <option value="Resuelto">Resuelto</option>
                   <option value="Cerrado">Cerrado</option>
                 </select>
               </div>
               <div className="form-group" style={{ margin: 0 }}>
                 <label className="form-label">Fecha Límite</label>
                 <div className="flex items-center gap-2 relative">
                    <Calendar size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                    <input type="date" className="form-input" style={{ paddingLeft: '38px', fontSize: '0.85rem' }} value={dueDate} onChange={e => setDueDate(e.target.value)} />
                 </div>
               </div>
            </div>
            
            {ticket.approvalState === 'None' || !ticket.approvalState ? (
               showApprovalModal ? (
                 <div className="mb-4 p-4" style={{ background: 'var(--bg-dark)', borderRadius: '8px', border: '1px solid var(--warning)' }}>
                    <p className="font-bold mb-2" style={{ color: 'var(--warning)', fontSize: '0.9rem' }}>Mensaje para los Gerentes</p>
                    <textarea 
                      className="form-textarea"
                      placeholder="Agrega un comentario sobre por qué solicitas aprobación..."
                      value={approvalComment}
                      onChange={(e) => setApprovalComment(e.target.value)}
                      style={{ minHeight: '80px', marginBottom: '12px', fontSize: '0.85rem' }}
                    ></textarea>
                    <div className="flex gap-2">
                       <button className="btn btn-secondary" style={{ flex: 1, borderColor: 'var(--warning)', color: 'var(--warning)' }} onClick={handleRequestApproval} disabled={updating}>
                         Confirmar Envío
                       </button>
                       <button className="btn btn-secondary" style={{ padding: '8px 12px' }} onClick={() => setShowApprovalModal(false)} disabled={updating}>
                         Cancelar
                       </button>
                    </div>
                 </div>
               ) : (
                 <button 
                   className="btn btn-secondary mb-4" 
                   style={{ width: '100%', borderColor: 'var(--warning)', color: 'var(--warning)' }} 
                   onClick={() => setShowApprovalModal(true)}
                 >
                   Mandar a Aprobación (Karen y Raúl)
                 </button>
               )
            ) : (
               <div className="mb-4 p-3" style={{ border: '1px solid var(--glass-border)', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <p className="font-bold mb-2">Estado de Aprobación:</p>
                  <div className="flex justify-between items-center mb-1">
                     <span>Aprobador: Karen</span>
                     <span style={{ fontWeight: 'bold', color: ticket.karenApproval === 'Approved' ? 'var(--success)' : ticket.karenApproval === 'Rejected' ? 'var(--danger)' : 'var(--warning)'}}>{ticket.karenApproval}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span>Aprobador: Raúl</span>
                     <span style={{ fontWeight: 'bold', color: ticket.raulApproval === 'Approved' ? 'var(--success)' : ticket.raulApproval === 'Rejected' ? 'var(--danger)' : 'var(--warning)'}}>{ticket.raulApproval}</span>
                  </div>
               </div>
            )}
            
            <div className="flex gap-4">
               <button className="btn" onClick={() => handleUpdate()} disabled={updating} style={{ flex: 1 }}>
                 Guardar Cambios
               </button>
               {status !== 'Resuelto' && status !== 'Cerrado' && (
                 <button className="btn btn-secondary" onClick={() => handleUpdate('Resuelto')} disabled={updating} title="Marcar como Resuelto">
                   <CheckSquare size={18} color="var(--success)" />
                 </button>
               )}
            </div>
          </div>
        </div>
        
        {/* Messaging Timeline Panel */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <h2 className="text-xl font-bold mb-6">Hilo de Conversación</h2>
          
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', paddingRight: '10px' }}>
            {messages.length === 0 ? (
              <div className="text-center text-muted" style={{ marginTop: '40px' }}>
                 <p style={{ fontSize: '0.85rem' }}>No hay mensajes registrados aún.</p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`message-bubble ${msg.sender === 'Development Team' || msg.sender === 'Admin' ? 'message-admin' : 'message-user'}`}>
                  <div className="flex justify-between items-center mb-2">
                     <span style={{ fontSize: '0.8rem', fontWeight: 500, color: msg.sender === 'Development Team' || msg.sender === 'Admin' ? 'var(--primary)' : 'var(--text-main)' }}>{msg.sender}</span>
                     <span className="text-muted" style={{ fontSize: '0.75rem' }}>{format(new Date(msg.createdAt), 'HH:mm • dd/MM')}</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>{msg.message}</p>
                </div>
              ))
            )}
          </div>
          
          <form onSubmit={handleSendMessage} style={{ marginTop: 'auto' }}>
            <textarea 
               className="form-textarea" 
               style={{ minHeight: '100px', marginBottom: '12px', fontSize: '0.9rem' }} 
               placeholder="Registra un avance o responde al usuario..."
               value={newMessage}
               onChange={e => setNewMessage(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>
              <Send size={16} /> Enviar Mensaje
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
