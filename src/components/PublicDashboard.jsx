import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../config';
import { Search, Tag, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function PublicDashboard() {
  const [email, setEmail] = useState('');
  const [tickets, setTickets] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/tickets/user?email=${encodeURIComponent(email)}`);
      setTickets(res.data);
      setSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatId = (id) => 'TKT-' + String(id).padStart(5, '0');

  return (
    <div className="app-container">
      <div className="glass-panel animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto 40px' }}>
        <h1 className="text-2xl font-bold text-center mb-2">Consulta tus Casos</h1>
        <p className="text-muted text-center mb-6">Ingresa el correo con el que registraste tus tickets.</p>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <input 
            type="email" 
            required
            className="form-input" 
            placeholder="desarrollador@empresa.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button type="submit" className="btn" disabled={loading}>
            <Search size={18} />
          </button>
        </form>
      </div>

      {searched && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-6 mobile-col">
            <h2 className="text-xl font-bold">Historial de {email}</h2>
            <Link to="/" className="btn btn-secondary mobile-full-width">Registrar Nuevo</Link>
          </div>
          
          {tickets.length === 0 ? (
            <div className="glass-panel text-center p-8">
              <p className="text-muted">No se encontraron tickets asociados a este correo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {tickets.map(t => (
                <div key={t.id} className="glass-panel" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => navigate(`/status/ticket/${t.id}?email=${encodeURIComponent(email)}`)}>
                  <div className="flex justify-between items-start mb-3">
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{formatId(t.id)}</span>
                    <span className={`status-badge status-${t.status.replace(' ', '-').toLowerCase()}`}>{t.status}</span>
                  </div>
                  <h3 className="font-bold mb-2" style={{ fontSize: '1.05rem' }}>{t.subject}</h3>
                  <div className="flex items-center gap-4 text-muted" style={{ fontSize: '0.85rem' }}>
                    <span className="flex items-center gap-1"><Tag size={12}/> {t.category}</span>
                    <span>{format(new Date(t.createdAt), 'dd MMM yyyy')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
