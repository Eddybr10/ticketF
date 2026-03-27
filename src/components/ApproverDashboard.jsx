import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, LogOut, CheckCircle, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { BACKEND_URL } from '../config';

export default function ApproverDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
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
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="app-container" style={{ maxWidth: '900px', padding: '60px 20px' }}>
      <div className="flex justify-between items-center mb-10">
         <div className="flex items-center gap-4">
            <div style={{ background: 'var(--primary)', color: 'var(--primary-text)', padding: '12px', borderRadius: '16px', boxShadow: 'var(--shadow)' }}>
               <ShieldCheck size={28} />
            </div>
            <div>
               <h1 className="text-3xl font-bold" style={{ margin: 0, letterSpacing: '-1px' }}>Panel Gerencial</h1>
               <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>Decisiones de infraestructura y presupuesto.</p>
            </div>
         </div>
         <button className="btn btn-secondary" style={{ borderRadius: '24px', padding: '10px 20px', fontSize: '0.85rem', border: 'none', boxShadow: 'var(--shadow)' }} onClick={handleLogout}>
            <LogOut size={16}/> Salir
         </button>
      </div>

      <div className="animate-fade-in">
         <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
               <Clock size={20} color="var(--warning)" /> Pendientes de Voto
            </h2>
            <span style={{ fontSize: '0.85rem', background: 'var(--btn-secondary-bg)', padding: '4px 12px', borderRadius: '12px', fontWeight: 600 }}>
               {tickets.length} Tickets
            </span>
         </div>

         {loading ? (
            <div className="glass-panel text-center py-20" style={{ border: 'none', boxShadow: 'var(--shadow)' }}>
               <p className="text-muted animate-pulse">Sincronizando con base de datos...</p>
            </div>
         ) : tickets.length === 0 ? (
            <div className="glass-panel text-center py-20" style={{ border: 'none', background: 'var(--bg-card)', boxShadow: 'var(--shadow)', borderRadius: '20px' }}>
               <div style={{ marginBottom: '20px', opacity: 0.1 }}>
                  <CheckCircle size={80} color="var(--success)" />
               </div>
               <h3 className="text-xl font-bold mb-2">¡Todo al día!</h3>
               <p className="text-muted">No tienes requerimientos pendientes de aprobación en este momento.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 gap-6">
               {tickets.map(t => (
                  <div key={t.id} className="glass-panel" style={{ border: 'none', boxShadow: 'var(--shadow)', padding: '0', overflow: 'hidden', borderRadius: '20px' }}>
                     <div className="flex mobile-col">
                        <div style={{ width: '8px', background: t.urgency === 'Crítica' ? '#ef4444' : 'var(--primary)' }}></div>
                        <div style={{ padding: '24px', flex: 1 }}>
                           <div className="flex justify-between items-start mb-4">
                              <div>
                                 <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {t.brand} • TKT-{String(t.id).padStart(5, '0')}
                                 </span>
                                 <h3 className="text-xl font-bold mt-1">{t.subject}</h3>
                              </div>
                              <span className={`status-badge status-${t.status.replace(' ', '-').toLowerCase()}`} style={{ borderRadius: '20px' }}>
                                 {t.status}
                              </span>
                           </div>
                           
                           <p className="text-muted mb-6" style={{ fontSize: '0.95rem', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {t.description}
                           </p>

                           <div className="flex justify-between items-center">
                              <div className="flex gap-4">
                                 <div>
                                    <p className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>Urgencia</p>
                                    <p style={{ fontWeight: 700, color: t.urgency === 'Crítica' ? '#ef4444' : 'inherit', fontSize: '0.85rem' }}>{t.urgency}</p>
                                 </div>
                                 <div>
                                    <p className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>Solicitante</p>
                                    <p style={{ fontWeight: 500, fontSize: '0.85rem' }}>{t.email.split('@')[0]}</p>
                                 </div>
                              </div>
                              <Link to={`/approvals/ticket/${t.id}`} className="btn" style={{ borderRadius: '24px', padding: '10px 24px', fontWeight: 600, gap: '10px' }}>
                                 Evaluar Requerimiento <ArrowRight size={18} />
                              </Link>
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
      <p className="text-muted text-center mt-12" style={{ fontSize: '0.8rem', opacity: 0.5 }}>
         © {new Date().getFullYear()} Sistema de Aprobaciones • OEModa Corporativo
      </p>
    </div>
  );
}
