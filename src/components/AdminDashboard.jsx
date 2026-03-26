import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { BACKEND_URL } from '../config';
import { LayoutDashboard, LogOut, Search, Filter } from 'lucide-react';
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

  const formatId = (id) => 'TKT-' + String(id).padStart(5, '0');

  return (
    <div className="admin-layout animate-fade-in">
      <div className="admin-sidebar">
        <div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <LayoutDashboard size={20} /> Eddy's Tickets
          </h2>
          
          <div className="form-group">
            <label className="form-label flex items-center gap-2"><Filter size={14}/> Filtrar por Estado</label>
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">Todos</option>
              <option value="Abierto">Abiertos</option>
              <option value="En progreso">En Progreso</option>
              <option value="En espera">En Espera</option>
              <option value="Resuelto">Resueltos</option>
              <option value="Cerrado">Cerrados</option>
            </select>
          </div>
        </div>
        
        <div style={{ marginTop: 'auto' }}>
          <p className="text-muted text-center mb-4" style={{ fontSize: '0.75rem', opacity: 0.7 }}>Creado por Eddy</p>
          <button className="btn btn-secondary flex items-center justify-center gap-2" onClick={handleLogout} style={{ width: '100%' }}>
            <LogOut size={16} /> Salir
          </button>
        </div>
      </div>
      
      <div className="admin-content">
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="stat-card">
            <span className="stat-label">Total Tickets</span>
            <span className="stat-value">{total}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Atención Requerida</span>
            <span className="stat-value" style={{ color: 'var(--warning)' }}>{pending}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Críticos Abiertos</span>
            <span className="stat-value" style={{ color: 'var(--danger)' }}>{critical}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-6 mobile-col">
          <h1 className="text-2xl font-bold">Listado de Tickets</h1>
          <div className="form-group search-mobile" style={{ margin: 0, width: '320px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', top: '13px', left: '16px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Buscar por correo o asunto..." 
              style={{ paddingLeft: '44px' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="glass-panel table-wrapper" style={{ padding: '0' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Requerimiento</th>
                <th>Categoría</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 500, color: 'var(--primary)' }}>{formatId(t.id)}</td>
                  <td>
                     <p style={{ margin: 0, fontWeight: 500 }}>{t.subject}</p>
                     <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>{t.email} • {t.brand}</p>
                  </td>
                  <td className="text-muted">{t.category || '-'}</td>
                  <td>
                     {t.urgency === 'Crítica' && <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Crítica</span>}
                     {t.urgency === 'Alta' && <span style={{ color: '#f43f5e' }}>Alta</span>}
                     {t.urgency === 'Media' && <span style={{ color: 'var(--warning)' }}>Media</span>}
                     {(t.urgency === 'Baja' || !t.urgency) && <span style={{ color: 'var(--text-muted)' }}>Baja</span>}
                  </td>
                  <td>
                    <span className={`status-badge status-${t.status.replace(' ', '-').toLowerCase()}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/admin/ticket/${t.id}`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Revisar</Link>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted" style={{ padding: '40px' }}>No se encontraron tickets.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
