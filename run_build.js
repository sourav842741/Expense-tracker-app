process.env.EXPO_TOKEN = 'V6Q5Fr-CYawjeSW3dKIU00bY9vFcAE1F0K50s1Gu';
const { spawn } = require('child_process');

console.log('🚀 Starting EAS Android APK Cloud Build for @sourav842741/moneycircle...');

const buildProcess = spawn('npx', ['eas-cli', 'build', '-p', 'android', '--profile', 'preview', '--non-interactive'], {
  env: process.env,
  shell: true,
  stdio: 'inherit'
});

buildProcess.on('exit', (code) => {
  console.log(`Build process completed with exit code ${code}`);
  process.exit(code || 0);
});
