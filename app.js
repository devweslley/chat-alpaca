const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const path = require('path');
const nlp = require('compromise');
const bodyParser = require('body-parser');
const STATUS = require('./enum/status.enum.json');
const { spawn } = require('child_process');

const app = express();
const server = http.createServer(app);
nlp.extend(require('compromise-sentences'));
require('dotenv/config');

const PORT = process.env.PORT || 3000;
let status = STATUS.LOADING;

app.use(bodyParser.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const child = spawn('./chat', []);

app.post('/', (req, res) => {
  try {
    if (status !== STATUS.LOADED) throw new Error(status);
    if (req.body.message) child.stdin.write(`${req.body.message}\n`);

    res.status(200).end();
  } catch (err) {
    console.log(err.message);
    res.status(500).end();
  }
});

const io = socketIo(server);

io.on('connection', async (socket) => {
  socket.on('disconnect', () => {
    socket.disconnect(0);
  });

  child.stdout.on('data', (data) => {
    if (data.includes('>') && status !== STATUS.LOADED) {
      status = STATUS.LOADED;
      socket.emit('data', '%clear%');
      return;
    }
    socket.emit('data', `${data}`);
  });

  child.stderr.on('data', (data) => {
    socket.emit('data', `${data}`);
  });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
