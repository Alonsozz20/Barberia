import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Scissors, Clock, User, Phone, Mail, Calendar, MapPin, CheckCircle, AlertCircle, ChevronRight, MessageCircle, X, Send, HelpCircle, ShieldCheck } from 'lucide-react';

const SERVICE_IMAGES = {
  'Corte de Cabello': '/images/corte.jpg',
  'Barba y Bigote': '/images/barba.jpg',
  'Manicura Clásica': '/images/manicura.jpg',
  'Pintado de Cabello': '/images/pintado.avif',
  'Alisado Permanente': '/images/alisado.avif',
  'Tratamiento Capilar': '/images/tratamiento.webp'
};

const ClientHome = () => {
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStylist, setSelectedStylist] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servRes, styRes] = await Promise.all([
          axios.get('/api/services'),
          axios.get('/api/auth/stylists')
        ]);
        setServices(servRes.data);
        setStylists(styRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSelectedStylist('');
    setSelectedDate('');
    setSelectedTime('');
    setAvailableSlots([]);
    setTimeout(() => document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const filteredStylists = selectedService
    ? stylists.filter(s => selectedService.stylists?.some(st => (st._id || st) === s._id))
    : stylists;

  const fetchAvailability = async (stylistId, date) => {
    if (!stylistId || !date) return;
    setLoadingSlots(true);
    try {
      const res = await axios.get(`/api/appointments/availability/${stylistId}?date=${date}`);
      setAvailableSlots(res.data.availableSlots || []);
    } catch (err) { setAvailableSlots([]); }
    finally { setLoadingSlots(false); }
  };

  const handleStylistChange = (e) => {
    setSelectedStylist(e.target.value);
    setSelectedTime('');
    if (e.target.value && selectedDate) fetchAvailability(e.target.value, selectedDate);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedTime('');
    if (selectedStylist && e.target.value) fetchAvailability(selectedStylist, e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedService || !selectedStylist || !selectedDate || !selectedTime || !clientName || !clientPhone) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await axios.post('/api/appointments', {
        clientName, clientPhone, clientEmail,
        stylistId: selectedStylist, serviceId: selectedService._id,
        date: selectedDate, startTime: selectedTime
      });
      setSuccess({
        service: selectedService.name,
        stylist: stylists.find(s => s._id === selectedStylist)?.name || '',
        date: selectedDate, time: selectedTime, price: res.data.price
      });
      setSelectedService(null); setSelectedStylist(''); setSelectedDate('');
      setSelectedTime(''); setClientName(''); setClientPhone(''); setClientEmail('');
      setAvailableSlots([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al reservar la cita');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div><p style={{color:'var(--text-muted)'}}>Cargando...</p></div>;

  return (
    <div>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <a href="/" className="navbar-brand">
          <img src="/images/logo.jpg" alt="BarberShop" />
          <span>BarberShop Pro</span>
        </a>
        <div className="navbar-links">
          <a href="#servicios"><Scissors size={15}/> <span className="link-text">Servicios</span></a>
          <a href="#reservar"><Calendar size={15}/> <span className="link-text">Reservar</span></a>
          <a href="/login" className="btn-nav-gold"><User size={15}/> Acceso Staff</a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-bg">
          <img src="/images/img3.jpg" alt="Barbería" />
        </div>
        <div className="hero-content">
          <span className="hero-badge"><Scissors size={14}/> Barbería Premium</span>
          <h1>Tu Estilo, <span className="gold">Nuestra Pasión</span></h1>
          <p>Descubre una experiencia de barbería única. Nuestros estilistas profesionales te esperan para transformar tu look con técnicas de vanguardia.</p>
          <div className="hero-buttons">
            <a href="#servicios" className="btn btn-gold"><Scissors size={16}/> Ver Servicios</a>
            <a href="#reservar" className="btn btn-outline"><Calendar size={16}/> Reservar Cita</a>
          </div>
        </div>
      </section>

      <section className="section" id="about">
        <div className="about-grid">
          <div>
            <span className="hero-badge" style={{marginBottom:'16px',display:'inline-flex'}}><MapPin size={14}/> Nuestra Barbería</span>
            <h2 style={{fontSize:'2rem',marginBottom:'16px'}}>Más que un corte, una experiencia</h2>
            <p style={{color:'var(--text-secondary)',lineHeight:'1.8',marginBottom:'16px'}}>
              En BarberShop Pro combinamos técnicas clásicas de barbería con las tendencias más modernas.
              Cada visita es una experiencia personalizada donde tu estilo es nuestra prioridad.
            </p>
            <p style={{color:'var(--text-secondary)',lineHeight:'1.8'}}>
              Nuestro equipo de estilistas profesionales está capacitado para ofrecerte el mejor servicio,
              desde un corte clásico hasta los tratamientos más innovadores.
            </p>
          </div>
          <div className="about-images">
            <img src="/images/img1.jpg" alt="Herramientas" />
            <img src="/images/img2.jpg" alt="Barbería" />
            <img src="/images/img3.jpg" alt="Estilista" />
          </div>
        </div>
      </section>

      <section className="section" id="servicios">
        <div className="section-title">
          <h2>Nuestros Servicios</h2>
          <div className="gold-line"></div>
          <p>Selecciona el servicio que deseas para comenzar tu reserva</p>
        </div>
        <div className="services-grid">
          {services.filter(s => s.isActive !== false).map(service => (
            <div key={service._id} className={`service-card ${selectedService?._id === service._id ? 'selected' : ''}`}
              onClick={() => handleServiceSelect(service)}>
              <img className="service-card-img" src={SERVICE_IMAGES[service.name] || '/images/img1.jpg'} alt={service.name} />
              <div className="service-card-body">
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <div className="service-meta">
                  <span className="service-price">S/ {service.price}</span>
                  <span className="service-duration"><Clock size={14}/> {service.duration} min</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedService && (
        <section className="section" id="reservar">
          <div className="booking-section" id="booking-form">
            <h2>Reservar: {selectedService.name}</h2>
            <p className="subtitle">{selectedService.description} — S/ {selectedService.price} — {selectedService.duration} min</p>
            {error && <div className="error-msg"><AlertCircle size={16}/> {error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label><User size={14}/> Nombre Completo *</label>
                  <input type="text" value={clientName} onChange={e=>setClientName(e.target.value)} placeholder="Tu nombre" required />
                </div>
                <div className="form-group">
                  <label><Phone size={14}/> Teléfono *</label>
                  <input type="tel" value={clientPhone} onChange={e=>setClientPhone(e.target.value)} placeholder="999 999 999" required />
                </div>
                <div className="form-group">
                  <label><Mail size={14}/> Email (opcional)</label>
                  <input type="email" value={clientEmail} onChange={e=>setClientEmail(e.target.value)} placeholder="tu@email.com" />
                </div>
                <div className="form-group">
                  <label><Scissors size={14}/> Estilista *</label>
                  <select value={selectedStylist} onChange={handleStylistChange} required>
                    <option value="">Seleccionar estilista</option>
                    {filteredStylists.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label><Calendar size={14}/> Fecha *</label>
                  <input type="date" value={selectedDate} onChange={handleDateChange} min={new Date().toISOString().split('T')[0]} required />
                </div>
              </div>
              {selectedStylist && selectedDate && (
                <div className="form-group" style={{marginBottom:'24px'}}>
                  <label><Clock size={14}/> Horario Disponible *</label>
                  {loadingSlots ? <p style={{color:'var(--text-muted)',fontSize:'0.9rem'}}>Cargando horarios...</p>
                    : availableSlots.length > 0 ? (
                      <div className="time-slots">
                        {availableSlots.map(slot => (
                          <button type="button" key={slot} className={`time-slot ${selectedTime===slot?'selected':''}`} onClick={()=>setSelectedTime(slot)}>{slot}</button>
                        ))}
                      </div>
                    ) : <p style={{color:'var(--danger)',fontSize:'0.9rem'}}>No hay horarios disponibles para esta fecha</p>
                  }
                </div>
              )}
              <button type="submit" className="btn btn-gold" disabled={submitting||!selectedTime} style={{width:'100%',justifyContent:'center'}}>
                {submitting ? 'Reservando...' : <><CheckCircle size={16}/> Confirmar Reserva</>}
              </button>
            </form>
          </div>
        </section>
      )}

      <section className="section" id="faq">
        <div className="section-title">
          <h2>Preguntas Frecuentes</h2>
          <div className="gold-line"></div>
          <p>Resolvemos tus dudas más comunes</p>
        </div>
        <div className="faq-grid">
          {[
            { q: '¿Necesito una cuenta para reservar?', a: 'No, puedes reservar directamente desde nuestra página sin necesidad de registrarte. Solo necesitas tu nombre y teléfono.' },
            { q: '¿Cómo puedo cancelar mi cita?', a: 'Contáctanos vía WhatsApp o llámanos al menos 2 horas antes de tu cita para reprogramar o cancelar sin penalidad.' },
            { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos efectivo, tarjetas Visa y Mastercard, y pagos por Yape. El pago se realiza al finalizar el servicio.' },
            { q: '¿Puedo elegir a mi estilista?', a: 'Sí, al momento de reservar puedes seleccionar el estilista de tu preferencia según su disponibilidad.' },
            { q: '¿Cuánto tiempo dura una cita?', a: 'Depende del servicio. Un corte dura aprox. 30 min, barba 20 min, y tratamientos especiales entre 60 y 120 min.' },
            { q: '¿Atienden sin cita previa?', a: 'Atendemos con cita para garantizar tu horario, pero si hay disponibilidad podemos atenderte sin reserva.' }
          ].map((item, i) => (
            <div key={i} className="faq-item">
              <h4><HelpCircle size={16}/> {item.q}</h4>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="privacidad">
        <div className="section-title">
          <h2>Información de la Empresa</h2>
          <div className="gold-line"></div>
        </div>
        <div className="info-card">
          <div className="info-item"><ShieldCheck size={20}/><div><h4>Política de Privacidad</h4><p>Tus datos personales están protegidos. Solo utilizamos tu nombre, teléfono y correo para gestionar tus citas y enviarte recordatorios. No compartimos tu información con terceros.</p></div></div>
          <div className="info-item"><MapPin size={20}/><div><h4>Ubicación</h4><p>Av. Principal 123, Centro Comercial, Local 45. Horario: Lunes a Sábado de 9:00 AM a 8:00 PM.</p></div></div>
          <div className="info-item"><Phone size={20}/><div><h4>Contacto</h4><p>Teléfono: 999 000 100 — Email: contacto@barbershoppro.com</p></div></div>
        </div>
      </section>

      <footer className="footer-full">
        <div className="footer-inner">
          <div className="footer-col">
            <div className="footer-logo">
              <img src="/images/logo.jpg" alt="Logo" />
              <div>
                <span className="footer-logo-name">BarberShop Pro</span>
                <span className="footer-logo-tag">Barbería Premium</span>
              </div>
            </div>
            <p className="footer-desc">Tu estilo, nuestra pasión. Más de 10 años brindando la mejor experiencia en barbería y cuidado personal.</p>
          </div>
          <div className="footer-col">
            <h4>¿Buscas Ayuda?</h4>
            <ul className="footer-links">
              <li><a href="#servicios">Nuestros Servicios</a></li>
              <li><a href="#reservar">Reservar una Cita</a></li>
              <li><a href="#about">Sobre Nosotros</a></li>
              <li><a href="#faq">Preguntas Frecuentes</a></li>
              <li><a href="#privacidad">Política de Privacidad</a></li>
              <li><a href="#privacidad">Información de la Empresa</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Síguenos</h4>
            <div className="footer-socials">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2 6.34 6.34 0 009.49 21.5a6.34 6.34 0 006.34-6.34V8.71a8.16 8.16 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.14z"/></svg>
              </a>
            </div>
            <h4 style={{marginTop:'24px'}}>Medios de Pago</h4>
            <div className="footer-payments">
              <span className="payment-badge">VISA</span>
              <span className="payment-badge">MC</span>
              <span className="payment-badge">Efectivo</span>
              <span className="payment-badge">Yape</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 BarberShop Pro — Todos los derechos reservados</p>
        </div>
      </footer>

      {success && (
        <div className="success-overlay" onClick={()=>setSuccess(null)}>
          <div className="success-card" onClick={e=>e.stopPropagation()}>
            <div className="check-wrap"><CheckCircle size={32}/></div>
            <h2>Cita Reservada</h2>
            <p><strong>Servicio:</strong> {success.service}</p>
            <p><strong>Estilista:</strong> {success.stylist}</p>
            <p><strong>Fecha:</strong> {success.date}</p>
            <p><strong>Hora:</strong> {success.time}</p>
            <p><strong>Precio:</strong> S/ {success.price}</p>
            <div style={{marginTop:'24px'}}>
              <button className="btn btn-gold" onClick={()=>setSuccess(null)}><ChevronRight size={16}/> Entendido</button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Chat Widget */}
      <div className="wa-widget">
        {chatOpen && (
          <div className="wa-chat-box">
            <div className="wa-chat-header">
              <div className="wa-chat-header-info">
                <img src="/images/logo.jpg" alt="Logo" className="wa-chat-avatar" />
                <div>
                  <div className="wa-chat-name">BarberShop Pro</div>
                  <div className="wa-chat-status">En línea</div>
                </div>
              </div>
              <button className="wa-chat-close" onClick={() => setChatOpen(false)}><X size={18}/></button>
            </div>
            <div className="wa-chat-body">
              <div className="wa-msg">
                <p>¡Bienvenido a <strong>BarberShop Pro</strong>! Gracias por contactarnos.</p>
                <br/>
                <p>¿Quieres agendar una cita?</p>
                <p>¿Tienes preguntas sobre nuestros servicios?</p>
                <br/>
                <p>Escríbenos y con gusto te atenderemos. ¡Estamos listos para que renueves tu estilo!</p>
              </div>
            </div>
            <a className="wa-chat-send" href="https://wa.me/51999000100?text=Hola%2C%20quiero%20agendar%20una%20cita%20en%20BarberShop%20Pro" target="_blank" rel="noopener noreferrer">
              <span>Abrir chat</span> <Send size={18}/>
            </a>
          </div>
        )}
        <button className="wa-fab" onClick={() => setChatOpen(!chatOpen)} aria-label="WhatsApp">
          {chatOpen ? <X size={28}/> : <MessageCircle size={28}/>}
        </button>
      </div>
    </div>
  );
};
export default ClientHome;
