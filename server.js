const express = require('express');
const http = require('http');
const multer = require('multer');
const winston = require('winston');
const moment = require('moment');
const app = express();
const path = require('path');

const messages = [];

app.use(express.static(path.join(__dirname, 'public')));
const upload = multer({ dest: 'public/uploads/' });
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log' })
  ]
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080" 
  }
});


io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.join('default');

    socket.on('chat message', (data) => {
      messages.push({ username: data.username, message: data.message });
      io.emit('chat message', { username: data.username, message: data.message });
    });
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
})

app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  res.send('File uploaded successfully.');
});

logger.info('This is an informational log message.');

server.listen(3000, () => {
  console.log('Server listening on :3000');
});
