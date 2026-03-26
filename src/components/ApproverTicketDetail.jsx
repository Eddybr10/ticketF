import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { BACKEND_URL } from '../config';

export default function ApproverTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return navigate('/admin/login');
    const fetchTicket = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/admin/tickets/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTicket(res.data);
      } catch (err) {
        toast.error('Ticket no encontrado o sin acceso');
        navigate('/approvals');
      }
    };
    fetchTicket();
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

  if (!ticket) return <div className="app-container">Cargando datos...</div>;

  return (
    <div className="app-container" style={{ maxWidth: '800px' }}>
      <Link to="/approvals" className="btn btn-secondary mb-6" style={{ width: 'fit-content', padding: '8px 16px', fontSize: '0.85rem' }}>
        <ArrowLeft size={16} /> Volver a Aprobaciones
      </Link>
      
      <div className="glass-panel mb-6">
        <h1 className="text-2xl font-bold mb-2">Evaluar Ticket TKT-{String(ticket.id).padStart(5, '0')}</h1>
        <p className="text-muted mb-6">El equipo de desarrollo solicita la aprobación de gerencia para iniciar este requerimiento.</p>
        
        <div className="p-4 mb-6" style={{ background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          <p className="mb-2"><strong className="text-muted">Asunto:</strong> <br/>{ticket.subject}</p>
          <p className="mb-2"><strong className="text-muted">Solicitante:</strong> <br/>{ticket.email}</p>
          <p className="mb-2"><strong className="text-muted">Impacto/Urgencia:</strong> <br/><span style={{ color: 'var(--warning)', fontWeight: 600 }}>{ticket.urgency}</span></p>
          <hr style={{ borderColor: 'var(--glass-border)', margin: '16px 0' }} />
          <strong className="text-muted block mb-2">Descripción Completa:</strong>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem' }}>{ticket.description}</p>
        </div>

        <h3 className="font-bold mb-3">Emitir tu Veredicto</h3>
        <textarea 
          className="form-textarea mb-4" 
          style={{ minHeight: '80px' }}
          placeholder="Añade un comentario gerencial adjunto a tu voto (Opcional)..."
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
        
        <div className="grid grid-cols-2 gap-4">
           <button className="btn" style={{ background: '#10b981', color: '#fff', fontSize: '1.1rem', padding: '16px' }} onClick={() => handleVote('Approved')}>
             <CheckCircle size={20} /> Aprobar 
           </button>
           <button className="btn" style={{ background: '#ef4444', color: '#fff', fontSize: '1.1rem', padding: '16px' }} onClick={() => handleVote('Rejected')}>
             <XCircle size={20} /> Rechazar 
           </button>
        </div>
      </div>
    </div>
  );
}
