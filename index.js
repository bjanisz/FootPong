//reference to canvas
const canvas = document.getElementById('gameCanvas');

//determination of canvas mode
const ctx = canvas.getContext('2d');
//change color used to fill the drawing
ctx.fillStyle = 'white';

//defining constants
//canvas height and width
const CANVAS_HEIGHT = canvas.height;
const CANVAS_WIDTH = canvas.width;
//x and y coordinate of punctation
//y-coordinate of both punctations
const BOARD_Y = 50;
//x-coordinate of player 1 punctation
const BOARD_P1_X = 300;
//x-coordinate of player 2 punctation
const BOARD_P2_X = 500;
//paddle height and width
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 20;
//paddles coordinates
//x-coordinate of player 1 paddle
const PADDLE_P1_X = 10;
//x-coordinate of player 2 paddle
const PADDLE_P2_X = 770;
//initial y-coordinate of paddles
const PADDLE_START_Y = (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2;
//paddle step
const PADDLE_STEP = 3;
//defining a ball
//balls radius
const BALL_R = 15;
//initial x-coordinate of the ball center
const BALL_START_X = CANVAS_WIDTH / 2;
//initial y-coordinate of the ball center
const BALL_START_Y = CANVAS_HEIGHT / 2;
//balls velocity
//initial ball velocity at the x-coordinate
const BALL_START_DX = 4.5;
//initial ball velocity at the y-coordinate
const BALL_START_DY = 1.5;
//frequency of change of state
const STATE_CHANGE_INTERVAL = 20;
//game controls
const P1_UP_BUTTON = 'KeyQ';
const P1_DOWN_BUTTON = 'KeyA';
const P2_UP_BUTTON = 'KeyI';
const P2_DOWN_BUTTON = 'KeyK';
const UP_ACTION = 'up';
const DOWN_ACTION = 'down';
const STOP_ACTION = 'stop';
const PAUSE_BUTTON = 'KeyB';


//Utils
function coerceIn(value, min, max) {
    if (value <= min) {
        return min;
    } else if (value >= max) {
        return max;
    } else {
        return value;
    }
}

function isInBetween(value, min, max) {
    return value >= min && value <= max;
}

//drawing a Paddle
function drawPaddle (x, y) {
    ctx.fillRect(x, y, PADDLE_WIDTH, PADDLE_HEIGHT);
}

//displaying text to show score
ctx.font = "40px Arial";

function drawPoints(text, x) {
    ctx.fillText(text, x, BOARD_Y)
}

//displaying a ball
function drawCircle (x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
}

function drawBall(x, y) {
    drawCircle(x, y, BALL_R)
}

//clearing our canvas
function clearCanvas() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

//pausing the game
let p1Action = STOP_ACTION;
let p2Action = STOP_ACTION;
let paused = false;


//states of play
let ballX = BALL_START_X;
let ballY = BALL_START_Y;
let ballDX = BALL_START_DX;
let ballDY = BALL_START_DY;
let p1PaddleY = PADDLE_START_Y;
let p2PaddleY = PADDLE_START_Y;
let p1Points = 0;
let p2Points = 0;

//moving and stopping paddles

window.addEventListener('keydown', function (event) {
    let code = event.code;
    if (code === P1_UP_BUTTON) {
        p1Action = UP_ACTION;
    } else if (code === P1_DOWN_BUTTON) {
        p1Action = DOWN_ACTION;
    }   else if (code === P2_UP_BUTTON) {
        p2Action = UP_ACTION;
    } else if (code === P2_DOWN_BUTTON) {
        p2Action = DOWN_ACTION;
    } else if (code === PAUSE_BUTTON) {
        paused = !paused;
    }
});

window.addEventListener('keyup', function (event) {
    let code = event.code;
    if( (code === P1_UP_BUTTON && p1Action === UP_ACTION) || (code === P1_DOWN_BUTTON && p1Action === DOWN_ACTION) ) {
        p1Action = STOP_ACTION;
    } else if ( ( code === P2_UP_BUTTON && p2Action === UP_ACTION) || (code === P2_DOWN_BUTTON && p2Action === DOWN_ACTION) ) {
        p2Action = STOP_ACTION;
    }
});

function coercePaddle(paddleY) {
    const minPaddleY = 0;
    const maxPaddleY = CANVAS_HEIGHT - PADDLE_HEIGHT;
    return coerceIn(paddleY, minPaddleY, maxPaddleY)
}

function movePaddles() {
    if (p1Action === UP_ACTION) {
        p1PaddleY = coercePaddle(p1PaddleY - PADDLE_STEP);
    } else if (p1Action === DOWN_ACTION) {
        p1PaddleY = coercePaddle(p1PaddleY + PADDLE_STEP);
    } 
    if (p2Action === UP_ACTION && p2PaddleY >=0) {
        p2PaddleY = coercePaddle(p2PaddleY - PADDLE_STEP)
    } else if (p2Action === DOWN_ACTION) {
        p2PaddleY = coercePaddle(p2PaddleY + PADDLE_STEP);
    }
}

//ball bounces off the walls
function shouldBounceBallFromTopWall() {
    return ballY < BALL_R && ballDY < 0;
}

function shouldBounceBallFromBottomWall() {
    return ballY + BALL_R > CANVAS_HEIGHT && ballDY > 0;
}

function moveBallByStep() {
    ballX += ballDX;
    ballY += ballDY;
}

function bounceBallFromWall() {
    ballDY = -ballDY;
}

function bounceBallFromPaddle() {
    ballDX = -ballDX;
}

//ball is returning to the middle
function moveBallToStart() {
    ballX = BALL_START_X;
    ballY = BALL_START_Y;
}

function ballIsOutOnTheLeft() {
    return ballX + BALL_R < 0;
}

function ballIsOutOnTheRight() {
    return ballX - BALL_R > CANVAS_WIDTH;
}

//ball bounces off paddles
function isBallOnTheSameHeightAsPaddle (paddleY) {
    return isInBetween(ballY, paddleY, paddleY + PADDLE_HEIGHT);
}

function shouldBounceBallFromLeftPaddle() {
    return ballDX < 0 && isInBetween(ballX - BALL_R, PADDLE_P1_X, PADDLE_P1_X + PADDLE_WIDTH) && isBallOnTheSameHeightAsPaddle(p1PaddleY);
}

function shouldBounceBallFromRightPaddle () {
    return ballDX > 0 && isInBetween(ballX + BALL_R, PADDLE_P2_X, PADDLE_P2_X + PADDLE_WIDTH) && isBallOnTheSameHeightAsPaddle(p2PaddleY);
}

//ball movement

function moveBall() {
    if (shouldBounceBallFromTopWall() || shouldBounceBallFromBottomWall()) {
        bounceBallFromWall();
    }
    if (shouldBounceBallFromLeftPaddle() || shouldBounceBallFromRightPaddle()) {
        bounceBallFromPaddle();
    }
    if (ballIsOutOnTheLeft()) {
        moveBallToStart();
        p2Points++;
    } else if (ballIsOutOnTheRight()) {
        moveBallToStart();
        p1Points++;
    }

    moveBallByStep();
}

function updateState() {
    moveBall();
    movePaddles();
}

function drawState() {
    clearCanvas();
    drawPoints(p1Points.toString(), BOARD_P1_X);
    drawPoints(p2Points.toString(), BOARD_P2_X);
    drawBall(ballX, ballY);
    drawPaddle(PADDLE_P1_X, p1PaddleY);
    drawPaddle(PADDLE_P2_X, p2PaddleY);
}

function updateAndDrawState() {
    if (paused) return;
    updateState();
    drawState();
}

setInterval(updateAndDrawState, STATE_CHANGE_INTERVAL);