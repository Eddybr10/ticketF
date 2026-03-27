import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { BACKEND_URL } from '../config';
import { LayoutDashboard, LogOut, Search, Filter, AlertCircle, Clock, Target } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) return navigate('/admin/login');
      try {
        const res = await axios.get(`${BACKEND_URL}/api/admin/tickets`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTickets(res.data);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/admin/login');
        }
      }
    };
    fetchTickets();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || 
                          t.email.toLowerCase().includes(search.toLowerCase()) ||
                          t.brand.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const total = tickets.length;
  const critical = tickets.filter(t => t.urgency === 'Crítica' && t.status !== 'Cerrado').length;
  const pending = tickets.filter(t => t.status === 'Abierto' || t.status === 'En espera').length;
  const inProgress = tickets.filter(t => t.status === 'En progreso').length;

  const formatId = (id) => 'TKT-' + String(id).padStart(5, '0');

  const getInitials = (email) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="admin-layout animate-fade-in" style={{ backgroundColor: 'var(--bg-main)' }}>
      <div className="admin-sidebar" style={{ borderRight: '1px solid var(--glass-border)', background: 'var(--bg-card)', padding: '32px 24px' }}>
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div style={{ background: 'var(--primary)', color: 'var(--primary-text)', padding: '10px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <LayoutDashboard size={24} />
            </div>
            <h2 className="text-xl font-bold m-0" style={{ letterSpacing: '-0.5px' }}>Workspace</h2>
          </div>
          
          <div className="form-group mb-8">
            <label className="form-label flex items-center gap-2" style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>
              <Filter size={14}/> Filtro Global
            </label>
            <select className="form-select" style={{ cursor: 'pointer', fontWeight: 500 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">Todos los estados</option>
              <option value="Abierto">Abiertos</option>
              <option value="En progreso">En Progreso</option>
              <option value="En espera">En Espera</option>
              <option value="Resuelto">Resueltos</option>
              <option value="Cerrado">Cerrados</option>
            </select>
          </div>
        </div>
        
        <div style={{ marginTop: 'auto' }}>
          <div style={{ background: 'var(--btn-secondary-bg)', padding: '16px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center', border: '1px solid var(--btn-secondary-border)' }}>
             <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>Admin Panel</p>
             <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.75rem' }}>Acceso total garantizado</p>
          </div>
          <button className="btn btn-secondary flex items-center justify-center gap-2" onClick={handleLogout} style={{ width: '100%', color: 'var(--danger)' }}>
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </div>
      
      <div className="admin-content" style={{ padding: '40px 50px' }}>
        <div className="flex justify-between items-center mb-10 mobile-col">
          <div>
            <h1 className="text-3xl font-bold" style={{ margin: '0 0 8px 0', letterSpacing: '-1px' }}>Dashboard Resumen</h1>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.95rem' }}>Monitorea y gestiona los tickets de soporte de tu equipo.</p>
          </div>
          <div className="form-group search-mobile" style={{ margin: 0, width: '380px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Buscar por cliente, correo, asunto o ID..." 
              style={{ paddingLeft: '48px', paddingRight: '16px', height: '46px', borderRadius: '24px', boxShadow: 'var(--shadow)', border: 'none' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-10">
          <div className="stat-card" style={{ padding: '24px', border: 'none', boxShadow: 'var(--shadow)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-15px', right: '-15px', opacity: 0.05 }}><Target size={120}/></div>
            <div className="flex items-center gap-3 mb-2">
               <div style={{ padding: '8px', background: 'var(--btn-secondary-bg)', borderRadius: '8px' }}><Target size={20} color="var(--primary)"/></div>
               <span className="stat-label" style={{ margin: 0 }}>Total Registros</span>
            </div>
            <span className="stat-value text-3xl">{total}</span>
          </div>

          <div className="stat-card" style={{ padding: '24px', border: 'none', boxShadow: 'var(--shadow)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-15px', right: '-15px', opacity: 0.05 }}><Clock size={120}/></div>
            <div className="flex items-center gap-3 mb-2">
               <div style={{ padding: '8px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px' }}><Clock size={20} color="var(--warning)"/></div>
               <span className="stat-label" style={{ margin: 0 }}>En Espera / Abiertos</span>
            </div>
            <span className="stat-value text-3xl" style={{ color: 'var(--warning)' }}>{pending}</span>
          </div>

          <div className="stat-card" style={{ padding: '24px', border: 'none', boxShadow: 'var(--shadow)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-15px', right: '-15px', opacity: 0.05 }}><LayoutDashboard size={120}/></div>
            <div className="flex items-center gap-3 mb-2">
               <div style={{ padding: '8px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px' }}><LayoutDashboard size={20} color="#8b5cf6"/></div>
               <span className="stat-label" style={{ margin: 0 }}>En Progreso</span>
            </div>
            <span className="stat-value text-3xl" style={{ color: '#8b5cf6' }}>{inProgress}</span>
          </div>

          <div className="stat-card" style={{ padding: '24px', border: 'none', boxShadow: 'var(--shadow)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-15px', right: '-15px', opacity: 0.05 }}><AlertCircle size={120}/></div>
            <div className="flex items-center gap-3 mb-2">
               <div style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}><AlertCircle size={20} color="var(--danger)"/></div>
               <span className="stat-label" style={{ margin: 0 }}>Críticos Abiertos</span>
            </div>
            <span className="stat-value text-3xl" style={{ color: 'var(--danger)' }}>{critical}</span>
          </div>
        </div>

        <div className="glass-panel table-wrapper" style={{ padding: '0', border: 'none', boxShadow: 'var(--shadow)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Flujo de Trabajo Pendiente</h3>
             <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mostrando {filteredTickets.length} resultados</span>
          </div>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--btn-secondary-bg)' }}>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>ID Ticket</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Solicitante & Asunto</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Prioridad</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Estado</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(t => (
                <tr key={t.id} style={{ transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '20px 24px', fontWeight: 600, color: 'var(--primary)' }}>{formatId(t.id)}</td>
                  <td style={{ padding: '20px 24px' }}>
                     <div className="flex items-center gap-4">
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-text)', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                           {getInitials(t.email)}
                        </div>
                        <div>
                           <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>{t.subject}</p>
                           <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>{t.email} • <span style={{ opacity: 0.7 }}>{t.brand}</span></p>
                        </div>
                     </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                     {t.urgency === 'Crítica' && <span style={{ color: '#ef4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertCircle size={14}/> Crítica</span>}
                     {t.urgency === 'Alta' && <span style={{ color: '#f43f5e', fontWeight: 500 }}>Alta</span>}
                     {t.urgency === 'Media' && <span style={{ color: 'var(--warning)', fontWeight: 500 }}>Media</span>}
                     {(t.urgency === 'Baja' || !t.urgency) && <span style={{ color: 'var(--text-muted)' }}>Baja</span>}
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span className={`status-badge status-${t.status.replace(' ', '-').toLowerCase()}`}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <Link to={`/admin/ticket/${t.id}`} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '20px', fontWeight: 600 }}>Revisar</Link>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-muted" style={{ padding: '60px 20px' }}>
                     <div className="flex flex-col items-center gap-4">
                        <Search size={48} style={{ opacity: 0.2 }} />
                        <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No se encontraron coincidencias</p>
                        <p style={{ fontSize: '0.9rem' }}>Intenta ajustando los filtros de búsqueda.</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
