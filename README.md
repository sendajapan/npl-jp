# NPL-JP VFS Proxy Launcher

The app opens Chrome with a **persistent profile** (`browser-profile/`) so you can use Tampermonkey and the VFS Auto Login script.

## First-time setup (Tampermonkey + script)

1. Run the app once (see **Run** below). Chrome will open with a fresh profile.
2. Install **Tampermonkey** from the [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo).
3. Open the script file in the project: `VFS Global Auto Login (Nepal → Japan)-4.0.user.js`. In Tampermonkey: Dashboard → Create new script → paste the file contents (or use “Install from URL” if you host it). Save and ensure the script is **enabled**.
4. Close the browser and run the app again. The same profile loads with Tampermonkey and your script; the app will not inject the script again (it uses the extension).

To use a **clean profile with no extensions** (script injected by the app instead), set `userDataDir: null` (or remove it) and `useChrome: false` in `config.js`.

## Run

From project root (where `playwright` is installed):

```bash
node npl-jp/index.js
```

Or from the `npl-jp` folder:

```bash
node index.js
```

## Kill all running instances

Stop all background Node processes (e.g. leftover launcher or Chromium):

**Windows (PowerShell or CMD):**

```bash
taskkill /F /IM node.exe
```

**macOS / Linux:**

```bash
pkill -f "node.*index.js"
```

Or to kill all Node processes:

```bash
pkill -f node
```
