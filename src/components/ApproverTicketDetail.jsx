import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, MessageSquare, AlertCircle, Calendar, User, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { BACKEND_URL } from '../config';

export default function ApproverTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return navigate('/admin/login');
    
    const fetchData = async () => {
      try {
        const [ticketRes, msgRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/admin/tickets/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${BACKEND_URL}/api/tickets/${id}/messages`)
        ]);
        setTicket(ticketRes.data);
        setMessages(msgRes.data);
      } catch (err) {
        toast.error('Ticket no encontrado o sin acceso');
        navigate('/approvals');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleVote = async (vote) => {
    const token = localStorage.getItem('adminToken');
    try {
       await axios.post(`${BACKEND_URL}/api/approver/tickets/${id}/vote`, { vote, comment }, {
          headers: { Authorization: `Bearer ${token}` }
       });
       toast.success(`Ticket ${vote === 'Approved' ? 'Aprobado' : 'Rechazado'}`);
       navigate('/approvals');
    } catch (err) {
       toast.error('Hubo un error al procesar el voto.');
    }
  };

  const adminComment = messages.find(m => m.sender === 'System' && m.message.includes('Comentario del Administrador:'))?.message;

  if (loading) return (
    <div className="app-container flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
      <div className="animate-pulse flex flex-col items-center">
        <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '50%', marginBottom: '16px' }}></div>
        <p className="text-muted">Cargando evaluación...</p>
      </div>
    </div>
  );

  if (!ticket) return null;

  return (
    <div className="app-container" style={{ maxWidth: '900px', padding: '40px 20px' }}>
      <Link to="/approvals" className="btn btn-secondary mb-8" style={{ width: 'fit-content', padding: '10px 20px', fontSize: '0.85rem', borderRadius: '24px', border: 'none', boxShadow: 'var(--shadow)' }}>
        <ArrowLeft size={16} /> Volver a Aprobaciones
      </Link>
      
      <div className="animate-fade-in">
        <div className="flex justify-between items-end mb-8">
           <div>
              <h1 className="text-3xl font-bold" style={{ letterSpacing: '-1px', marginBottom: '8px' }}>Evaluar Requerimiento</h1>
              <p className="text-muted">ID de Seguimiento: <span style={{ color: 'var(--primary)', fontWeight: 600 }}>TKT-{String(ticket.id).padStart(5, '0')}</span></p>
           </div>
           <div className={`status-badge status-${ticket.status?.replace(' ', '-').toLowerCase()}`} style={{ padding: '8px 16px', borderRadius: '24px' }}>
              {ticket.status}
           </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Admin's Instruction Highlight */}
          {adminComment && (
            <div className="glass-panel" style={{ border: 'none', background: 'rgba(59, 130, 246, 0.05)', borderLeft: '5px solid #3b82f6', padding: '24px', boxShadow: 'var(--shadow)' }}>
               <div className="flex items-center gap-2 mb-3" style={{ color: '#3b82f6' }}>
                  <MessageSquare size={18} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Instrucción del Administrador</span>
               </div>
               <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.6', color: 'var(--text-main)', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
                  {adminComment.split('Comentario del Administrador:\n')[1] || adminComment}
               </p>
            </div>
          )}

          <div className="glass-panel" style={{ border: 'none', boxShadow: 'var(--shadow)', padding: '32px' }}>
            <div className="grid grid-cols-2 gap-8 mb-8">
               <div className="flex flex-col gap-1">
                  <span className="text-muted flex items-center gap-2" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}><FileText size={14}/> Asunto del Ticket</span>
                  <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{ticket.subject}</p>
               </div>
               <div className="flex flex-col gap-1">
                  <span className="text-muted flex items-center gap-2" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}><User size={14}/> Solicitante</span>
                  <p style={{ fontSize: '1rem' }}>{ticket.email}</p>
               </div>
               <div className="flex flex-col gap-1">
                  <span className="text-muted flex items-center gap-2" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}><AlertCircle size={14}/> Prioridad Declarada</span>
                  <span style={{ 
                    color: ticket.urgency === 'Crítica' ? '#ef4444' : ticket.urgency === 'Alta' ? '#f43f5e' : 'var(--warning)', 
                    fontWeight: 700,
                    fontSize: '1rem'
                  }}>
                    {ticket.urgency}
                  </span>
               </div>
               <div className="flex flex-col gap-1">
                  <span className="text-muted flex items-center gap-2" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}><Calendar size={14}/> Fecha de Registro</span>
                  <p style={{ fontSize: '1rem' }}>{format(new Date(ticket.createdAt), 'dd MMMM, yyyy')}</p>
               </div>
            </div>

            <div style={{ background: 'var(--bg-main)', padding: '24px', borderRadius: '12px', marginBottom: '32px' }}>
               <span className="text-muted block mb-3" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Descripción Detallada</span>
               <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '0.95rem', color: 'var(--text-main)' }}>{ticket.description}</p>
            </div>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '32px' }}>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CheckCircle size={22} color="var(--primary)" /> Tu Veredicto Final
              </h3>
              
              <div className="form-group mb-6">
                <textarea 
                  className="form-textarea" 
                  style={{ minHeight: '100px', borderRadius: '12px', border: '1px solid var(--glass-border)', padding: '16px', background: 'var(--bg-main)' }}
                  placeholder="Escribe aquí tus observaciones gerenciales (opcional)..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
              </div>
              
              <div className="flex gap-4">
                 <button 
                  className="btn" 
                  style={{ flex: 1, background: '#10b981', color: '#fff', fontSize: '1rem', padding: '14px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }} 
                  onClick={() => handleVote('Approved')}
                 >
                   <CheckCircle size={18} /> Aprobar este Ticket
                 </button>
                 <button 
                  className="btn" 
                  style={{ flex: 1, background: '#ef4444', color: '#fff', fontSize: '1rem', padding: '14px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }} 
                  onClick={() => handleVote('Rejected')}
                 >
                   <XCircle size={18} /> Rechazar este Ticket
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
