import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { networkInterfaces } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Get local IP addresses
const getLocalIpAddresses = () => {
  const interfaces = networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  
  return addresses;
};

// Start the backend server
console.log('Starting API server...');
const apiProcess = spawn('npm', ['run', 'dev'], { 
  cwd: resolve(__dirname, 'APITEST'),
  stdio: 'pipe',
  shell: true
});

apiProcess.stdout.on('data', (data) => {
  console.log(`[API] ${data.toString().trim()}`);
});

apiProcess.stderr.on('data', (data) => {
  console.error(`[API ERROR] ${data.toString().trim()}`);
});

// Wait a bit for the API to start before starting the frontend
setTimeout(() => {
  console.log('Starting frontend server...');
  const frontendProcess = spawn('npm', ['run', 'dev'], { 
    cwd: __dirname,
    stdio: 'pipe',
    shell: true
  });

  frontendProcess.stdout.on('data', (data) => {
    console.log(`[Frontend] ${data.toString().trim()}`);
  });

  frontendProcess.stderr.on('data', (data) => {
    console.error(`[Frontend ERROR] ${data.toString().trim()}`);
  });

  // Display access information after both servers are started
  setTimeout(() => {
    const localIps = getLocalIpAddresses();
    
    console.log('\n===== DEMO ACCESS INFORMATION =====');
    console.log('Frontend is running at:');
    console.log('- http://localhost:5173 (local access)');
    
    if (localIps.length > 0) {
      console.log('- For network access, use any of these URLs:');
      localIps.forEach(ip => {
        console.log(`  http://${ip}:5173`);
      });
    }
    
    console.log('\nAPI is running at:');
    console.log('- http://localhost:5000 (local access)');
    
    if (localIps.length > 0) {
      console.log('- For network access, use any of these URLs:');
      localIps.forEach(ip => {
        console.log(`  http://${ip}:5000`);
      });
    }
    
    console.log('\nShare the frontend URL with people on your network to access the demo.');
    console.log('Press Ctrl+C to stop both servers.');
    console.log('=====================================');
  }, 5000);
}, 3000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping servers...');
  apiProcess.kill();
  process.exit();
});