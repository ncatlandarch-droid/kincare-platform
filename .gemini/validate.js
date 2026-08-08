/**
 * KinCare Pre-Deploy Automated Validator
 * Clean Build Architecture: Automated Quality Assurance
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
let errorCount = 0;
let warningCount = 0;

console.log('🔍 Running KinCare Clean Build Validation...\n');

// 1. Check JS syntax errors
const jsFiles = [
    'app.js',
    'dashboard.js',
    'nahama-chat.js',
    'kincare-automation.js',
    'js/core.js',
    'js/auth.js',
    'js/nav.js'
];

jsFiles.forEach(file => {
    const filePath = path.join(rootDir, file);
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ Warning: ${file} does not exist`);
        warningCount++;
        return;
    }
    const code = fs.readFileSync(filePath, 'utf8');
    try {
        new Function(code);
        console.log(`  ✓ Syntax Check Passed: ${file}`);
    } catch (e) {
        console.error(`  ❌ Syntax Error in ${file}: ${e.message}`);
        errorCount++;
    }
});

// 2. Check Line Count Limits
const limits = {
    'js/core.js': 500,
    'js/auth.js': 500,
    'js/nav.js': 500,
    'kincare-automation.js': 500
};

Object.keys(limits).forEach(file => {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
        const lines = fs.readFileSync(filePath, 'utf8').split('\n').length;
        if (lines > limits[file]) {
            console.warn(`  ⚠️ File Size Warning: ${file} is ${lines} lines (Max: ${limits[file]})`);
            warningCount++;
        }
    }
});

// 3. Summary
console.log('\n----------------------------------------');
if (errorCount > 0) {
    console.error(`❌ Validation Failed: ${errorCount} error(s) found. FIX BEFORE DEPLOYING.`);
    process.exit(1);
} else {
    console.log(`✅ Validation Passed: 0 errors (${warningCount} warning(s)). Ready for deployment!`);
    process.exit(0);
}
