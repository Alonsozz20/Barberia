import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Users, Scissors, CalendarDays, Plus, Trash2, Edit, LogOut, DollarSign, Clock, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function MiniCalendar({ selectedDate, onSelectDate, appointmentDates }) {
  const [viewDate, setViewDate] = useState(new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
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
          <button onClick={() => setViewDate(new Date(year, month - 1, 1))}><ChevronLeft size={16}/></button>
          <button onClick={() => setViewDate(new Date(year, month + 1, 1))}><ChevronRight size={16}/></button>
        </div>
      </div>
      <div className="calendar-grid">
        {DAYS.map(d => <div key={d} className="calendar-day-label">{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} className="calendar-day empty"></div>;
          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const isToday = dateStr === today;
          const isSel = dateStr === selectedDate;
          const hasEvt = appointmentDates?.includes(dateStr);
          return (
            <div key={dateStr} className={`calendar-day ${isToday?'today':''} ${isSel?'selected':''} ${hasEvt?'has-events':''}`}
              onClick={() => onSelectDate(dateStr)}>
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const AdminDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stylists, setStylists] = useState([]);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date().toISOString().split('T')[0]);
  const [showStylistModal, setShowStylistModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [stylistForm, setStylistForm] = useState({ name:'', email:'', password:'', phone:'' });
  const [serviceForm, setServiceForm] = useState({ name:'', category:'barberia', description:'', duration:30, price:0, stylists:[] });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = useCallback(async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [styRes, srvRes, aptRes] = await Promise.all([
        axios.get('/api/auth/stylists'),
        axios.get('/api/services'),
        axios.get('/api/appointments', { headers })
      ]);
      setStylists(styRes.data);
      setServices(srvRes.data);
      setAppointments(aptRes.data);
    } catch (err) { console.error(err); }
  }, [token]);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    fetchData();
  }, [user, navigate, fetchData]);

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const handleAddStylist = async (e) => {
    e.preventDefault(); setError('');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      await axios.post('/api/auth/register-stylist', stylistForm, { headers });
      setShowStylistModal(false); setStylistForm({name:'',email:'',password:'',phone:''});
      fetchData(); showSuccess('Estilista registrado exitosamente');
    } catch (err) { setError(err.response?.data?.message || 'Error al registrar'); }
  };

  const handleDeleteStylist = async (id) => {
    if (!window.confirm('¿Eliminar este estilista?')) return;
    const headers = { Authorization: `Bearer ${token}` };
    try { await axios.delete(`/api/auth/stylists/${id}`, { headers }); fetchData(); showSuccess('Estilista eliminado'); }
    catch (err) { alert('Error al eliminar'); }
  };

  const handleSaveService = async (e) => {
    e.preventDefault(); setError('');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      if (editingService) { await axios.put(`/api/services/${editingService._id}`, serviceForm, { headers }); showSuccess('Servicio actualizado'); }
      else { await axios.post('/api/services', serviceForm, { headers }); showSuccess('Servicio creado'); }
      setShowServiceModal(false); setEditingService(null);
      setServiceForm({name:'',category:'barberia',description:'',duration:30,price:0,stylists:[]});
      fetchData();
    } catch (err) { setError(err.response?.data?.message || 'Error al guardar'); }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('¿Eliminar este servicio?')) return;
    const headers = { Authorization: `Bearer ${token}` };
    try { await axios.delete(`/api/services/${id}`, { headers }); fetchData(); showSuccess('Servicio eliminado'); }
    catch (err) { alert('Error al eliminar'); }
  };

  const openEditService = (s) => {
    setEditingService(s);
    setServiceForm({ name:s.name, category:s.category, description:s.description||'', duration:s.duration, price:s.price, stylists:s.stylists?.map(x=>x._id||x)||[] });
    setShowServiceModal(true); setError('');
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const todayStr = new Date().toISOString().split('T')[0];
  const calendarAppts = appointments.filter(a => a.date?.slice(0,10) === calendarDate);
  const todayAppts = appointments.filter(a => a.date?.slice(0,10) === todayStr);
  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const completedToday = todayAppts.filter(a => a.status === 'completed');
  const todayEarnings = completedToday.reduce((s,a) => s + (a.price||0), 0);
  const appointmentDates = [...new Set(appointments.map(a => a.date?.slice(0,10)))];

  const tabs = [
    { id:'overview', icon:<LayoutDashboard size={18}/>, label:'Panel General' },
    { id:'calendar', icon:<CalendarDays size={18}/>, label:'Calendario' },
    { id:'stylists', icon:<Users size={18}/>, label:'Estilistas' },
    { id:'services', icon:<Scissors size={18}/>, label:'Servicios' },
  ];

  if (!user) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <a href="/admin" className="sidebar-brand"><img src="/images/logo.jpg" alt="Logo"/><span>BarberShop</span></a>
        <nav className="sidebar-nav">
          {tabs.map(t => <button key={t.id} className={`sidebar-link ${activeTab===t.id?'active':''}`} onClick={()=>setActiveTab(t.id)}>{t.icon} {t.label}</button>)}
        </nav>
        <div className="sidebar-user">
          <div className="sidebar-user-info"><div className="avatar">{user.name?.[0]}</div><div><div className="uname">{user.name}</div><div className="urole">Administrador</div></div></div>
          <button className="sidebar-link" onClick={handleLogout}><LogOut size={18}/> Cerrar Sesión</button>
        </div>
      </aside>
      <div className="mobile-nav">
        {tabs.map(t => <button key={t.id} className={activeTab===t.id?'active':''} onClick={()=>setActiveTab(t.id)}>{t.icon} {t.label}</button>)}
      </div>

      <main className="dashboard-main">
        {successMsg && <div className="toast"><CheckCircle size={18}/> {successMsg}</div>}

        {activeTab === 'overview' && (
          <div>
            <div className="page-header"><h2>Panel General</h2></div>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-icon-wrap gold-bg"><DollarSign size={22}/></div><div className="stat-info"><div className="stat-value" style={{color:'var(--gold)'}}>S/ {todayEarnings}</div><div className="stat-label">Ingresos Hoy</div></div></div>
              <div className="stat-card"><div className="stat-icon-wrap info-bg"><CalendarDays size={22}/></div><div className="stat-info"><div className="stat-value" style={{color:'var(--info)'}}>{todayAppts.length}</div><div className="stat-label">Citas Hoy</div></div></div>
              <div className="stat-card"><div className="stat-icon-wrap warn-bg"><Clock size={22}/></div><div className="stat-info"><div className="stat-value" style={{color:'var(--warning)'}}>{pendingCount}</div><div className="stat-label">Pendientes</div></div></div>
              <div className="stat-card"><div className="stat-icon-wrap success-bg"><Users size={22}/></div><div className="stat-info"><div className="stat-value" style={{color:'var(--success)'}}>{stylists.length}</div><div className="stat-label">Estilistas</div></div></div>
            </div>
            <h3 style={{marginBottom:'16px'}}>Citas de Hoy</h3>
            {todayAppts.length === 0 ? <p style={{color:'var(--text-muted)'}}>No hay citas para hoy</p> : (
              <table className="data-table"><thead><tr><th>Cliente</th><th>Servicio</th><th>Hora</th><th>Estilista</th><th>Estado</th></tr></thead>
              <tbody>{todayAppts.map(a => <tr key={a._id}><td>{a.clientName}</td><td>{a.service?.name}</td><td>{a.startTime} - {a.endTime}</td><td>{a.stylist?.name}</td><td><span className={`badge badge-${a.status}`}>{a.status}</span></td></tr>)}</tbody></table>
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div>
            <div className="page-header"><h2>Calendario de Citas</h2></div>
            <div style={{display:'grid',gridTemplateColumns:'340px 1fr',gap:'24px'}}>
              <MiniCalendar selectedDate={calendarDate} onSelectDate={setCalendarDate} appointmentDates={appointmentDates}/>
              <div>
                <h3 style={{marginBottom:'16px'}}>Citas del {calendarDate}</h3>
                {calendarAppts.length === 0 ? <p style={{color:'var(--text-muted)'}}>Sin citas para esta fecha</p> : (
                  <table className="data-table"><thead><tr><th>Cliente</th><th>Teléfono</th><th>Servicio</th><th>Hora</th><th>Estilista</th><th>Precio</th><th>Estado</th></tr></thead>
                  <tbody>{calendarAppts.map(a => <tr key={a._id}><td>{a.clientName}</td><td>{a.clientPhone}</td><td>{a.service?.name}</td><td>{a.startTime}</td><td>{a.stylist?.name}</td><td style={{color:'var(--gold)'}}>S/ {a.price}</td><td><span className={`badge badge-${a.status}`}>{a.status}</span></td></tr>)}</tbody></table>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stylists' && (
          <div>
            <div className="page-header"><h2>Gestión de Estilistas</h2><button className="btn btn-gold btn-sm" onClick={()=>{setShowStylistModal(true);setError('');}}><Plus size={14}/> Nuevo Estilista</button></div>
            <table className="data-table"><thead><tr><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Acciones</th></tr></thead>
            <tbody>{stylists.map(s => <tr key={s._id}><td style={{display:'flex',alignItems:'center',gap:'10px'}}><div className="avatar" style={{width:32,height:32,fontSize:'0.8rem'}}>{s.name?.[0]}</div> {s.name}</td><td>{s.email}</td><td>{s.phone||'—'}</td><td><button className="btn btn-danger btn-sm" onClick={()=>handleDeleteStylist(s._id)}><Trash2 size={14}/> Eliminar</button></td></tr>)}</tbody></table>
          </div>
        )}

        {activeTab === 'services' && (
          <div>
            <div className="page-header"><h2>Gestión de Servicios</h2><button className="btn btn-gold btn-sm" onClick={()=>{setEditingService(null);setServiceForm({name:'',category:'barberia',description:'',duration:30,price:0,stylists:[]});setShowServiceModal(true);setError('');}}><Plus size={14}/> Nuevo Servicio</button></div>
            <table className="data-table"><thead><tr><th>Servicio</th><th>Categoría</th><th>Duración</th><th>Precio</th><th>Estilistas</th><th>Acciones</th></tr></thead>
            <tbody>{services.map(s => <tr key={s._id}><td><strong>{s.name}</strong><br/><span style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>{s.description}</span></td><td style={{textTransform:'capitalize'}}>{s.category}</td><td>{s.duration} min</td><td style={{color:'var(--gold)',fontWeight:600}}>S/ {s.price}</td><td>{s.stylists?.map(st=>st.name||'').join(', ')||'—'}</td><td><div style={{display:'flex',gap:'8px'}}><button className="btn btn-info btn-sm" onClick={()=>openEditService(s)}><Edit size={14}/> Editar</button><button className="btn btn-danger btn-sm" onClick={()=>handleDeleteService(s._id)}><Trash2 size={14}/> Eliminar</button></div></td></tr>)}</tbody></table>
          </div>
        )}
      </main>

      {showStylistModal && (
        <div className="modal-overlay" onClick={()=>setShowStylistModal(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
          <h2>Registrar Nuevo Estilista</h2>
          {error && <div className="error-msg"><AlertCircle size={16}/> {error}</div>}
          <form onSubmit={handleAddStylist}>
            <div className="form-group" style={{marginBottom:'16px'}}><label>Nombre *</label><input type="text" value={stylistForm.name} onChange={e=>setStylistForm({...stylistForm,name:e.target.value})} required/></div>
            <div className="form-group" style={{marginBottom:'16px'}}><label>Email *</label><input type="email" value={stylistForm.email} onChange={e=>setStylistForm({...stylistForm,email:e.target.value})} required/></div>
            <div className="form-group" style={{marginBottom:'16px'}}><label>Contraseña *</label><input type="password" value={stylistForm.password} onChange={e=>setStylistForm({...stylistForm,password:e.target.value})} required minLength={6}/></div>
            <div className="form-group" style={{marginBottom:'16px'}}><label>Teléfono</label><input type="tel" value={stylistForm.phone} onChange={e=>setStylistForm({...stylistForm,phone:e.target.value})}/></div>
            <div className="modal-actions"><button type="button" className="btn btn-outline btn-sm" onClick={()=>setShowStylistModal(false)}>Cancelar</button><button type="submit" className="btn btn-gold btn-sm">Registrar</button></div>
          </form>
        </div></div>
      )}

      {showServiceModal && (
        <div className="modal-overlay" onClick={()=>setShowServiceModal(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
          <h2>{editingService ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
          {error && <div className="error-msg"><AlertCircle size={16}/> {error}</div>}
          <form onSubmit={handleSaveService}>
            <div className="form-group" style={{marginBottom:'16px'}}><label>Nombre *</label><input type="text" value={serviceForm.name} onChange={e=>setServiceForm({...serviceForm,name:e.target.value})} required/></div>
            <div className="form-group" style={{marginBottom:'16px'}}><label>Categoría *</label><select value={serviceForm.category} onChange={e=>setServiceForm({...serviceForm,category:e.target.value})}><option value="barberia">Barbería</option><option value="manicura">Manicura</option><option value="pintado">Pintado</option><option value="lizado">Alisado</option><option value="tratamiento">Tratamiento</option><option value="otro">Otro</option></select></div>
            <div className="form-group" style={{marginBottom:'16px'}}><label>Descripción</label><textarea value={serviceForm.description} onChange={e=>setServiceForm({...serviceForm,description:e.target.value})} rows={2}/></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px'}}>
              <div className="form-group"><label>Duración (min) *</label><input type="number" value={serviceForm.duration} onChange={e=>setServiceForm({...serviceForm,duration:Number(e.target.value)})} min={5} required/></div>
              <div className="form-group"><label>Precio (S/) *</label><input type="number" value={serviceForm.price} onChange={e=>setServiceForm({...serviceForm,price:Number(e.target.value)})} min={0} step={0.5} required/></div>
            </div>
            <div className="form-group" style={{marginBottom:'16px'}}><label>Estilistas</label><div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginTop:'4px'}}>
              {stylists.map(s => <label key={s._id} style={{display:'flex',alignItems:'center',gap:'6px',cursor:'pointer',fontSize:'0.88rem',color:'var(--text-secondary)'}}>
                <input type="checkbox" checked={serviceForm.stylists.includes(s._id)} onChange={e=>{if(e.target.checked)setServiceForm({...serviceForm,stylists:[...serviceForm.stylists,s._id]});else setServiceForm({...serviceForm,stylists:serviceForm.stylists.filter(id=>id!==s._id)});}}/> {s.name}
              </label>)}
            </div></div>
            <div className="modal-actions"><button type="button" className="btn btn-outline btn-sm" onClick={()=>{setShowServiceModal(false);setEditingService(null);}}>Cancelar</button><button type="submit" className="btn btn-gold btn-sm">{editingService?'Guardar':'Crear'}</button></div>
          </form>
        </div></div>
      )}
    </div>
  );
};
export default AdminDashboard;
