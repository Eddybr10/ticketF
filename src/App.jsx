import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Sun, Moon } from 'lucide-react';

import ClientView from './components/ClientView';
import PublicDashboard from './components/PublicDashboard';
import PublicTicketDetail from './components/PublicTicketDetail';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import TicketDetail from './components/TicketDetail';
import ApproverDashboard from './components/ApproverDashboard';
import ApproverTicketDetail from './components/ApproverTicketDetail';

function ThemeToggle() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <button 
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
      className="btn btn-secondary" 
      style={{ position: 'absolute', top: '16px', right: '16px', padding: '10px', zIndex: 1000, borderRadius: '50%' }}
      title="Alternar Tema Claro/Oscuro"
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}

function App() {
  return (
    <Router>
      <Toaster position="bottom-right" toastOptions={{
        style: { background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }
      }} />
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<ClientView />} />
        <Route path="/status" element={<PublicDashboard />} />
        <Route path="/status/ticket/:id" element={<PublicTicketDetail />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/ticket/:id" element={<TicketDetail />} />
        <Route path="/approvals" element={<ApproverDashboard />} />
        <Route path="/approvals/ticket/:id" element={<ApproverTicketDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
