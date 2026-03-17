const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const extensionsDir = path.join(__dirname, '..', 'extensions');

const extensions = fs.readdirSync(extensionsDir).filter(name => {
    const extPath = path.join(extensionsDir, name);
    return fs.statSync(extPath).isDirectory() &&
           fs.existsSync(path.join(extPath, 'package.json'));
});

let allReady = true;

for (const ext of extensions) {
    const extPath = path.join(extensionsDir, ext);
    const nodeModulesPath = path.join(extPath, 'node_modules');
    const packageJsonPath = path.join(extPath, 'package.json');

    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const deps = Object.keys(pkg.dependencies || {});
    const devDeps = Object.keys(pkg.devDependencies || {});
    const allDeps = [...deps, ...devDeps];

    if (allDeps.length === 0) {
        console.log(`[${ext}] No dependencies defined, skipping.`);
        continue;
    }

    if (!fs.existsSync(nodeModulesPath)) {
        console.log(`[${ext}] node_modules not found. Running npm install...`);
        allReady = false;
        try {
            execSync('npm install', { cwd: extPath, stdio: 'inherit' });
            console.log(`[${ext}] npm install completed.`);
        } catch (e) {
            console.error(`[${ext}] npm install FAILED!`);
        }
        continue;
    }

    // Check if all dependencies exist in node_modules
    let missing = false;
    for (const dep of allDeps) {
        const depPath = path.join(nodeModulesPath, dep);
        if (!fs.existsSync(depPath)) {
            missing = true;
            break;
        }
    }

    if (missing) {
        console.log(`[${ext}] Some dependencies are missing. Running npm install...`);
        allReady = false;
        try {
            execSync('npm install', { cwd: extPath, stdio: 'inherit' });
            console.log(`[${ext}] npm install completed.`);
        } catch (e) {
            console.error(`[${ext}] npm install FAILED!`);
        }
    } else {
        console.log(`[${ext}] ✔ All dependencies installed.`);
    }
}

if (allReady) {
    console.log('\n✅ All extensions are ready!');
} else {
    console.log('\n✅ Dependencies installation finished.');
}
