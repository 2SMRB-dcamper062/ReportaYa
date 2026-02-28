const fetch = require('node-fetch'); // Using node-fetch for simplicity if available, or native fetch if node version supports it

const API_URL = 'http://localhost:3001/api';
const TEST_USER_ID = 'local-test-points-' + Date.now();
const TEST_EMAIL = `test-${Date.now()}@example.com`;

async function verifyFix() {
    console.log('🚀 Iniciando verificación de persistencia de puntos...');

    try {
        // 1. Register a user
        console.log('📝 Registrando usuario de prueba...');
        const regRes = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_EMAIL,
                password: 'Password123!',
                name: 'Test',
                surname: 'User',
                postalCode: '41001'
            })
        });

        if (!regRes.ok) throw new Error('Error al registrar: ' + await regRes.text());
        const user = await regRes.json();
        console.log('✅ Usuario registrado. ID:', user.id, 'Puntos iniciales:', user.points);

        // 2. Update points
        console.log('🆙 Actualizando puntos a 50...');
        const updRes = await fetch(`${API_URL}/users/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...user, points: 50 })
        });
        if (!updRes.ok) throw new Error('Error al actualizar puntos');
        console.log('✅ Puntos actualizados en el servidor.');

        // 3. Verify points in DB
        console.log('🔍 Verificando puntos en el servidor...');
        const getRes = await fetch(`${API_URL}/users/${user.id}`);
        const userAfter = await getRes.json();

        if (userAfter.points === 50) {
            console.log('🎉 ÉXITO: Los puntos (50) persistieron correctamente en el servidor.');
        } else {
            console.error('❌ ERROR: Los puntos no persistieron. Valor:', userAfter.points);
        }

        // 4. Test "Login" simulation
        console.log('🔑 Simulando login...');
        const loginRes = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: TEST_EMAIL, password: 'Password123!' })
        });
        const loggedUser = await loginRes.json();
        console.log('✅ Login exitoso. Puntos devueltos:', loggedUser.points);

        if (loggedUser.points === 50) {
            console.log('🏆 VERIFICACIÓN COMPLETADA: Los puntos se mantienen tras el login.');
        } else {
            console.error('❌ FALLO: Los puntos se perdieron en el login.');
        }

    } catch (err) {
        console.error('❌ Error durante la verificación:', err.message);
    }
}

verifyFix();
