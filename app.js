var express = require('express'),
app = express(),
server = require('http').createServer(app),
io = require('socket.io').listen(server),
port = process.env.PORT || 8000;
usernames = [];

server.listen(port);

app.use(express.static(__dirname));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

//this is server

io.sockets.on('connection', function(socket) {
  socket.on('new user', function(data, callback){
    if(usernames.indexOf(data) != -1) //-1 if not found
      callback(false);
    else {
      callback(true);
      socket.username = data;
      usernames.push(socket.username);
      updateUsernames();
    }
  });

  function updateUsernames() {
    io.sockets.emit('usernames', usernames);
  }

  socket.on('send message', function(data) {
    io.sockets.emit('new message', {msg: data, user: socket.username}); //gets the data/message at the server and emits it as the new message so that other users can receive it too...
  });

  //disconnect removes the username
  socket.on('disconnect', function(data) {
    if(!socket.username) return;
    usernames.splice(usernames.indexOf(socket.username), 1);
    updateUsernames();
  });
});
