import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FileUp, Send, CheckCircle, Trash2, Mail, Phone, Tag, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { BACKEND_URL } from '../config';

export default function ClientView() {
  const [formData, setFormData] = useState({
    brand: 'cloe.com.mx',
    category: 'Bug',
    urgency: 'Media',
    phone: '',
    subject: '',
    description: '',
    email: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.description.length < 20) {
      toast.error('La descripción debe tener al menos 20 caracteres.');
      return;
    }
    
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (file) data.append('file', file);

      await axios.post(`${BACKEND_URL}/api/tickets`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      setFormData({ brand: 'cloe.com.mx', category: 'Bug', urgency: 'Media', phone: '', subject: '', description: '', email: '' });
      setFile(null);
      toast.success('El ticket se ha enviado con éxito.');
    } catch (error) {
      console.error(error);
      toast.error('Hubo un error de conexión con el backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if(e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      toast.success('Archivo preparado');
    }
  };

  if (success) {
    return (
      <div className="app-container">
        <div className="glass-panel text-center animate-fade-in">
          <CheckCircle size={56} style={{ margin: '0 auto 24px', color: 'var(--success)' }} />
          <h2 className="text-3xl font-bold mb-4">Ticket Recibido</h2>
          <p className="text-muted mb-8" style={{ fontSize: '1.1rem' }}>Hemos enviado una confirmación a tu correo con los detalles.</p>
          <button className="btn btn-secondary" onClick={() => setSuccess(false)}>Crear nuevo ticket</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="flex justify-end mb-4">
        <Link to="/status" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Ver Mis Casos</Link>
      </div>
      <div className="glass-panel animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Eddy's Tickets</h1>
          <p className="text-muted mt-2">Danos los detalles técnicos de lo que necesitas.</p>
        </div>

        <form onSubmit={handleSubmit}>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Entorno / Marca</label>
              <select className="form-select" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})}>
                <option value="cloe.com.mx">cloe.com.mx</option>
                <option value="Factory Store Online">Factory Store Online</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label flex items-center gap-2"><Mail size={14}/> Correo Electrónico</label>
              <input type="email" required className="form-input" placeholder="desarrollador@empresa.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label flex items-center gap-2"><Tag size={14}/> Categoría</label>
              <select className="form-select" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="Bug">Bug (Error en la plataforma)</option>
                <option value="Feature">Feature (Nuevo requerimiento)</option>
                <option value="Support">Support (Mantenimiento)</option>
                <option value="Question">Question (Consulta técnica)</option>
                <option value="Other">Other (Otro)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label flex items-center gap-2"><AlertCircle size={14}/> Urgencia (SLA)</label>
              <select className="form-select" value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value})}>
                <option value="Baja">Baja (15 a 20 días)</option>
                <option value="Media">Media (7 a 14 días)</option>
                <option value="Alta">Alta (3 a 7 días)</option>
                <option value="Crítica">Crítica (Inmediata)</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label flex items-center gap-2">Asunto / Resumen</label>
              <input type="text" required className="form-input" placeholder="Ej. Falla en el checkout" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}/>
            </div>
            <div className="form-group">
              <label className="form-label flex items-center gap-2"><Phone size={14}/> Teléfono (Opcional)</label>
              <input type="tel" className="form-input" placeholder="Tu número" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}/>
            </div>
          </div>

          <div className="form-group relative">
            <label className="form-label">Descripción Técnica</label>
            <textarea 
              required
              className="form-textarea" 
              placeholder="Describe detalladamente los pasos para replicar el problema o los requerimientos..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
            <span style={{ position: 'absolute', bottom: '12px', right: '16px', fontSize: '0.75rem', color: formData.description.length < 20 ? 'var(--warning)' : 'var(--text-muted)' }}>
              {formData.description.length} caracteres
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Archivos (Capturas, Logs)</label>
            <div 
               className={`file-upload-area flex flex-col items-center justify-center relative ${isDragging ? 'drag-over' : ''}`} 
               onClick={() => !file && fileInputRef.current.click()}
               onDragOver={handleDragOver}
               onDragLeave={handleDragLeave}
               onDrop={handleDrop}
            >
              {!file ? (
                <>
                  <FileUp size={28} style={{ margin: '0 auto 10px', color: 'var(--text-muted)' }} />
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>Haz clic o arrastra un archivo aquí</p>
                </>
              ) : (
                <div className="flex items-center gap-4">
                   <p style={{ color: 'var(--primary)', fontWeight: 500 }}>{file.name}</p>
                   <button 
                     type="button" 
                     className="btn btn-secondary" 
                     style={{ padding: '6px' }} 
                     onClick={(e) => { e.stopPropagation(); setFile(null); toast('Archivo descartado'); }}
                   >
                     <Trash2 size={14} color="var(--danger)" />
                   </button>
                </div>
              )}
              <input 
                ref={fileInputRef} 
                type="file" 
                style={{ display: 'none' }}
                onChange={e => {
                  if(e.target.files[0]) {
                    setFile(e.target.files[0]);
                    toast.success('Archivo preparado');
                  }
                }}
              />
            </div>
          </div>

          <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Enviando...' : <><Send size={18} /> Crear Ticket</>}
          </button>
        </form>
        <p className="text-muted text-center mt-8 mb-2" style={{ fontSize: '0.8rem', opacity: 0.6 }}>Sistema desarrollado por Eddy</p>
      </div>
    </div>
  );
}
