const fs = require('fs');

console.log('🔍 Checking critical dependencies...');

const dependencies = ['bcryptjs', 'mongodb', 'express', 'cors', 'nodemailer'];
let missing = [];

dependencies.forEach(dep => {
    try {
        require.resolve(dep);
        console.log(`✅ ${dep} is installed.`);
    } catch (e) {
        console.error(`❌ ${dep} is MISSING!`);
        missing.push(dep);
    }
});

if (missing.length > 0) {
    console.error('\n⚠️  MISSING DEPENDENCIES FOUND. Please run:');
    console.error(`    npm install ${missing.join(' ')}`);
    process.exit(1);
} else {
    console.log('\n✅ All dependencies look good.');

    // Test bcrypt loading specifically
    try {
        const bcrypt = require('bcryptjs');
        console.log('✅ bcryptjs loaded successfully.');
    } catch (e) {
        console.error('❌ bcryptjs could not be loaded:', e.message);
    }
}
