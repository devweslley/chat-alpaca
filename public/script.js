const input = document.getElementById('prompt');
const monitor = document.getElementById('monitor');

const socket = io();

socket.on('connect', () => {
  monitor.innerText = 'Loading...\n';
});

socket.on('data', (data) => {
  if (data === '%clear%') {
    monitor.innerText = '';
    return;
  }

  monitor.innerText += data;
});

input.addEventListener('keyup', async (ev) => {
  if (ev.key !== 'Enter') return;
  
  const config = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: ev.target.value }),
  };

  const request = await fetch('/', config);
  console.log(request.status);
});