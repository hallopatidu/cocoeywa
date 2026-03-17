const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const extensionsDir = path.join(__dirname, '..', 'extensions');

// Scan for extensions with a "build" script
const extensions = fs.readdirSync(extensionsDir).filter(name => {
    const extPath = path.join(extensionsDir, name);
    if (!fs.statSync(extPath).isDirectory()) return false;
    const pkgPath = path.join(extPath, 'package.json');
    if (!fs.existsSync(pkgPath)) return false;
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    return pkg.scripts && pkg.scripts.build;
});

console.log(`Watching ${extensions.length} extensions: ${extensions.join(', ')}`);

const DEBOUNCE_MS = 1000;
const buildTimers = {};
const building = {};

const IGNORED_DIRS = ['assets', 'dist', 'node_modules', '.git'];

function shouldIgnore(filePath) {
    const parts = filePath.split(path.sep);
    return parts.some(p => IGNORED_DIRS.includes(p));
}

function triggerBuild(extName) {
    if (buildTimers[extName]) clearTimeout(buildTimers[extName]);
    buildTimers[extName] = setTimeout(() => {
        if (building[extName]) return;
        building[extName] = true;
        const extPath = path.join(extensionsDir, extName);
        console.log(`\n[${extName}] Building...`);
        exec('npm run build', { cwd: extPath }, (err, stdout, stderr) => {
            building[extName] = false;
            if (err) {
                console.error(`[${extName}] Build FAILED:`);
                if (stderr) console.error(stderr);
            } else {
                console.log(`[${extName}] Build OK`);
            }
            if (stdout) console.log(stdout);
        });
    }, DEBOUNCE_MS);
}

// Watch each extension directory
for (const ext of extensions) {
    const extPath = path.join(extensionsDir, ext);
    try {
        fs.watch(extPath, { recursive: true }, (eventType, filename) => {
            if (!filename) return;
            if (shouldIgnore(filename)) return;
            console.log(`[${ext}] Changed: ${filename}`);
            triggerBuild(ext);
        });
        console.log(`  ✔ Watching: ${ext}`);
    } catch (e) {
        console.error(`  ✘ Failed to watch ${ext}: ${e.message}`);
    }
}

console.log('\n👀 Waiting for file changes...\n');
