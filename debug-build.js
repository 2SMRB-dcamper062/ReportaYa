const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'components');

if (fs.existsSync(componentsDir)) {
    console.log('Listing files in components directory:');
    fs.readdirSync(componentsDir).forEach(file => {
        console.log(file);
    });
} else {
    console.error('Components directory not found at:', componentsDir);
}
