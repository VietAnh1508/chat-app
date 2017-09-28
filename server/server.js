const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/users');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);
let users = new Users();

app.use(express.static(publicPath));

server.listen(port, () => console.log(`Server is up on port ${port}`));

io.on('connection', socket => {
    console.log(`${socket.id} was connected`);

    socket.emit('showRoomList', users.getRoomList());

    socket.on('newUserJoin', (value, callback) => {
        let onlineUserList = users.getUserList(value.room);

        if (!isRealString(value.username) || !isRealString(value.room)) {
            return callback('Name and room name are required!');
        } else if (onlineUserList.includes(value.username)) {
            return callback('This name has been taken, please choose another name!');
        }

        socket.join(value.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, value.username, value.room);

        io.to(value.room).emit('updateUserList', users.getUserList(value.room));
        socket.emit('welcomeNewUser', {
            room: value.room,
            message: generateMessage('Admin', 'Welcome to the chat app')
        });
        socket.broadcast.to(value.room).emit('serverMessage', generateMessage('Admin', `${value.username} has joined`));
        socket.broadcast.emit('updateRoomList', users.getRoomList());

        console.log(`${value.username} join room ${value.room}`);
        callback();
    });

    socket.on('userSendMessage', (message, callback) => {
        let user = users.getUser(socket.id);
        if (user && isRealString(message.text)) {
            io.to(user.room).emit('serverMessage', generateMessage(user.name, message.text));
        }

        callback();
    });

    socket.on('userSendLocation', coords => {
        let user = users.getUser(socket.id);
        if (user) {
            io.to(user.room).emit('serverSendLocation', generateLocationMessage(user.name, coords.latitude, coords.longitude));
        }
    });

    socket.on('disconnect', () => {
        console.log(`${socket.id} was disconnected`);

        let user = users.removeUser(socket.id);
        if (user) {
            let userList = users.getUserList(user.room);
            if (userList) {
                io.to(user.room).emit('updateUserList', users.getUserList(user.room));
                io.to(user.room).emit('serverMessage', generateMessage('Admin', `${user.name} has left`));
            } else {
                socket.broadcast.emit('updateRoomList', users.getRoomList());
            }
        }
    });

});