// Native fetch used

async function testPoints() {
    const API_URL = 'http://localhost:3001/api/users/u1';
    const mockUser = {
        id: 'u1',
        name: 'Vecino de Sevilla',
        points: 999,
        experience: 500
    };

    console.log('📡 Enviando actualización de puntos al servidor...');
    try {
        const res = await fetch(API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mockUser)
        });

        if (res.ok) {
            console.log('✅ Servidor respondió OK.');

            console.log('📡 Verificando si los puntos se guardaron...');
            const getRes = await fetch(API_URL);
            const user = await getRes.json();

            if (user.points === 999) {
                console.log('🎉 ÉXITO: Los puntos se guardaron correctamente (999).');
            } else {
                console.log(`❌ ERROR: Los puntos NO se guardaron. Valor actual: ${user.points}`);
            }
        } else {
            console.log(`❌ ERROR: El servidor respondió con status ${res.status}`);
        }
    } catch (err) {
        console.error('❌ ERROR de conexión:', err.message);
        console.log('Asegúrate de que el servidor esté corriendo en el puerto 3001.');
    }
}

testPoints();
