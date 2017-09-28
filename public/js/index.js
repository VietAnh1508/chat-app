$(document).ready(function() {
    $('#join-form').show();
    $('#chat-form').hide();

    $('#room-list').change(function () {
        if ($('#room-list').find(':selected').text() !== '-- Pick a room --') {
            let roomName = $('#room-list').find(':selected').text();
            $('[name=room]').val(roomName);
        }
    });

    $('#join-room').on('submit', function(e) {
        e.preventDefault();

        let txtUsername = $('[name=username]');
        let txtRoom = $('[name=room]');

        socket.emit('newUserJoin', {
            username: txtUsername.val(),
            room: txtRoom.val()
        }, function(err) {
            if (err) {
                alert(err);
            } else {
                $('#join-form').hide(1000);
                $('#chat-form').show(1500);
            }
        });
    });

    $('#message-form').on('submit', function (e) {
        e.preventDefault();

        let messageTextbox = $('[name=message]');

        socket.emit('userSendMessage', {
            text: messageTextbox.val()
        }, function () {
            messageTextbox.val('')
        });
    });

    let locationButton = $('#send-location');
    locationButton.on('click', function () {
        if (!navigator.geolocation) {
            return alert('Geolocation not supported by your browser');
        }

        locationButton.attr('disabled', 'disabled').text('Sending location...');

        navigator.geolocation.getCurrentPosition(function (position) {
            locationButton.removeAttr('disabled').text('Send location');
            socket.emit('userSendLocation', {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });
        }, function () {
            locationButton.removeAttr('disabled').text('Send location');
            alert('Unable to fetch location');
        });
    });

});

let socket = io();

socket.on('showRoomList', function (rooms) {
    rooms.forEach(function (room) {
        $('#room-list').append(`<option>${room}</option>`);
    });
});

socket.on('updateRoomList', function (rooms) {
    $('#room-list').empty();
    $('#room-list').append('<option>-- Pick a room --</option>');
    rooms.forEach(function (room) {
        $('#room-list').append(`<option>${room}</option>`);
    });
});

socket.on('updateUserList', function (users) {
    let ol = $('<ol></ol>');

    users.forEach(function (user) {
        ol.append($('<li></li>').text(user));
    });

    $('#users').html(ol);
});

socket.on('welcomeNewUser', function(data) {
    $('#room-name').text(data.room);
    let formattedTime = moment(data.message.createdAt).format('h:mm a');
    let template = $('#message-template').html();
    let html = Mustache.render(template, {
        from: data.message.from,
        text: data.message.text,
        createdAt: formattedTime
    });

    $('#messages').append(html);
    scrollToBottom();
});

socket.on('serverMessage', function(message) {
    let formattedTime = moment(message.createdAt).format('h:mm a');
    let template = $('#message-template').html();
    let html = Mustache.render(template, {
        from: message.from,
        text: message.text,
        createdAt: formattedTime
    });

    $('#messages').append(html);
    scrollToBottom();
});

socket.on('serverSendLocation', function (message) {
    let formattedTime = moment(message.createdAt).format('h:mm a');
    let template = $('#location-message-template').html();
    let html = Mustache.render(template, {
        from: message.from,
        url: message.url,
        createdAt: formattedTime
    });

    $('#messages').append(html);
    scrollToBottom();
});

function scrollToBottom() {
    // Selectors
    let messages = $('#messages');
    let newMessage = messages.children('li:last-child');
    // Heights
    let clientHeight = messages.prop('clientHeight');
    let scrollTop = messages.prop('scrollTop');
    let scrollHeight = messages.prop('scrollHeight');
    let newMessageHeight = newMessage.innerHeight();
    let lastMessageHeight = newMessage.prev().innerHeight();

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
}

socket.on('disconnect', function () {
    console.log('Disconnected from server');
});