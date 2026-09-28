// utils/seed.js — Seed sample data into MongoDB via Mongoose
require('dotenv').config();
const mongoose = require('mongoose');
const { Hospital, BloodBank, Diagnostic } = require('../models');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ayusutra';

async function seed() {
  console.log('🌱 Seeding AyuSutra MongoDB database...\n');

  await mongoose.connect(MONGO_URI);
  console.log('  ✅ Connected to MongoDB\n');

  // ── Blood Banks ────────────────────────────────────
  const bloodBanks = [
    { name: 'Rajiv Gandhi Govt. Blood Bank', address: 'Jayanagar, Bengaluru', phone: '08026564236', timings: '24×7', lat: 12.9283, lng: 77.5826 },
    { name: 'Manipal Hospital Blood Bank', address: 'Old Airport Rd, Bengaluru', phone: '08025023456', timings: '24×7', lat: 12.9672, lng: 77.6482 },
    { name: 'Karnataka Blood Bank', address: 'Shivajinagar, Bengaluru', phone: '08022268888', timings: '8AM–8PM', lat: 12.9895, lng: 77.5946 },
  ];

  await BloodBank.deleteMany({});
  for (const bb of bloodBanks) {
    await BloodBank.create(bb);
  }
  console.log(`  ✅ ${bloodBanks.length} blood banks seeded`);

  // ── Diagnostic Centres ─────────────────────────────
  const diagnostics = [
    { name: 'Thyrocare', address: 'MG Road, Bengaluru', phone: '9999222111', testsAvailable: ['CBC','Thyroid','Liver'], rating: 4.2, timings: '7AM–9PM', homeCollection: true, lat: 12.9756, lng: 77.6072 },
    { name: 'Vijaya Diagnostics', address: 'Indiranagar, Bengaluru', phone: '08041155555', testsAvailable: ['MRI','CT Scan'], rating: 4.5, timings: '8AM–8PM', homeCollection: false, lat: 12.9784, lng: 77.6408 },
  ];

  await Diagnostic.deleteMany({});
  for (const d of diagnostics) {
    await Diagnostic.create(d);
  }
  console.log(`  ✅ ${diagnostics.length} diagnostic centres seeded`);

  // ── Sample Hospitals ───────────────────
  const hospitals = [
    { name: 'Victoria Hospital', district: 'Bengaluru', address: 'Fort Rd, Bengaluru', phone: '080-26701150', type: 'Government', lat: 12.9594, lng: 77.5737, specialities: ['CARDIOLOGY','GENERAL MEDICINE'], schemesSupported: ['Ayushman Bharat'], isVerified: true, source: 'csv' },
    { name: 'Jayadeva Cardiology', district: 'Bengaluru', address: 'Jayanagar, Bengaluru', phone: '080-22977800', type: 'Government', lat: 12.9273, lng: 77.5827, specialities: ['CARDIOLOGY'], schemesSupported: ['Ayushman Bharat'], isVerified: true, source: 'csv' },
  ];

  await Hospital.deleteMany({});
  for (const h of hospitals) {
    await Hospital.create(h);
  }
  console.log(`  ✅ ${hospitals.length} sample hospitals seeded`);

  console.log('\n🎉 Seeding complete!\n');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed error:', err);
  mongoose.disconnect();
  process.exit(1);
});
