function draw(prevX, prevY, x, y) {
  var ctx = document.getElementById('c1').getContext('2d');
  ctx.fillStyle = 'solid';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  // ctx.lineCap = 'round';

  ctx.moveTo(prevX, prevY);
  ctx.lineTo(x, y);
  ctx.stroke();
}

var canvas = $('#c1');
var doc = $(document);
var lastEmit = $.now();
var prevX;
var prevY;
var drawing = false;

canvas.on('mousedown',function(e){
  e.preventDefault();
  var offset = $(this).offset();
  drawing = true;
  prevX = e.pageX - offset.left;
  prevY = e.pageY - offset.top;

  // Hide the instructions
});

doc.bind('mouseup mouseleave',function(){
  drawing = false;
});

canvas.on('mousemove', function(e){
  var offset = $(this).offset();
  var x = e.pageX - offset.left,
    y = e.pageY - offset.top;
  // if($.now() - lastEmit > 30){
  //   // socket.emit('mousemove',{
  //     'x': e.pageX,
  //     'y': e.pageY,
  //     'drawing': drawing,
  //     'id': id
  //   // });
  //   lastEmit = $.now();
  // }

  // Draw a line for the current user's movement, as it is
  // not received in the socket.on('moving') event above

  if(drawing){

    draw(prevX, prevY, x, y);

    prevX = x;
    prevY = y;
  }
});
