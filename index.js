

 const level1 = [
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
];

 const level2 = [
  [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
  [0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1],
  [0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1],
  [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0]
];

 const level3 = [
  [0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0],
  [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0]
];


const GAMESTATE = {
  PAUSED: 0,
  RUNNING: 1,
  MENU: 2,
  GAMEOVER: 3,
  NEWLEVEL: 4,
  GAMEWON: 5
};

class Paddle {
  constructor(game) {
    this.gameWidth = game.gameWidth;

    this.width = 150;
    this.height = 20;

    this.maxSpeed = 5;
    this.speed = 0;

    this.position = {
      x: game.gameWidth / 2 - this.width / 2,
      y: game.gameHeight - this.height - 10
    };
  }

  moveLeft() {
    this.speed = -this.maxSpeed;
  }

  moveRight() {
    this.speed = this.maxSpeed;
  }

  stop() {
    this.speed = 0;
  }

  draw(ctx) {
    
    this.image = document.getElementById("paddle");
    ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
  }

  update(deltaTime) {
    this.position.x += this.speed;

    if (this.position.x < 0) this.position.x = 0;

    if (this.position.x + this.width > this.gameWidth)
      this.position.x = this.gameWidth - this.width;
  }
}


class InputHandler {
  constructor(paddle, game) {

    document.addEventListener("keydown", event => {
      switch (event.keyCode) {
        case 37:
          paddle.moveLeft();
          break;

        case 39:
          paddle.moveRight();
          break;

        case 32:
          game.start();
          break;

        case 27:
          game.togglePause();
          break;
      }
    });
    document.getElementById("btn1").addEventListener("click", function() {paddle.moveLeft()});
    document.getElementById("btn2").addEventListener("click", function() {paddle.moveRight()});
    document.getElementById("startBtn").addEventListener("click", function() {
      if(this.innerText == "PAUSE") {
        game.togglePause();
      }
      if(this.innerText == "START") {
        game.start();
        this.innerText = "Pause";
      }

    });
  }
}


class Ball {
  constructor(game) {
    this.image = document.getElementById("img_ball");

    this.gameWidth = game.gameWidth;
    this.gameHeight = game.gameHeight;

    this.game = game;
    this.size = 20;
    this.reset();
  }

  reset() {
    this.position = { x: 10, y: 400 };
    this.speed = { x: 4, y: -2 };
  }

  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.size,
      this.size
    );
  }

  update(deltaTime) {
    this.position.x += this.speed.x;
    this.position.y += this.speed.y;

    // wall on left or right
    if (this.position.x + this.size > this.gameWidth || this.position.x < 0) {
      this.speed.x = -this.speed.x;
    }

    // wall on top
    if (this.position.y < 0) {
      this.speed.y = -this.speed.y;
    }

    // bottom of game
    if (this.position.y + this.size > this.gameHeight) {
      this.game.lives--;
      this.reset();
    }

    if (detectCollision(this, this.game.paddle)) {
      this.speed.y = -this.speed.y;
      this.position.y = this.game.paddle.position.y - this.size;
    }
  }
}

class Brick {
  constructor(game, position, counter) {

    if(counter % 2 == 0)
    {
      this.image = document.getElementById("img_brick");
    }
    else {
      this.image = document.getElementById("img_brick2");
    }
    
    this.game = game;

    this.position = position;
    this.width = 80;
    this.height = 24;

    this.markedForDeletion = false;
  }

  update() {
    if (detectCollision(this.game.ball, this)) {
      this.game.ball.speed.y = -this.game.ball.speed.y;

      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }
}


function detectCollision(ball, gameObject) {
  let bottomOfBall = ball.position.y + ball.size;
  let topOfBall = ball.position.y;

  let topOfObject = gameObject.position.y;
  let leftSideOfObject = gameObject.position.x;
  let rightSideOfObject = gameObject.position.x + gameObject.width;
  let bottomOfObject = gameObject.position.y + gameObject.height;

  if (
    bottomOfBall >= topOfObject &&
    topOfBall <= bottomOfObject &&
    ball.position.x >= leftSideOfObject &&
    ball.position.x + ball.size <= rightSideOfObject
  ) {
    return true;
  } else {
    return false;
  }
}


function buildLevel(game, level) {
  let bricks = [];
  let counter = 0;

  level.forEach((row, rowIndex) => {
    row.forEach((brick, brickIndex) => {
      if (brick === 1) {
        let position = {
          x: 80 * brickIndex,
          y: 75 + 24 * rowIndex
        };
        bricks.push(new Brick(game, position, counter));
        counter++;
      }
    });
  });

  return bricks;
}



  class Game {
  constructor(gameWidth, gameHeight, bricksPerRow) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.gamestate = GAMESTATE.MENU;
    this.ball = new Ball(this);
    this.paddle = new Paddle(this);
    this.gameObjects = [];
    this.bricks = [];
    this.lives = 3;

    this.levels = [level1, level2, level3];
    this.currentLevel = 0;

    new InputHandler(this.paddle, this);
  }

  start() {
    if (
      this.gamestate !== GAMESTATE.MENU &&
      this.gamestate !== GAMESTATE.NEWLEVEL
    )
      return;
      
    this.bricks = buildLevel(this, this.levels[this.currentLevel]);
    this.ball.reset();
    this.gameObjects = [this.ball, this.paddle];

    this.gamestate = GAMESTATE.RUNNING;
  }

  update(deltaTime) {
    if (this.lives === 0) this.gamestate = GAMESTATE.GAMEOVER;

    if (
      this.gamestate === GAMESTATE.PAUSED ||
      this.gamestate === GAMESTATE.MENU ||
      this.gamestate === GAMESTATE.GAMEOVER ||
      this.gamestate === GAMESTATE.GAMEWON
    )
      return;

    if (this.bricks.length === 0) {
      if(this.currentLevel === 2) {
        this.gamestate = GAMESTATE.GAMEWON;
      }
      else {
        this.currentLevel++;
        this.ball.speed.x++;
        this.ball.speed.y++;
        this.paddle.maxSpeed
        this.gamestate = GAMESTATE.NEWLEVEL;
        this.start();
      }
    }

    [...this.gameObjects, ...this.bricks].forEach(object =>
      object.update(deltaTime)
    );

    this.bricks = this.bricks.filter(brick => !brick.markedForDeletion);
  }

  draw(ctx) {
    [...this.gameObjects, ...this.bricks].forEach(object => object.draw(ctx));

    if (this.gamestate === GAMESTATE.PAUSED) {
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
      ctx.globalAlpha = 1.0;

      this.image1 = document.getElementById("paused");
      ctx.drawImage(this.image1, 0, 0, this.gameWidth, this.gameHeight);
    }

    if (this.gamestate === GAMESTATE.MENU) {
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
      ctx.globalAlpha = 1.0;

      this.image = document.getElementById("start");
      ctx.drawImage(this.image, 0, 0, this.gameWidth, this.gameHeight);
      
    }
    if (this.gamestate === GAMESTATE.GAMEOVER) {

      ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
      ctx.globalAlpha = 1.0;

      this.image = document.getElementById("fired");
      ctx.drawImage(this.image, 0, 0, this.gameWidth, this.gameHeight);
       
    }
    if(this.gamestate === GAMESTATE.GAMEWON) {
      
      ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
      ctx.globalAlpha = 1.0;

      this.image = document.getElementById("promoted");
      ctx.drawImage(this.image, 0, 0, this.gameWidth, this.gameHeight);
    }
  }

  togglePause() {
    if (this.gamestate == GAMESTATE.PAUSED) {
      this.gamestate = GAMESTATE.RUNNING;
    } else {
      this.gamestate = GAMESTATE.PAUSED;
    }
  }
}


let canvas = document.getElementById("gameScreen");
let ctx = canvas.getContext("2d");

const GAME_WIDTH = 1000;
const GAME_HEIGHT = 680;

let game = new Game(GAME_WIDTH, GAME_HEIGHT);

let lastTime = 0;
function gameLoop(timestamp) {
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  game.update(deltaTime);
  game.draw(ctx);

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
