import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CalendarDays, Clock, DollarSign, Users, CheckCircle, XCircle, LogOut, ChevronLeft, ChevronRight, MessageCircle, Mail, ClipboardList } from 'lucide-react';

const DAYS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function MiniCalendar({ selectedDate, onSelectDate, appointmentDates }) {
  const [viewDate, setViewDate] = useState(new Date());
  const year = viewDate.getFullYear(), month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return (
    <div className="calendar-wrap">
      <div className="calendar-header">
        <h3>{MONTHS[month]} {year}</h3>
        <div className="calendar-nav">
          <button onClick={() => setViewDate(new Date(year, month-1, 1))}><ChevronLeft size={16}/></button>
          <button onClick={() => setViewDate(new Date(year, month+1, 1))}><ChevronRight size={16}/></button>
        </div>
      </div>
      <div className="calendar-grid">
        {DAYS.map(d => <div key={d} className="calendar-day-label">{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} className="calendar-day empty"></div>;
          const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          return <div key={ds} className={`calendar-day ${ds===today?'today':''} ${ds===selectedDate?'selected':''} ${appointmentDates?.includes(ds)?'has-events':''}`} onClick={()=>onSelectDate(ds)}>{day}</div>;
        })}
      </div>
    </div>
  );
}

const StylistDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('today');
  const [appointments, setAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [earnings, setEarnings] = useState({ totalEarnings:0, totalClients:0, appointments:[] });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const res = await axios.get(`/api/appointments/stylist/${user._id}?date=${selectedDate}`, { headers });
      setAppointments(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [user, selectedDate, token]);

  const fetchAllAppointments = useCallback(async () => {
    if (!user) return;
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const res = await axios.get(`/api/appointments/stylist/${user._id}`, { headers });
      setAllAppointments(res.data);
    } catch (err) { console.error(err); }
  }, [user, token]);

  const fetchEarnings = useCallback(async () => {
    if (!user) return;
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const res = await axios.get(`/api/appointments/earnings/${user._id}?date=${selectedDate}`, { headers });
      setEarnings(res.data);
    } catch (err) { console.error(err); }
  }, [user, selectedDate, token]);

  useEffect(() => {
    if (!user || user.role !== 'stylist') { navigate('/login'); return; }
    fetchAppointments(); fetchEarnings(); fetchAllAppointments();
  }, [user, navigate, fetchAppointments, fetchEarnings, fetchAllAppointments]);

  const handleStatusChange = async (id, status) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      await axios.put(`/api/appointments/${id}/status`, { status }, { headers });
      fetchAppointments(); fetchEarnings();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const openWhatsApp = (phone, name, service, date, time) => {
    const msg = encodeURIComponent(`Hola ${name}, le escribimos de BarberShop Pro. Su cita de "${service}" está programada para el ${date} a las ${time}. ¿Nos confirma su asistencia?`);
    const clean = phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${clean}?text=${msg}`, '_blank');
  };

  const openEmail = (email, name, service, date, time) => {
    const subject = encodeURIComponent(`BarberShop Pro - Recordatorio de Cita`);
    const body = encodeURIComponent(`Estimado/a ${name},\n\nLe recordamos que tiene una cita programada:\n\nServicio: ${service}\nFecha: ${date}\nHora: ${time}\n\nSi necesita reprogramar o cancelar, por favor contáctenos.\n\nSaludos,\nBarberShop Pro`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const pending = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
  const completed = appointments.filter(a => a.status === 'completed');
  const cancelled = appointments.filter(a => a.status === 'cancelled' || a.status === 'no-show');
  const appointmentDates = [...new Set(allAppointments.map(a => a.date?.slice(0,10)))];

  const tabs = [
    { id:'today', icon:<ClipboardList size={18}/>, label:'Mis Citas' },
    { id:'calendar', icon:<CalendarDays size={18}/>, label:'Calendario' },
    { id:'earnings', icon:<DollarSign size={18}/>, label:'Ingresos' },
  ];

  if (!user) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <a href="/estilista" className="sidebar-brand"><img src="/images/logo.jpg" alt="Logo"/><span>BarberShop</span></a>
        <nav className="sidebar-nav">
          {tabs.map(t => <button key={t.id} className={`sidebar-link ${activeTab===t.id?'active':''}`} onClick={()=>setActiveTab(t.id)}>{t.icon} {t.label}</button>)}
        </nav>
        <div className="sidebar-user">
          <div className="sidebar-user-info"><div className="avatar">{user.name?.[0]}</div><div><div className="uname">{user.name}</div><div className="urole">Estilista</div></div></div>
          <button className="sidebar-link" onClick={handleLogout}><LogOut size={18}/> Cerrar Sesión</button>
        </div>
      </aside>
      <div className="mobile-nav">{tabs.map(t => <button key={t.id} className={activeTab===t.id?'active':''} onClick={()=>setActiveTab(t.id)}>{t.icon} {t.label}</button>)}</div>

      <main className="dashboard-main">
        <div className="page-header">
          <h2>{activeTab==='today'?'Mis Citas':activeTab==='calendar'?'Calendario':activeTab==='earnings'?'Mis Ingresos':''}</h2>
          <div className="form-group" style={{flexDirection:'row',alignItems:'center',gap:'10px'}}>
            <label style={{margin:0,whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:'6px'}}><CalendarDays size={14}/> Fecha:</label>
            <input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} style={{width:'auto'}}/>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon-wrap warn-bg"><Clock size={22}/></div><div className="stat-info"><div className="stat-value" style={{color:'var(--warning)'}}>{pending.length}</div><div className="stat-label">En Espera</div></div></div>
          <div className="stat-card"><div className="stat-icon-wrap success-bg"><CheckCircle size={22}/></div><div className="stat-info"><div className="stat-value" style={{color:'var(--success)'}}>{completed.length}</div><div className="stat-label">Atendidos</div></div></div>
          <div className="stat-card"><div className="stat-icon-wrap gold-bg"><DollarSign size={22}/></div><div className="stat-info"><div className="stat-value" style={{color:'var(--gold)'}}>S/ {earnings.totalEarnings}</div><div className="stat-label">Ingresos del Día</div></div></div>
          <div className="stat-card"><div className="stat-icon-wrap info-bg"><Users size={22}/></div><div className="stat-info"><div className="stat-value" style={{color:'var(--info)'}}>{appointments.length}</div><div className="stat-label">Total Citas</div></div></div>
        </div>

        {(activeTab === 'today') && (
          <div>
            {loading ? <div className="loading-screen" style={{minHeight:'20vh'}}><div className="spinner"></div></div>
            : appointments.length === 0 ? <div style={{textAlign:'center',padding:'60px 20px',color:'var(--text-muted)'}}><CalendarDays size={48} style={{marginBottom:'12px',opacity:0.3}}/><p>No hay citas para esta fecha</p></div>
            : <>
              {pending.length > 0 && <div style={{marginBottom:'2rem'}}>
                <h3 style={{marginBottom:'16px',color:'var(--warning)',display:'flex',alignItems:'center',gap:'8px'}}><Clock size={20}/> En Espera ({pending.length})</h3>
                <table className="data-table"><thead><tr><th>Cliente</th><th>Teléfono</th><th>Servicio</th><th>Hora</th><th>Precio</th><th>Contactar</th><th>Acciones</th></tr></thead>
                <tbody>{pending.map(a => <tr key={a._id}>
                  <td><strong>{a.clientName}</strong></td><td>{a.clientPhone}</td><td>{a.service?.name}</td><td>{a.startTime} - {a.endTime}</td><td style={{color:'var(--gold)'}}>S/ {a.price}</td>
                  <td><div className="contact-btns">
                    <button className="btn btn-whatsapp btn-xs" onClick={()=>openWhatsApp(a.clientPhone,a.clientName,a.service?.name,a.date?.slice(0,10),a.startTime)}><MessageCircle size={12}/> WhatsApp</button>
                    {a.clientEmail && <button className="btn btn-email btn-xs" onClick={()=>openEmail(a.clientEmail,a.clientName,a.service?.name,a.date?.slice(0,10),a.startTime)}><Mail size={12}/> Email</button>}
                  </div></td>
                  <td><div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                    <button className="btn btn-success btn-xs" onClick={()=>handleStatusChange(a._id,'completed')}><CheckCircle size={12}/> Atendido</button>
                    <button className="btn btn-danger btn-xs" onClick={()=>handleStatusChange(a._id,'cancelled')}><XCircle size={12}/> Cancelar</button>
                  </div></td>
                </tr>)}</tbody></table>
              </div>}
              {completed.length > 0 && <div style={{marginBottom:'2rem'}}>
                <h3 style={{marginBottom:'16px',color:'var(--success)',display:'flex',alignItems:'center',gap:'8px'}}><CheckCircle size={20}/> Atendidos ({completed.length})</h3>
                <table className="data-table"><thead><tr><th>Cliente</th><th>Servicio</th><th>Hora</th><th>Precio</th><th>Estado</th></tr></thead>
                <tbody>{completed.map(a => <tr key={a._id}><td>{a.clientName}</td><td>{a.service?.name}</td><td>{a.startTime} - {a.endTime}</td><td style={{color:'var(--gold)'}}>S/ {a.price}</td><td><span className="badge badge-completed">Completado</span></td></tr>)}</tbody></table>
              </div>}
              {cancelled.length > 0 && <div>
                <h3 style={{marginBottom:'16px',color:'var(--danger)',display:'flex',alignItems:'center',gap:'8px'}}><XCircle size={20}/> Cancelados ({cancelled.length})</h3>
                <table className="data-table"><thead><tr><th>Cliente</th><th>Servicio</th><th>Hora</th><th>Estado</th></tr></thead>
                <tbody>{cancelled.map(a => <tr key={a._id}><td>{a.clientName}</td><td>{a.service?.name}</td><td>{a.startTime}</td><td><span className="badge badge-cancelled">Cancelado</span></td></tr>)}</tbody></table>
              </div>}
            </>}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div style={{display:'grid',gridTemplateColumns:'340px 1fr',gap:'24px'}}>
            <MiniCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} appointmentDates={appointmentDates}/>
            <div>
              <h3 style={{marginBottom:'16px'}}>Citas del {selectedDate}</h3>
              {appointments.length === 0 ? <p style={{color:'var(--text-muted)'}}>Sin citas para esta fecha</p> : (
                <table className="data-table"><thead><tr><th>Cliente</th><th>Teléfono</th><th>Servicio</th><th>Hora</th><th>Contactar</th><th>Estado</th></tr></thead>
                <tbody>{appointments.map(a => <tr key={a._id}><td>{a.clientName}</td><td>{a.clientPhone}</td><td>{a.service?.name}</td><td>{a.startTime}</td>
                <td><div className="contact-btns">
                  <button className="btn btn-whatsapp btn-xs" onClick={()=>openWhatsApp(a.clientPhone,a.clientName,a.service?.name,a.date?.slice(0,10),a.startTime)}><MessageCircle size={12}/></button>
                  {a.clientEmail && <button className="btn btn-email btn-xs" onClick={()=>openEmail(a.clientEmail,a.clientName,a.service?.name,a.date?.slice(0,10),a.startTime)}><Mail size={12}/></button>}
                </div></td>
                <td><span className={`badge badge-${a.status}`}>{a.status}</span></td></tr>)}</tbody></table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'earnings' && (
          <div>
            <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'40px',textAlign:'center',marginBottom:'2rem'}}>
              <p style={{fontSize:'0.8rem',color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'2px',marginBottom:'8px'}}>Ingresos del Día</p>
              <p style={{fontSize:'3.2rem',fontWeight:700,fontFamily:'Playfair Display,serif',color:'var(--gold)',marginBottom:'8px'}}>S/ {earnings.totalEarnings}</p>
              <p style={{color:'var(--text-secondary)'}}>{earnings.totalClients} cliente{earnings.totalClients!==1?'s':''} atendido{earnings.totalClients!==1?'s':''}</p>
            </div>
            {earnings.appointments && earnings.appointments.length > 0 && (
              <div><h3 style={{marginBottom:'16px'}}>Detalle de Servicios</h3>
              <table className="data-table"><thead><tr><th>Cliente</th><th>Servicio</th><th>Hora</th><th>Monto</th></tr></thead>
              <tbody>{earnings.appointments.map(a => <tr key={a._id}><td>{a.clientName}</td><td>{a.service?.name}</td><td>{a.startTime}</td><td style={{color:'var(--gold)',fontWeight:600}}>S/ {a.price}</td></tr>)}</tbody></table></div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
export default StylistDashboard;
