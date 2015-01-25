var app = (function($) {
  return function(data) {

    var hostname = 'http://' + window.location.host;
    var socket = io.connect(hostname, {forceNew: true});
    var id = uuid();
    var passwordAttempts = 0;
    var path = window.location.pathname.split('/');
    var room = path[path.length - 1] || path[path.length - 2];
    console.log(room);

    function uuid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    function login() {
      if(data.password) {
        passwordAttempts++;
        var password = prompt("enter password: ");
        if (password != data.password) {
          if (passwordAttempts > 1) {
            alert("Sorry, you suck");
            window.location.replace("/");
          } else {
            alert("Try again newb");
            login();
          }
        }
      }
    }

    function addCanvas(id, id2) {
      var canvas = document.createElement('canvas');
      canvas.setAttribute('id', id2);
      canvas.width = $(document).width() - 20;
      canvas.height = $(document).height() - $('#header').height();
      $('#' + id).append(canvas);
    }

    function getCtx(id,color) {
      var ctx = document.getElementById(id).getContext('2d');
      ctx.fillStyle = 'solid';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      return ctx;
    }

    function draw(id,color,x,y,type) {
      var ctx = getCtx(id,color);
      if (type == 'dragstart') {
        ctx.beginPath();
        ctx.moveTo(x,y);
      } else if (type == 'drag') {
        ctx.lineTo(x,y);
        ctx.stroke();
      } else {
        ctx.closePath();
      }
    }

    function clear(id) {
      var canvas = document.getElementById(id);
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    $(document).on('drag dragstart dragend', '#' + id, function(e) {
      var type = e.handleObj.type;
      var offset = $(this).offset();
      e.offsetX = e.pageX - offset.left;
      e.offsetY = e.pageY - offset.top;
      var x = e.offsetX;
      var y = e.offsetY;
      draw(id,$('#color').val(),x,y,type);
      socket.emit('draw', {
        id: id,
        room: room,
        x: x,
        y: y,
        type: type,
        color: $('#color').val()
      });
    });

    $(document).on('click', '#clear', function(e) {
      clear(id);
      socket.emit('clear', {id: id, room: room});
    });

    socket.on('disconnect', function() {
      socket.emit('cleanup', {id: id, room: room});
    });

    socket.on('draw', function(data) {
      draw(data.id, data.color, data.x, data.y, data.type);
    });

    socket.on('clear', function(data) {
      data.users.forEach(function(el, i) {
        clear(el);
      });
    });

    socket.on('cleanup', function(data) {
      $('#' + data.id).remove();
    });

    socket.on('newUser', function(data) {
      addCanvas('whiteboards', data.id);
    });

    socket.on('users', function(data) {
      data.users.forEach(function(el, i) {
        addCanvas('whiteboards', el);
      });
    });

    return {
      init: function() {
        login();
        addCanvas('canvas', id);
        socket.emit('join', {id: id, room: room});
      }
    };

  };
}(jQuery));
