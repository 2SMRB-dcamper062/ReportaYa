/**
 * test-points.js
 * Script para verificar la persistencia de puntos en el servidor.
 */

const API_SERVER = 'http://localhost:3001';
const TEST_USER_ID = 'user-test-' + Math.floor(Math.random() * 1000);

async function runTest() {
    console.log('🧪 Iniciando prueba de puntos en:', API_SERVER);

    const mockUser = {
        id: TEST_USER_ID,
        name: 'Usuario de Prueba',
        email: `test-${TEST_USER_ID}@reportaya.es`,
        points: 500,
        experience: 100,
        inventory: [],
        role: 'citizen'
    };

    try {
        // 1. Crear/Actualizar usuario
        console.log(`📡 Enviando ${mockUser.points} puntos para el usuario: ${TEST_USER_ID}...`);
        const putRes = await fetch(`${API_SERVER}/api/users/${TEST_USER_ID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mockUser)
        });

        if (!putRes.ok) {
            throw new Error(`Servidor respondió con error: ${putRes.status} ${putRes.statusText}`);
        }

        console.log('✅ Servidor aceptó la actualización.');

        // 2. Verificar persistencia
        console.log('🔍 Solicitando datos del servidor para verificar...');
        const getRes = await fetch(`${API_SERVER}/api/users/${TEST_USER_ID}`);
        if (!getRes.ok) throw new Error('No se pudo recuperar el usuario recién creado');

        const savedUser = await getRes.json();

        if (savedUser.points === 500) {
            console.log('✨ ÉXITO: Los puntos se guardaron correctamente en MongoDB (500).');
        } else {
            console.error(`❌ ERROR: Los puntos no coinciden. Se esperaba 500, se obtuvo: ${savedUser.points}`);
        }

    } catch (err) {
        console.error('❌ ERROR DURANTE LA PRUEBA:');
        console.error('   >', err.message);
        console.log('\n💡 Asegúrate de que el servidor esté corriendo (npm run dev) en el puerto 3001.');
    }
}

runTest();
