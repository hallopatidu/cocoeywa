// update_launch_url.js
// Fetches a redirected URL, extracts the 'data' token param, and updates the
// debug configuration so Chrome will open with the token.  No regular browser
// is launched; the token lands in the URL used by the debugger.

const fs = require('fs');
const gameCode = 'sl_35_fire_horse_777';
(async () => {
    try {
        const target = `https://dev.royaledge.io/play?gameCode=${gameCode}`;

        // follow redirects
        const res = await fetch(target, { redirect: 'follow' });
        const finalUrl = res.url;
        const parsed = new URL(finalUrl);
        const token = parsed.searchParams.get('data');

        if (!token) {
            console.error('No "data" parameter found in redirect URL:', finalUrl);
            process.exit(1);
        }

        const launchPath = './.vscode/launch.json';
        const json = JSON.parse(fs.readFileSync(launchPath, 'utf8'));
        if (json.configurations && json.configurations.length > 0) {
            json.configurations[0].url = `http://localhost:7456?data=${token}`;
            fs.writeFileSync(launchPath, JSON.stringify(json, null, 4), 'utf8');
            console.log('launch.json updated with token', token);
        } else {
            console.error('launch.json has no configurations array');
            process.exit(1);
        }
    } catch (err) {
        console.error('error running update script', err);
        process.exit(1);
    }
})();
