var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

var rooms = {};

// app.use('/', routes);
// app.use('/users', users);

app.get('/', function(req, res) {
  res.render('index', {
    title: 'Whiteboard'
  });
});

app.post('/', function(req, res) {
  var data = {uri: uuid()};
  data.name = req.body.session;
  data.password = req.body.usePassword ? req.body.password : false;
  rooms[data.uri] = data;
  res.redirect('/room/' + data.uri);
});

app.get('/room/:id', function(req, res) {
  rooms[req.params.id] = rooms[req.params.id] || {
    uri: 'testRoom',
    name: 'testRoom',
    password: 'password',
    users: []
  };

  res.render('whiteboard', {
    title: 'Whiteboard',
    data: rooms[req.params.id]
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.set('port', process.env.PORT || 3000);

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

io.on('connection', function (socket) {
  socket.on('join', function(data) {
    socket.join(data.room);
    socket.broadcast.to(data.room).emit('newUser', data);
    socket.emit('users', {users: rooms[data.room].users});
    rooms[data.room].users = rooms[data.room].users.concat(data.id);
    console.log('%s joined %s', data.id, data.room);
  });

  socket.on('draw', function(data) {
    socket.broadcast.to(data.room).emit('draw', data);
  });

  socket.on('clear', function(data) {
    socket.broadcast.to(data.room).emit('clear', {users: rooms[data.room].users});
  });

  socket.on('cleanup', function(data) {
    var users = rooms[data.room].users;
    var ind = users.indexOf(data.id);
    if(ind > -1) {
      rooms[data.room].users = users.slice(0, ind).concat(users.slice(ind+1));
    }
    socket.broadcast.to(data.room).emit('cleanup', data);
    console.log('%s left %s', data.id, data.room);
  });

});

module.exports = app;
