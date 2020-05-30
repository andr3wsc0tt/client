socket = io("https://server--knoble.repl.co");

var movement = {
  up: false,
  down: false,
  left: false,
  right: false,
  space: false,
  angle: 0
}

document.addEventListener('keydown', (event) => {
  switch (event.keyCode) {
    case 65:
      movement.left = true;
      break;
    case 87:
      movement.up = true;
      break;
    case 68:
      movement.right = true;
      break;
    case 83:
      movement.down = true;
      break;
    case 32:
      movement.space = true;
      break;
  }
})

document.addEventListener('keyup', (event) => {
  switch (event.keyCode) {
    case 65:
      movement.left = false;
      break;
    case 87:
      movement.up = false;
      break;
    case 68:
      movement.right = false;
      break;
    case 83:
      movement.down = false;
      break;
    case 32:
      movement.space = false;
      break;
  }
})

rotate = (cx, cy, x, y, angle) => {
  var radians = (Math.PI / 180) * angle,
    cos = Math.cos(radians),
    sin = Math.sin(radians),
    nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
    ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
  return [nx, ny];
}

class player {
  drawMe = (ctx, x, y, angle, color = "black") => {

    var ax = x + 10;
    var ay = y;

    var bx = x - 15;
    var by = y - 12.5;

    var cx = x - 15;
    var cy = y + 12.5;

    var axD, ayD, bxD, byD, cxD, cyD;

    [axD, ayD] = rotate(x, y, ax, ay, angle);
    [bxD, byD] = rotate(x, y, bx, by, angle);
    [cxD, cyD] = rotate(x, y, cx, cy, angle);

    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(axD, ayD);
    ctx.lineTo(bxD, byD);
    ctx.lineTo(cxD, cyD);
    ctx.fill();
  }

  explodeMe = (ctx, x, y, death, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.rect(x - death, y + death, 10, 10);
    ctx.rect(x + death, y + death, 10, 10);
    ctx.rect(x + death, y - death, 10, 10);
    ctx.rect(x - death, y - death, 10, 10);
    ctx.fill();
  }
}

drawBullet = (ctx, x, y) => {
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, 2 * Math.PI);
  ctx.fill();
}

var alive = true;

socket.emit('new player');
var interval = setInterval(() => {
  if (alive == false) {
    clearInterval(interval);
  }
  socket.emit('movement', movement);
}, 1000 / 60);

var canvas = document.getElementById("game");
canvas.width = 600;
canvas.height = 400;
var context = canvas.getContext("2d");

var test = new player();

socket.on('state', (players) => {
  context.clearRect(0, 0, 600, 400);

  for (var id in players) {
    var player = players[id];
    var color = "black";
    if (id == socket.id)
      var color = "red";
    if (player.hp > 0)
      test.drawMe(context, player.x, player.y, player.angle, color);
    else if (player.death < 250) {
      test.explodeMe(context, player.x, player.y, player.death, color);
      if (id == socket.id) {
        alive = false;
      }
    }

    for (var bul in player.bullets) {
      drawBullet(context, player.bullets[bul].x, player.bullets[bul].y);
    }
  }
})