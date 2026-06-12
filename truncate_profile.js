const fs = require('fs');
const path = 'C:/Users/dc858/Documents/ReportaYa-1.1/components/ProfileSettingsPanel.tsx';
console.log('Path:', path);
try {
    if (!fs.existsSync(path)) {
        console.error('File does NOT exist!');
        process.exit(1);
    }
    const content = fs.readFileSync(path, 'utf8');
    console.log('Original length (chars):', content.length);
    const lines = content.split(/\r?\n/);
    console.log('Total lines:', lines.length);

    if (lines.length > 510) {
        // Keep lines 0 to 506 (507 lines)
        const newContent = lines.slice(0, 507).join('\n') + '\nexport default ProfileSettingsPanel;\n';
        fs.writeFileSync(path, newContent, 'utf8');
        console.log('Truncated successfully. New line count:', newContent.split('\n').length);
    } else {
        console.log('File already short enough:', lines.length);
    }
} catch (e) {
    console.error('Error:', e);
    process.exit(1);
}
