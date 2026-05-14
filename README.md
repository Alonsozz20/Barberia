# BarberShop Pro - Sistema de Reservas de Barbería

Sistema completo de gestión para barbería con reservas en línea, panel de administrador y panel de estilista.

## 🚀 Inicio Rápido

### Requisitos
- Node.js 16+
- MongoDB (local o Atlas)

### Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno (.env)
SERVER_PORT=5001
MONGODB_URI=mongodb://localhost:27017/salonapp
JWT_SECRET=salon_app_jwt_secret_key_2024_secure

# Cargar datos iniciales
npm run seed

# Iniciar servidor + cliente
npm run dev
```

La app estará disponible en: **http://localhost:3000**

---

## 👥 Roles del Sistema

### 🔓 Cliente (Sin Login)
- Accede directamente a la página principal
- Ve los servicios disponibles (corte, barba, manicura, pintado, alisado, tratamiento)
- Selecciona servicio → estilista → fecha → horario disponible
- Reserva la cita ingresando nombre y teléfono
- **No necesita crear cuenta**

### ✂️ Estilista (Login requerido)
- Accede vía `/login` con credenciales proporcionadas por el admin
- Panel con citas pendientes del día
- Cambia el estado de las citas (atendido / cancelado)
- Ve sus ingresos totales del día
- Puede filtrar por fecha

### 👔 Administrador (Login requerido)
- Panel general con estadísticas
- **Registra estilistas** (único que puede crear cuentas)
- **Gestiona servicios** (crear, editar precios, eliminar)
- Ve todas las citas del sistema
- Asigna estilistas a servicios

---

## 🔑 Cuentas de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@barbershop.com | admin123 |
| Estilista | carlos@barbershop.com | stylist123 |
| Estilista | miguel@barbershop.com | stylist123 |
| Estilista | ana@barbershop.com | stylist123 |

---

## 📁 Estructura del Proyecto

```
├── server.js              # Servidor Express
├── seed.js                # Script para datos iniciales
├── models/
│   ├── User.js            # Modelo de usuario (admin/estilista)
│   ├── Service.js         # Modelo de servicio
│   └── Appointment.js     # Modelo de cita (cliente invitado)
├── controllers/
│   ├── authController.js  # Login, registro estilistas
│   ├── serviceController.js # CRUD servicios
│   └── appointmentController.js # Citas y disponibilidad
├── routes/
│   ├── auth.js            # Rutas de autenticación
│   ├── services.js        # Rutas de servicios
│   └── appointments.js    # Rutas de citas
├── middleware/
│   └── auth.js            # JWT y autorización
└── src/
    ├── App.js             # Rutas del frontend
    ├── index.css           # Diseño completo (tema barbería)
    ├── context/AuthContext.js
    └── pages/
        ├── ClientHome.js       # Página del cliente
        ├── Login.js            # Login (admin/estilista)
        ├── AdminDashboard.js   # Panel administrador
        └── StylistDashboard.js # Panel estilista
```

## 🛠 Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor + cliente |
| `npm run server` | Solo servidor backend |
| `npm start` | Solo frontend React |
| `npm run seed` | Carga datos iniciales |
