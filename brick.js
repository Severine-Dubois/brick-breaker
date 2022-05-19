const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
let score = 0;

let interval;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

//* Ball
// We define a x and y position for arc method
let x = canvas.width/2;
let y = canvas.height-30;

// dx and dy will be used to define new values for x and y 
// at the end of the draw method
// (change the direction and the speed)
let dx = 3;
let dy = -3;

// define the radius of the ball
let ballRadius = 10;

//* Paddle
let paddleHeight = 10;
let paddleWidth = 75;
let paddleX = (canvas.width-paddleWidth)/2; // entry point on X axis

// keys state, by default it's false
let rightPressed = false;
let leftPressed = false;

//* Bricks
let brickRowCount = 3;
let brickColumnCount = 5;
let brickWidth = 75;
let brickHeight = 20;
let brickPadding = 10;
let brickOffsetTop = 30;
let brickOffsetLeft = 30;

// let's create an array which contains the number of colums and arrows for the bricks
let bricks = [];

// each column in the array will contain a number of rows
for(let columns=0; columns<brickColumnCount; columns++) {
    bricks[columns] = [];
    for(let rows=0; rows<brickRowCount; rows++) {
        bricks[columns][rows] = { x: 0, y: 0, status: 1 };
        // rows contain an object defined by a x and y position
        // status 1 = brick displayed
    }
}

//* lives 
let lives = 2;

//* Restart the game
const submit = document.querySelector('.refresh-button');
submit.addEventListener("click", tryAgainHandler);

function tryAgainHandler() {
    document.location.reload();  
}

//* Move the paddle with keyboard

function keyDownHandler(event) {
    if(event.key == "Right" || event.key == "ArrowRight") {
        rightPressed = true;
    } else if (event.key == "Left" || event.key == "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(event) {
    if(event.key == "Right" || event.key == "ArrowRight") {
        rightPressed = false;
    } else if (event.key == "Left" || event.key == "ArrowLeft") {
        leftPressed = false;
    }
}

//* Move the paddle with mouse

// event.clientX = horizontal position of the mouse

function mouseMoveHandler(event) {
    //console.log(canvas.offsetLeft);
    //console.log(event.clientX);
    let relativeX = event.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth;
        //console.log(relativeX);
    } 
    if (relativeX < paddleWidth) {
        // console.log("souris : " + relativeX);
        // console.log(paddleWidth);
        paddleX = 0;
    }
}

//* give lifes to the player
function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Lives: "+lives, canvas.width-65, 20);
}

let result = false;

function collisionDetection() {

    for(let columns=0; columns<brickColumnCount; columns++) {
        for(let rows=0; rows<brickRowCount; rows++) {
            let b = bricks[columns][rows];
            if(b.status == 1) {
                if (x > b.x && x < b.x+brickWidth && y > b.y && y < b.y+brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;

                    if(score == brickRowCount*brickColumnCount) {
                       return result = true;
                    }
                }
            }
        }
    }
}

function drawBall() {
    // code for drawing the ball
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = "chartreuse";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    // code for drawing the paddle
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.closePath();
}

// for each iteration, we create a new brick
// but we need to define a different x/y position
// otherwise all bricks will be superposated
function drawBricks() {
    for(let columns=0; columns<brickColumnCount; columns++) {
        for(let rows=0; rows<brickRowCount; rows++) {
            if(bricks[columns][rows].status == 1) {
            let brickX = (columns*(brickWidth+brickPadding))+brickOffsetLeft;
            let brickY = (rows*(brickHeight+brickPadding))+brickOffsetTop;

            bricks[columns][rows].x = brickX;
            bricks[columns][rows].y = brickY;
            ctx.beginPath();
            ctx.rect(brickX, brickY, brickWidth, brickHeight);
            ctx.fillStyle = "purple";
            ctx.fill();
            ctx.closePath();
            }
        }
    }
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: "+score, 8, 20);
}

function draw() {

    // if we want to clear what the canvas contains at each frame :
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // then we draw the ball again
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();

    if(rightPressed) {
        paddleX += 5;

        //! we don't want the paddle outside of the canvas
        if (paddleX + paddleWidth > canvas.width){
            paddleX = canvas.width - paddleWidth;
        }

        }
    else if(leftPressed) {
        paddleX -= 5;

        if (paddleX < 0) {
            paddleX = 0; 
        }
    }
    

    //* Bouncing ball !

    // at each frame, we check if the ball touches the border of the canvas. (upper and lower border via y and dy coordinates)
    // If it's true then it bounces from the "wall" and goes to the opposite direction 

    // upper border : y will be at 0
    // lower border : y will at the canvas height

    //! We need to consider the ballRadius, otherwise the collision is triggered when the CENTER of the ball touch one border
    //! so we replace "< 0" by ballRadius and we substract the height/width
    //! with the ballRadius value

    if(y + dy < ballRadius) {
        // console.log(y + dy);
        dy = -dy;
        
    } else if (y + dy > canvas.height - ballRadius) {
        
        if(x > paddleX && x < paddleX + paddleWidth) {
            // if the position of the ball on the x axis corresponding to the paddle, then it bounces
            // (more exactly, we check if the center of the ball is between left and right border of the paddle)
            dy = -dy;
        }
        else {
            lives--;
            if(lives == 0) {
            // otherwise game over if the ball touches the lower border and no more live
                const gameOver = document.querySelector("#game_over");
                gameOver.classList.replace("no-display", "display");
                const message = gameOver.querySelector(".message");
                message.textContent = "You lose !";
                cancelAnimationFrame(draw);
                return;
            //clearInterval(interval); // Needed for Chrome to end game
            } else {
                x = canvas.width/2;
                y = canvas.height-30;
                dx = 3;
                dy = -3;
                paddleX = (canvas.width-paddleWidth)/2;
            }
        }
    }

    if (result == true) {
        const gameOver = document.querySelector("#game_over");
        gameOver.classList.replace("no-display", "display");
        const message = gameOver.querySelector(".message");
        message.textContent = "You win !";
        cancelAnimationFrame(draw);
        return;
        //clearInterval(interval); // Needed for Chrome to end game

    }

    // left border : x will be at 0
    // right border : x will at the canvas width

    if (x + dx < ballRadius || x + dx > canvas.width - ballRadius) {
        //console.log(x + dx);
        dx = -dx;
        //ctx.fillStyle = "blue";
    }
    
    // redfine x and y position
    x += dx;
    y += dy;

    requestAnimationFrame(draw);

}

//interval = setInterval(draw, 10);
//alternative to replace setInterval : requestAnimationFrame();

const start = document.querySelector(".start");
start.addEventListener('click', startGameHandle);

function displayGame() {
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
}

displayGame();

function startGameHandle() {
    //console.log(start);
    draw();
    start.style.display= 'none';
}
// draw function wiil be called each x miliseconds
// it will affect the "speed" of the ball




