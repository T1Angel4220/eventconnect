const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'eventconnect',
  password: process.env.DB_PASSWORD || 'Angel_4220',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function checkPassword() {
  try {
    const email = 'johan@gmail.com';
    const passwordToTest = 'Angel_4220';
    
    console.log('\n🔍 Verificando contraseña para:', email);
    console.log('Contraseña a probar:', passwordToTest);
    
    // Buscar usuario
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    const user = result.rows[0];
    console.log('\n✅ Usuario encontrado:');
    console.log('  - ID:', user.user_id);
    console.log('  - Nombre:', user.first_name, user.last_name);
    console.log('  - Email:', user.email);
    console.log('  - Rol:', user.role);
    console.log('  - Hash guardado:', user.password);
    
    // Probar contraseña
    const isMatch = await bcrypt.compare(passwordToTest, user.password);
    
    if (isMatch) {
      console.log('\n✅ ¡La contraseña es CORRECTA!');
    } else {
      console.log('\n❌ La contraseña NO coincide');
      console.log('\nProbando otras contraseñas comunes...');
      
      const commonPasswords = ['angel_4220', 'ANGEL_4220', 'Angel_4220', 'angel4220'];
      for (const pwd of commonPasswords) {
        const match = await bcrypt.compare(pwd, user.password);
        if (match) {
          console.log(`✅ La contraseña correcta es: "${pwd}"`);
          return;
        }
      }
      console.log('❌ Ninguna contraseña común funciona');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkPassword();

