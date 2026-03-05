const { execSync } = require('child_process');

function getScreenSize() {
  try {
    let width, height;
    if (process.platform === 'win32') {
      const output = execSync(
        'powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Width; [System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Height"',
        { encoding: 'utf8' }
      ).trim().split('\n');
      width = parseInt(output[0]);
      height = parseInt(output[1]);
    } else if (process.platform === 'darwin') {
      const output = execSync(
        `osascript -e 'tell application "Finder" to get bounds of window of desktop'`,
        { encoding: 'utf8' }
      ).trim();
      const parts = output.split(', ');
      width = parseInt(parts[2]);
      height = parseInt(parts[3]);
    } else {
      const output = execSync(`xdpyinfo | grep dimensions`, { encoding: 'utf8' });
      const match = output.match(/(\d+)x(\d+)/);
      width = parseInt(match[1]);
      height = parseInt(match[2]);
    }
    return { width, height };
  } catch (_) {
    console.warn('[WARN] Could not detect screen size. Using fallback 1920x1080.');
    return { width: 1920, height: 1080 };
  }
}

module.exports = { getScreenSize };
