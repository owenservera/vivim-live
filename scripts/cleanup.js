const { execSync } = require('child_process');
const os = require('os');

const PORT = process.env.PORT || 3000;

function killPort() {
  console.log(`\n🧹 Running cleanup script: Checking if port ${PORT} is in use...`);
  try {
    if (os.platform() === 'win32') {
      const output = execSync(`netstat -ano | findstr :${PORT}`).toString();
      const lines = output.split('\n');
      const pids = new Set();
      for (const line of lines) {
        if (!line.includes(`:${PORT}`)) continue;
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0') pids.add(pid);
      }
      let killed = false;
      for (const pid of pids) {
        console.log(`Killing process ${pid} using port ${PORT}...`);
        try {
          execSync(`taskkill /PID ${pid} /F`);
          killed = true;
        } catch (e) {
          console.error(`Failed to kill process ${pid}`);
        }
      }
      if (killed) {
        console.log(`Port ${PORT} has been freed.\n`);
      } else {
        console.log(`No active processes found on port ${PORT}.\n`);
      }
    } else {
      const output = execSync(`lsof -i :${PORT} -t`).toString();
      const pids = output.trim().split('\n');
      let killed = false;
      for (const pid of pids) {
        if (pid) {
          console.log(`Killing process ${pid} using port ${PORT}...`);
          try {
            execSync(`kill -9 ${pid}`);
            killed = true;
          } catch (e) {
            console.error(`Failed to kill process ${pid}`);
          }
        }
      }
      if (killed) {
        console.log(`Port ${PORT} has been freed.\n`);
      } else {
        console.log(`No active processes found on port ${PORT}.\n`);
      }
    }
  } catch (err) {
    // Commands like 'findstr' or 'lsof' return non-zero exit codes if nothing is found
    console.log(`Port ${PORT} is free, ready to launch.\n`);
  }
}

killPort();
