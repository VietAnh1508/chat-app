const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', socket => {
    console.log('New user connected');

    socket.emit('newEmail', {
        from: 'abc@example.com',
        text: 'Hey, what is going on',
        createAt: 123
    });

    socket.emit('newMessage', {
        from: 'server',
        text: 'notification from server',
        createdAt: new Date().getTime()
    });

    socket.on('createMessage', message => {
        console.log('New message', message);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(port, () => console.log(`Server is up on port ${port}`));