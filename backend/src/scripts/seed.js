const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seed() {
  console.log('🌱 Starting LandChain database seed...');

  const salt = await bcrypt.genSalt(10);
  const registrarPassword = await bcrypt.hash('Registrar@123', salt);
  const citizenPassword = await bcrypt.hash('Citizen@123', salt);

  // 1. Seed Registrar Account
  const checkRegistrar = db.prepare('SELECT id FROM users WHERE email = ?');
  let registrar = checkRegistrar.get('registrar@landchain.gov.in');
  let registrarId;

  if (!registrar) {
    const insertRegistrar = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, phone)
      VALUES (?, ?, ?, ?, ?)
    `);
    const res = insertRegistrar.run(
      'Chief Land Registrar',
      'registrar@landchain.gov.in',
      registrarPassword,
      'registrar',
      '+91 80 2234 5678'
    );
    registrarId = res.lastInsertRowid;
    console.log('✅ Created default Registrar: registrar@landchain.gov.in (Password: Registrar@123)');
  } else {
    registrarId = registrar.id;
    console.log('ℹ️ Default Registrar already exists.');
  }

  // 2. Seed Default Citizen Account (Aarav Sharma)
  let citizen = checkRegistrar.get('citizen@landchain.gov.in');
  let citizenId;

  if (!citizen) {
    const insertCitizen = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, phone)
      VALUES (?, ?, ?, ?, ?)
    `);
    const res = insertCitizen.run(
      'Aarav Sharma',
      'citizen@landchain.gov.in',
      citizenPassword,
      'citizen',
      '+91 98765 43210'
    );
    citizenId = res.lastInsertRowid;
    console.log('✅ Created sample Citizen: citizen@landchain.gov.in (Password: Citizen@123)');
  } else {
    citizenId = citizen.id;
    console.log('ℹ️ Sample Citizen already exists.');
  }

  // 3. Seed Buyer Citizen Account (Priya Patel)
  let buyer = checkRegistrar.get('buyer@landchain.gov.in');
  let buyerId;

  if (!buyer) {
    const insertBuyer = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, phone)
      VALUES (?, ?, ?, ?, ?)
    `);
    const res = insertBuyer.run(
      'Priya Patel',
      'buyer@landchain.gov.in',
      citizenPassword,
      'citizen',
      '+91 91234 56789'
    );
    buyerId = res.lastInsertRowid;
    console.log('✅ Created buyer Citizen: buyer@landchain.gov.in (Password: Citizen@123)');
  } else {
    buyerId = buyer.id;
    console.log('ℹ️ Buyer Citizen already exists.');
  }

  // 4. Seed an initial pending registration request so Registrar dashboard shows pending work
  const checkPending = db.prepare('SELECT id FROM registration_requests WHERE land_id = ?');
  const pendingLand = checkPending.get('LAND-MH-2024-002');

  if (!pendingLand) {
    const insertReq = db.prepare(`
      INSERT INTO registration_requests (
        land_id, user_id, survey_number, location, district, state,
        area, area_unit, land_type, owner_name, document_reference, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
    `);
    insertReq.run(
      'LAND-MH-2024-002',
      citizenId,
      'SY-552/3A',
      'Bandra Kurla Complex, Plot 14',
      'Mumbai Suburban',
      'Maharashtra',
      1800,
      'Sq Ft',
      'Commercial',
      'Aarav Sharma',
      'MH-REV-DEED-2024-991'
    );
    console.log('✅ Created sample pending registration request: LAND-MH-2024-002');
  }

  // 5. Seed Activity Logs
  const checkLog = db.prepare('SELECT id FROM activity_logs LIMIT 1').get();
  if (!checkLog) {
    const insertLog = db.prepare('INSERT INTO activity_logs (user_id, action, land_id) VALUES (?, ?, ?)');
    insertLog.run(registrarId, 'SYSTEM_INITIALIZED', null);
    insertLog.run(citizenId, 'LAND_REGISTRATION_SUBMITTED', 'LAND-MH-2024-002');
  }

  console.log('🎉 Seed completed successfully!');
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

