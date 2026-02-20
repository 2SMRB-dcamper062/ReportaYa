const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/health',
    method: 'GET',
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        try {
            const json = JSON.parse(data);
            console.log('Response:', JSON.stringify(json, null, 2));

            if (json.status === 'ok' && json.db === 'connected') {
                console.log('✅ Health Check PASSED: Server and DB are ready.');
            } else {
                console.error('❌ Health Check FAILED: DB issue or server error.');
            }
        } catch (e) {
            console.log('Raw Body:', data);
            console.error('❌ Invalid JSON response.');
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ Connection Error: ${e.message}`);
    console.error('Ensure the server is running on port 3000.');
});

req.end();
