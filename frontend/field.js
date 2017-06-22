const Ball = require('./ball.js');
const Paddle = require('./paddle.js');

const CENTER_X = 400;
const CENTER_Y = 300;

const HUMAN_COLOR = "royalblue";
const CPU_COLOR = "#cc0000";

const HUMAN_PADDLE_WIDTH = 120;
const HUMAN_PADDLE_HEIGHT = 80;
const CPU_PADDLE_WIDTH = 30;
const CPU_PADDLE_HEIGHT = 20;

class Field {

  constructor(stage, game) {
    this.stage = stage;
    this.game = game;

    this.ball = new Ball(this.stage, 60);
    this.humanPaddle = new Paddle(HUMAN_PADDLE_WIDTH, HUMAN_PADDLE_HEIGHT, HUMAN_COLOR, "near", this.stage)
    this.cpuPaddle = new Paddle(CPU_PADDLE_WIDTH, CPU_PADDLE_HEIGHT, CPU_COLOR, "far", this.stage)

    this.maxDistance = 60;
    this.cpuTrackingRatio = 30;

    this.ticker = createjs.Ticker;
    this.ticker.setFPS(60);

    this.audio = false;

    this.nearHit = new Audio('./asset/sounds/nearhit.wav');
    this.farHit = new Audio('./asset/sounds/farhit.wav');
    this.vWallHit = new Audio('./asset/sounds/wallhit.wav');
    this.hWallHit = new Audio('./asset/sounds/wallhit0.wav');
    this.goal = new Audio('./asset/sounds/goal.wav');

    this.renderField();
    this.renderPieces();
  }

  detectWallBounce() {
    if(this.ball.rawX >= 712 || this.ball.rawX <= 88){
      this.ball.xVelocity = this.ball.xVelocity * -1;
      this.ball.xSpin = 0;
      if (this.audio) {
        this.vWallHit.load();
        this.vWallHit.play();
      }
    }

    if(this.ball.rawY >= 509 || this.ball.rawY <= 91){
      this.ball.yVelocity = this.ball.yVelocity * -1;
      this.ball.ySpin = 0;
      if (this.audio) {
        this.vWallHit.load();
        this.vWallHit.play();
      }
    }
  }

  detectGoalOrHit() {
    if (this.ball.distance === this.maxDistance){
      this.detectCpuHit();
      this.ball.direction = "in";
    } else if (this.ball.distance === 0){
      this.detectHumanHit();
      this.ball.direction = "out";
    }
  }

  drawRectangle(shape, { x, y, w, h }) {
    shape.graphics.beginStroke("gray");
    shape.graphics.setStrokeStyle(3);
    shape.snapToPixel = true;
    shape.graphics.drawRect(x, y, w, h);

    this.stage.addChild(shape);
  }

  drawCorner(shape, { mtx, mty, ltx, lty }) {
    shape.graphics.beginStroke("gray");
    shape.graphics.setStrokeStyle(4);
    shape.snapToPixel = true;
    shape.graphics.moveTo(mtx, mty);
    shape.graphics.lineTo(ltx, lty);

    this.stage.addChild(shape);
  }

  drawBallMarker() {
    const ballMarker = new createjs.Shape();

    ballMarker.graphics.beginStroke("ghostwhite");
    ballMarker.graphics.setStrokeStyle(3);
    ballMarker.snapToPixel = true;
    ballMarker.graphics.drawRect(88, 91, 624, 418);
    ballMarker.name = 'ballMarker';

    this.stage.addChild(ballMarker);
  };

  movePaddles() {
    this.humanPaddle.move(this.ball);
    this.cpuPaddle.move(this.ball, this.cpuTrackingRatio);
    this.stage.update();
  }

  renderPieces() {
    this.cpuPaddle.draw();
    this.ball.draw();
    this.humanPaddle.draw();
    this.drawBallMarker();
    this.ticker.addEventListener('tick', this.movePaddles.bind(this));
  }

  renderField() {
    const border1 = new createjs.Shape();
    const border2 = new createjs.Shape();
    const border3 = new createjs.Shape();
    const border4 = new createjs.Shape();
    const border5 = new createjs.Shape();
    const border6 = new createjs.Shape();
    const border7 = new createjs.Shape();
    const border8 = new createjs.Shape();
    const border9 = new createjs.Shape();

    this.drawRectangle(border1, { x: 88, y: 91, w: 624, h: 418 });
    this.drawRectangle(border2, { x: 146, y: 130, w: 508, h: 340 });
    this.drawRectangle(border3, { x: 195, y: 162, w: 410, h: 276 });
    this.drawRectangle(border4, { x: 234, y: 190, w: 332, h: 221 });
    this.drawRectangle(border5, { x: 263, y: 208, w: 275, h: 184 });
    this.drawRectangle(border6, { x: 283, y: 222, w: 234, h: 157 });
    this.drawRectangle(border7, { x: 299, y: 233, w: 202, h: 135 });
    this.drawRectangle(border8, { x: 312, y: 240, w: 176, h: 120 });
    this.drawRectangle(border9, { x: 322, y: 247, w: 158, h: 106 });

    let cornerNW = new createjs.Shape();
    let cornerNE = new createjs.Shape();
    let cornerSE = new createjs.Shape();
    let cornerSW = new createjs.Shape();

    this.drawCorner(cornerNW, { mtx: 88, mty: 91, ltx: 322, lty: 247 });
    this.drawCorner(cornerNW, { mtx: 712, mty: 91, ltx: 479, lty: 247 });
    this.drawCorner(cornerNW, { mtx: 712, mty: 509, ltx: 479, lty: 353 });
    this.drawCorner(cornerNW, { mtx: 88, mty: 509, ltx: 322, lty: 353 });

    this.stage.update();
  }

  detectHumanHit() {
    if (this.humanPaddle.hit(this.ball)) {
      if (this.audio) {
        this.nearHit.load();
        this.nearHit.play();
      }
      this.getSpin();
    } else {
      this.ball.fillCommand.style = "#cc0000";
      if (this.audio) {
        this.goal.load();
        this.goal.play();
      }
      this.ticker.removeAllEventListeners('tick');
      this.ticker.addEventListener('tick', this.movePaddles.bind(this));
      this.game.resetPieces('human');
    }
  }

  getSpin() {
    let [xSpin, ySpin] = this.humanPaddle.spinVector();
    this.ball.xSpin += xSpin;
    this.ball.ySpin += ySpin;
  }

  detectCpuHit() {
    const cpuPaddle = this.stage.getChildByName('cpuPaddle');
    if (this.cpuPaddle.hit(this.ball)) {
      if (this.audio) {
        this.farHit.load();
        this.farHit.play();
      }
    } else {
      this.ball.fillCommand.style = HUMAN_COLOR;
      if (this.audio) {
        this.goal.load();
        this.goal.play();
      }
      this.ticker.removeAllEventListeners('tick');
      this.ticker.addEventListener('tick', this.movePaddles.bind(this));
      this.game.resetPieces('cpu');
    }
  }

  updateBallMarker() {
    const ballMarker = this.stage.getChildByName('ballMarker');

    const markerX = 88 + this.ball.distance * (321 - 88) / this.maxDistance;
    const markerY = 91 + this.ball.distance * (247 - 91) / this.maxDistance;
    const markerW = 624 - this.ball.distance * (624 - 158) / this.maxDistance;
    const markerH = 418 - this.ball.distance * (418 - 106) / this.maxDistance;

    ballMarker.graphics.clear().beginStroke("ghostwhite").drawRect(markerX, markerY, markerW, markerH);
  }


  hitBall(e = null) {
    if (this.humanPaddle.hit(this.ball)) {
      if (e) e.remove();
      if (this.audio) {
        this.nearHit.load();
        this.nearHit.play();
      }
      this.getSpin();
      if (this.ball.xSpin > 15) {
        this.ball.xSpin = 15;
      }
      if (this.ball.xSpin < -15) {
        this.ball.xSpin = -15;
      }
      if (this.ball.ySpin > 15) {
        this.ball.ySpin = 15;
      }
      if (this.ball.ySpin < -15) {
        this.ball.ySpin = -15;
      }
      this.ticker.addEventListener('tick', this.ballActions.bind(this));
    }
  }

  ballActions() {
    this.ball.move();
    this.detectWallBounce();
    this.detectGoalOrHit();
    this.updateBallMarker();
  }


}

module.exports = Field;
