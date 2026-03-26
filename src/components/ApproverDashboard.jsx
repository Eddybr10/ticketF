import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, LogOut, CheckCircle } from 'lucide-react';
import { BACKEND_URL } from '../config';

export default function ApproverDashboard() {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return navigate('/admin/login');
    const fetchTickets = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/approver/tickets`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTickets(res.data);
      } catch (err) {
         navigate('/admin/login');
      }
    };
    fetchTickets();
  }, [navigate]);

  return (
    <div className="app-container" style={{ maxWidth: '700px' }}>
      <div className="flex justify-between items-center mb-8">
         <h1 className="text-2xl font-bold flex items-center gap-3 text-center w-full justify-center">
           <CheckCircle size={28} color="var(--primary)" /> Panel de Aprobaciones Gerenciales
         </h1>
      </div>

      <div className="glass-panel">
         <div className="flex justify-between items-center mb-6 mobile-col">
            <h2 className="text-lg font-bold">Tickets Esperando tu Voto</h2>
            <button className="btn btn-secondary mobile-full-width" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => { localStorage.removeItem('adminToken'); navigate('/admin/login'); }}>
               <LogOut size={14}/> Cerrar sesión
            </button>
         </div>

         {tickets.length === 0 ? (
            <p className="text-center text-muted py-8">¡Excelente! No hay tickets pendientes de aprobación.</p>
         ) : (
            <div className="grid grid-cols-1 gap-4">
               {tickets.map(t => (
                  <div key={t.id} className="p-4 border rounded" style={{ borderColor: 'var(--glass-border)', background: 'var(--bg-main)' }}>
                     <div className="flex justify-between items-center mb-2">
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>TKT-{String(t.id).padStart(5, '0')}</span>
                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>{t.brand}</span>
                     </div>
                     <h3 className="font-bold mb-2">{t.subject}</h3>
                     <p className="text-muted text-sm mb-4" style={{ fontSize: '0.9rem' }}>{t.description.substring(0, 100)}...</p>
                     
                     <Link to={`/approvals/ticket/${t.id}`} className="btn" style={{ width: '100%', padding: '8px' }}>
                        Revisar y Votar
                     </Link>
                  </div>
               ))}
            </div>
         )}
      </div>
      <p className="text-muted text-center mt-6" style={{ fontSize: '0.8rem', opacity: 0.7 }}>Aprobaciones de Eddy's Tickets</p>
    </div>
  );
}
