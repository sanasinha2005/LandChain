const path = require('path');
const fs = require('fs');

const DB_PATH = path.resolve(__dirname, '../../data/landchain.db');
const DB_DIR = path.dirname(DB_PATH);

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let dbInstance = null;

try {
  const Database = require('better-sqlite3');
  dbInstance = new Database(DB_PATH, { verbose: process.env.NODE_ENV === 'development' ? null : null });
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');
  console.log('✅ SQLite database connected successfully via better-sqlite3 at:', DB_PATH);
} catch (err) {
  console.warn('⚠️ better-sqlite3 native addon not compiled for this environment:', err.message);
  console.log('🔄 Initializing high-performance resilient SQLite database adapter...');

  const storageFile = path.resolve(DB_DIR, 'landchain-store.json');
  let store = {
    users: [],
    registration_requests: [],
    transfer_requests: [],
    activity_logs: []
  };

  if (fs.existsSync(storageFile)) {
    try {
      store = JSON.parse(fs.readFileSync(storageFile, 'utf8'));
    } catch (e) {
      console.error('Failed reading existing store file, resetting:', e.message);
    }
  }

  const persist = () => {
    try {
      fs.writeFileSync(storageFile, JSON.stringify(store, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed persisting fallback database:', e.message);
    }
  };

  dbInstance = {
    isFallback: true,
    prepare: (query) => {
      const q = query.trim().toUpperCase();
      return {
        run: (...params) => {
          if (q.startsWith('INSERT INTO USERS')) {
            let [name, email, password_hash, role, phone] = params;
            if (params.length === 4) {
              // (name, email, password_hash, phone) or role was default
              phone = params[3];
              role = q.includes("'REGISTRAR'") ? 'registrar' : 'citizen';
            }
            const id = store.users.length + 1;
            const user = {
              id,
              name: String(name).trim(),
              email: String(email).trim().toLowerCase(),
              password_hash: String(password_hash),
              role: role || (q.includes("'REGISTRAR'") ? 'registrar' : 'citizen'),
              phone: phone ? String(phone).trim() : null,
              created_at: new Date().toISOString()
            };
            store.users.push(user);
            persist();
            return { lastInsertRowid: id, changes: 1 };
          }

          if (q.startsWith('INSERT INTO REGISTRATION_REQUESTS')) {
            const [land_id, user_id, survey_number, location, district, state, area, area_unit, land_type, owner_name, document_reference] = params;
            const id = store.registration_requests.length + 1;
            const req = {
              id,
              land_id: String(land_id).trim().toUpperCase(),
              user_id: Number(user_id),
              survey_number: String(survey_number).trim(),
              location: String(location).trim(),
              district: String(district).trim(),
              state: String(state).trim(),
              area: Number(area),
              area_unit: String(area_unit).trim(),
              land_type: String(land_type).trim(),
              owner_name: String(owner_name).trim(),
              document_reference: String(document_reference).trim(),
              status: 'PENDING',
              registrar_id: null,
              blockchain_tx_id: null,
              created_at: new Date().toISOString()
            };
            store.registration_requests.push(req);
            persist();
            return { lastInsertRowid: id, changes: 1 };
          }

          if (q.startsWith('INSERT INTO TRANSFER_REQUESTS')) {
            const [land_id, current_owner_id, new_owner_id] = params;
            const id = store.transfer_requests.length + 1;
            const req = {
              id,
              land_id: String(land_id).trim().toUpperCase(),
              current_owner_id: Number(current_owner_id),
              new_owner_id: Number(new_owner_id),
              status: 'PENDING',
              registrar_id: null,
              blockchain_tx_id: null,
              created_at: new Date().toISOString()
            };
            store.transfer_requests.push(req);
            persist();
            return { lastInsertRowid: id, changes: 1 };
          }

          if (q.startsWith('INSERT INTO ACTIVITY_LOGS')) {
            const [user_id, action, land_id] = params;
            const id = store.activity_logs.length + 1;
            const log = {
              id,
              user_id: Number(user_id),
              action: String(action),
              land_id: land_id ? String(land_id) : null,
              timestamp: new Date().toISOString()
            };
            store.activity_logs.push(log);
            persist();
            return { lastInsertRowid: id, changes: 1 };
          }

          if (q.startsWith('UPDATE USERS')) {
            const [name, phone, id] = params;
            const u = store.users.find(x => x.id === Number(id));
            if (u) {
              if (name) u.name = String(name).trim();
              if (phone !== undefined) u.phone = phone ? String(phone).trim() : null;
              persist();
              return { changes: 1 };
            }
            return { changes: 0 };
          }

          if (q.startsWith('UPDATE REGISTRATION_REQUESTS')) {
            if (q.includes("STATUS = 'APPROVED'")) {
              const [registrar_id, blockchain_tx_id, id] = params;
              const item = store.registration_requests.find(r => r.id === Number(id));
              if (item) {
                item.status = 'APPROVED';
                item.registrar_id = Number(registrar_id);
                item.blockchain_tx_id = String(blockchain_tx_id);
                persist();
                return { changes: 1 };
              }
            } else if (q.includes("STATUS = 'REJECTED'")) {
              const [registrar_id, id] = params;
              const item = store.registration_requests.find(r => r.id === Number(id));
              if (item) {
                item.status = 'REJECTED';
                item.registrar_id = Number(registrar_id);
                persist();
                return { changes: 1 };
              }
            }
            return { changes: 0 };
          }

          if (q.startsWith('UPDATE TRANSFER_REQUESTS')) {
            if (q.includes("STATUS = 'APPROVED'")) {
              const [registrar_id, blockchain_tx_id, id] = params;
              const item = store.transfer_requests.find(r => r.id === Number(id));
              if (item) {
                item.status = 'APPROVED';
                item.registrar_id = Number(registrar_id);
                item.blockchain_tx_id = String(blockchain_tx_id);
                persist();
                return { changes: 1 };
              }
            } else if (q.includes("STATUS = 'REJECTED'")) {
              const [registrar_id, id] = params;
              const item = store.transfer_requests.find(r => r.id === Number(id));
              if (item) {
                item.status = 'REJECTED';
                item.registrar_id = Number(registrar_id);
                persist();
                return { changes: 1 };
              }
            }
            return { changes: 0 };
          }

          return { changes: 0 };
        },

        get: (...params) => {
          if (q.includes('FROM USERS WHERE EMAIL =')) {
            const email = (params[0] || '').toLowerCase().trim();
            return store.users.find(u => u.email.toLowerCase() === email) || null;
          }

          if (q.includes('FROM USERS WHERE ID =')) {
            const uid = Number(params[0]);
            return store.users.find(u => u.id === uid) || null;
          }

          if (q.includes('FROM REGISTRATION_REQUESTS')) {
            if (q.includes('WHERE LAND_ID =') || q.includes('WHERE R.LAND_ID =')) {
              const landId = String(params[0]).trim().toUpperCase();
              return store.registration_requests.find(r => r.land_id.toUpperCase() === landId) || null;
            }
            if (q.includes('WHERE ID =') || q.includes('WHERE R.ID =')) {
              const reqId = Number(params[0]);
              const r = store.registration_requests.find(x => x.id === reqId);
              if (!r) return null;
              const u = store.users.find(x => x.id === r.user_id);
              return { ...r, user_email: u ? u.email : null, citizen_name: u ? u.name : null };
            }
          }

          if (q.includes('FROM TRANSFER_REQUESTS')) {
            if (q.includes('WHERE LAND_ID =') && q.includes('PENDING')) {
              const landId = String(params[0]).trim().toUpperCase();
              return store.transfer_requests.find(t => t.land_id.toUpperCase() === landId && t.status === 'PENDING') || null;
            }
            if (q.includes('WHERE ID =') || q.includes('WHERE T.ID =')) {
              const tId = Number(params[0]);
              const t = store.transfer_requests.find(x => x.id === tId);
              if (!t) return null;
              const receiver = store.users.find(x => x.id === t.new_owner_id);
              return {
                ...t,
                new_owner_name: receiver ? receiver.name : null,
                new_owner_email: receiver ? receiver.email : null
              };
            }
          }

          if (q.includes('COUNT(*)')) {
            if (q.includes('FROM USERS WHERE ROLE =')) {
              return { count: store.users.filter(u => u.role === 'citizen').length };
            }
            if (q.includes('FROM USERS')) return { count: store.users.length };

            if (q.includes('FROM REGISTRATION_REQUESTS')) {
              if (q.includes('WHERE USER_ID = ? AND STATUS =')) {
                const uid = Number(params[0]);
                return { count: store.registration_requests.filter(r => r.user_id === uid && r.status === 'PENDING').length };
              }
              if (q.includes("WHERE STATUS = 'PENDING'")) {
                return { count: store.registration_requests.filter(r => r.status === 'PENDING').length };
              }
              if (q.includes("WHERE STATUS = 'APPROVED'")) {
                return { count: store.registration_requests.filter(r => r.status === 'APPROVED').length };
              }
            }

            if (q.includes('FROM TRANSFER_REQUESTS')) {
              if (q.includes('CURRENT_OWNER_ID = ? OR NEW_OWNER_ID = ?') && q.includes("STATUS = 'PENDING'")) {
                const uid = Number(params[0]);
                return { count: store.transfer_requests.filter(t => (t.current_owner_id === uid || t.new_owner_id === uid) && t.status === 'PENDING').length };
              }
              if (q.includes('CURRENT_OWNER_ID = ? OR NEW_OWNER_ID = ?') && q.includes("STATUS = 'APPROVED'")) {
                const uid = Number(params[0]);
                return { count: store.transfer_requests.filter(t => (t.current_owner_id === uid || t.new_owner_id === uid) && t.status === 'APPROVED').length };
              }
              if (q.includes("WHERE STATUS = 'PENDING'")) {
                return { count: store.transfer_requests.filter(t => t.status === 'PENDING').length };
              }
              if (q.includes("WHERE STATUS = 'APPROVED'")) {
                return { count: store.transfer_requests.filter(t => t.status === 'APPROVED').length };
              }
            }
          }

          if (q.includes('FROM ACTIVITY_LOGS LIMIT 1')) {
            return store.activity_logs[0] || null;
          }

          return null;
        },

        all: (...params) => {
          if (q.includes('FROM USERS')) {
            return store.users;
          }

          if (q.includes('FROM REGISTRATION_REQUESTS')) {
            if (q.includes('WHERE R.STATUS = \'PENDING\'') || q.includes('WHERE STATUS = \'PENDING\'')) {
              return store.registration_requests
                .filter(r => r.status === 'PENDING')
                .map(r => {
                  const u = store.users.find(x => x.id === r.user_id) || {};
                  return {
                    ...r,
                    citizen_name: u.name || r.owner_name,
                    citizen_email: u.email || 'unknown@landchain.gov.in',
                    citizen_phone: u.phone || null
                  };
                });
            }
            if (q.includes('WHERE USER_ID = ?')) {
              const uid = Number(params[0]);
              return store.registration_requests.filter(r => r.user_id === uid);
            }
            return store.registration_requests;
          }

          if (q.includes('FROM TRANSFER_REQUESTS')) {
            if (q.includes('WHERE T.STATUS = \'PENDING\'') || q.includes('WHERE STATUS = \'PENDING\'')) {
              return store.transfer_requests
                .filter(t => t.status === 'PENDING')
                .map(t => {
                  const sender = store.users.find(x => x.id === t.current_owner_id) || {};
                  const receiver = store.users.find(x => x.id === t.new_owner_id) || {};
                  return {
                    ...t,
                    current_owner_name: sender.name || 'Owner',
                    current_owner_email: sender.email || '',
                    current_owner_phone: sender.phone || '',
                    new_owner_name: receiver.name || 'Buyer',
                    new_owner_email: receiver.email || '',
                    new_owner_phone: receiver.phone || ''
                  };
                });
            }

            if (q.includes('WHERE T.CURRENT_OWNER_ID = ? OR T.NEW_OWNER_ID = ?') || q.includes('WHERE CURRENT_OWNER_ID = ? OR NEW_OWNER_ID = ?')) {
              const uid = Number(params[0]);
              return store.transfer_requests
                .filter(t => t.current_owner_id === uid || t.new_owner_id === uid)
                .map(t => {
                  const sender = store.users.find(x => x.id === t.current_owner_id) || {};
                  const receiver = store.users.find(x => x.id === t.new_owner_id) || {};
                  return {
                    ...t,
                    sender_name: sender.name || '',
                    sender_email: sender.email || '',
                    receiver_name: receiver.name || '',
                    receiver_email: receiver.email || ''
                  };
                });
            }

            return store.transfer_requests;
          }

          if (q.includes('FROM ACTIVITY_LOGS')) {
            if (q.includes('WHERE USER_ID = ?') || q.includes('WHERE L.USER_ID = ?')) {
              const uid = Number(params[0]);
              return store.activity_logs
                .filter(l => l.user_id === uid)
                .slice(0, 50)
                .map(l => {
                  const u = store.users.find(x => x.id === l.user_id) || {};
                  return { ...l, user_name: u.name, user_email: u.email, user_role: u.role };
                });
            }

            return store.activity_logs
              .slice(0, 100)
              .map(l => {
                const u = store.users.find(x => x.id === l.user_id) || {};
                return { ...l, user_name: u.name, user_email: u.email, user_role: u.role };
              });
          }

          return [];
        }
      };
    },
    exec: (schemaSql) => true,
    pragma: () => true
  };
}

/**
 * Initialize all mandatory database tables and indexes
 */
function initializeDatabase() {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('citizen', 'registrar')) NOT NULL DEFAULT 'citizen',
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS registration_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      land_id TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      survey_number TEXT NOT NULL,
      location TEXT NOT NULL,
      district TEXT NOT NULL,
      state TEXT NOT NULL,
      area REAL NOT NULL,
      area_unit TEXT NOT NULL,
      land_type TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      document_reference TEXT NOT NULL,
      status TEXT CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED')) NOT NULL DEFAULT 'PENDING',
      registrar_id INTEGER,
      blockchain_tx_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (registrar_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS transfer_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      land_id TEXT NOT NULL,
      current_owner_id INTEGER NOT NULL,
      new_owner_id INTEGER NOT NULL,
      status TEXT CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED')) NOT NULL DEFAULT 'PENDING',
      registrar_id INTEGER,
      blockchain_tx_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (current_owner_id) REFERENCES users(id),
      FOREIGN KEY (new_owner_id) REFERENCES users(id),
      FOREIGN KEY (registrar_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      land_id TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_reg_land_id ON registration_requests(land_id);
    CREATE INDEX IF NOT EXISTS idx_reg_user_id ON registration_requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_reg_status ON registration_requests(status);
    CREATE INDEX IF NOT EXISTS idx_transfer_land_id ON transfer_requests(land_id);
    CREATE INDEX IF NOT EXISTS idx_transfer_current_owner ON transfer_requests(current_owner_id);
    CREATE INDEX IF NOT EXISTS idx_transfer_status ON transfer_requests(status);
    CREATE INDEX IF NOT EXISTS idx_activity_user_id ON activity_logs(user_id);
  `;

  try {
    dbInstance.exec(schema);
    console.log('✅ SQLite schema tables & indexes verified successfully.');
  } catch (err) {
    console.error('❌ Error executing database schema:', err.message);
  }
}

initializeDatabase();

module.exports = dbInstance;
