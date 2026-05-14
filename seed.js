const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Service = require('./models/Service');
const Appointment = require('./models/Appointment');

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/salonapp';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected');

    // Clear existing data
    await User.deleteMany({});
    await Service.deleteMany({});
    await Appointment.deleteMany({});
    console.log('Cleared existing data');

    console.log('Seeding database...');

    // Create admin user
    const admin = await User.create({
      name: 'Administrador',
      email: 'admin@barbershop.com',
      password: 'admin123',
      role: 'admin',
      phone: '999-000-100'
    });
    console.log('  Created admin: admin@barbershop.com / admin123');

    // Create stylist users
    const stylist1 = await User.create({
      name: 'Carlos Mendoza',
      email: 'carlos@barbershop.com',
      password: 'stylist123',
      role: 'stylist',
      phone: '999-000-101'
    });

    const stylist2 = await User.create({
      name: 'Miguel Torres',
      email: 'miguel@barbershop.com',
      password: 'stylist123',
      role: 'stylist',
      phone: '999-000-102'
    });

    const stylist3 = await User.create({
      name: 'Ana Rivera',
      email: 'ana@barbershop.com',
      password: 'stylist123',
      role: 'stylist',
      phone: '999-000-103'
    });

    console.log('  Created 3 stylists');

    // Create services
    const services = [
      {
        name: 'Corte de Cabello',
        category: 'barberia',
        description: 'Corte profesional con estilo personalizado, incluye lavado y secado',
        duration: 30,
        price: 25,
        stylists: [stylist1._id, stylist2._id, stylist3._id]
      },
      {
        name: 'Barba y Bigote',
        category: 'barberia',
        description: 'Perfilado y arreglo de barba con toalla caliente y aceites esenciales',
        duration: 20,
        price: 15,
        stylists: [stylist1._id, stylist2._id]
      },
      {
        name: 'Manicura Clásica',
        category: 'manicura',
        description: 'Manicura completa con limado, cutículas y esmalte a elección',
        duration: 45,
        price: 30,
        stylists: [stylist3._id]
      },
      {
        name: 'Pintado de Cabello',
        category: 'pintado',
        description: 'Tintura completa con productos profesionales y protección capilar',
        duration: 90,
        price: 65,
        stylists: [stylist1._id, stylist3._id]
      },
      {
        name: 'Alisado Permanente',
        category: 'lizado',
        description: 'Tratamiento de alisado con keratina brasileña de larga duración',
        duration: 120,
        price: 120,
        stylists: [stylist3._id]
      },
      {
        name: 'Tratamiento Capilar',
        category: 'tratamiento',
        description: 'Hidratación y nutrición profunda con mascarillas premium',
        duration: 60,
        price: 45,
        stylists: [stylist1._id, stylist3._id]
      }
    ];

    await Service.insertMany(services);
    console.log(`  Created ${services.length} services`);

    console.log('\n✅ Seed completed!');
    console.log('\nCuentas de acceso:');
    console.log('  Admin:     admin@barbershop.com / admin123');
    console.log('  Estilista: carlos@barbershop.com / stylist123');
    console.log('  Estilista: miguel@barbershop.com / stylist123');
    console.log('  Estilista: ana@barbershop.com / stylist123');
    console.log('\nLos clientes NO necesitan cuenta, reservan directamente.');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
