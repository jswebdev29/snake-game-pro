let clrs = ['black', 'lightgreen']
let clrs2 = ['darkred', 'brown']
let clrs3 = ['black', 'darkred']
let clrs4 = ['rgb(156, 92, 92']
let i = 0;
function clrthis() {
    document.getElementById('head').style.color = clrs[i];
    document.getElementById('head').style.borderColor = clrs2[i];
    i++;
    if (i > 1) {
        i = 0;
    }
}
myTimeout = setInterval(clrthis, 200);


//POPUP HANDLING------------------------------------------------------------------------
function welcomeMessage() {
    document.getElementById("welcomePopup").style.visibility = "visible";
    draw();   // 👈 draw canvas on first page load
}

function closePopup() {
    document.getElementById("welcomePopup").style.visibility = "hidden";
}

function showGameOver() {
    document.getElementById("finalScore").innerText = score;
    document.getElementById("finalHighScore").innerText = highScore;
    document.getElementById("gameOverPopup").style.visibility = "visible";
}

function restartGame() {
    document.getElementById("gameOverPopup").style.visibility = "hidden";
}

//SOUND ELEMENTS -------------------------------------------------------------------------
const bgMusic = document.getElementById("bgMusic");
const eatSound = document.getElementById("eatSound");
const gameOverSound = document.getElementById("gameOverSound");
const clickSound = document.getElementById("clickSound");
clickSound.volume = 0.5;  // 0.0 = mute | 1.0 = loud


let firstInteraction = false;

// 🔊 Allow autoplay after FIRST click (Mobile restriction)
function enableAudio() {
    if (!firstInteraction) {
        firstInteraction = true;
        bgMusic.volume = 0.2;
        // 0.1 = very slow / very soft ,0.5 = medium, 1.0 = loud
        bgMusic.play().catch(() => { });
    }
}
document.body.addEventListener("click", enableAudio);
document.body.addEventListener("touchstart", enableAudio);
document.body.addEventListener("keydown", enableAudio);

// 🔊 Play click sound for buttons
function playClick() {
    clickSound.currentTime = 0;
    clickSound.play();
}



//SPEED CONTROL ---------------------------------------------------------------------------
let currentSpeed = 150;
let gameInterval;

// Change speed using buttons
function setSpeed(speed, label) {
    currentSpeed = speed;
    document.getElementById("speedSlider").value = speed;
    updateSpeedLabel(label, speed);

    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, currentSpeed);
}

// Change speed using slider
function sliderSpeed(value) {
    currentSpeed = Number(value);

    let label;
    if (value >= 220) label = "Slow";
    else if (value >= 120) label = "Normal";
    else if (value >= 70) label = "Fast";
    else label = "Custom";

    updateSpeedLabel(label, value);

    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, currentSpeed);
}

// Update text label
function updateSpeedLabel(label, speed) {
    document.getElementById("speedLabel").innerText =
        `Current Speed: ${label} (${speed}ms)`;
}


//  GAME ENGINE--------------------------------------------------------------------------
let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');

let gridSize = 16;
let canvasSize = 512;
let tileCount = canvasSize / gridSize;

const tileCountX = Math.floor(canvas.width / gridSize);
const tileCountY = Math.floor(canvas.height / gridSize);

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let score = 0;



document.addEventListener('keydown', changeDirection);


let isPaused = false;
let gameRunning = true;
function pauseResumeGame() {
    const btn = document.getElementById("pauseBtn");

    if (!isPaused) {
        // Pause
        gameRunning = false;
        isPaused = true;
        btn.innerHTML = '<i class="fa fa-play"></i>'; // resume icon   
    } else {
        // Resume
        gameRunning = true;
        isPaused = false;
        btn.innerHTML = '<i class="fa fa-pause"></i>'; // pause icon
    }
}


//  START GAME FIXED---------------------------------------------------------------------
function strtbt1this() {
    // FULL RESET
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 1;
    score = 0;
    document.getElementById('scr1').value = score;
    placeFood();

    gameRunning = true;
    isPaused = false;
    document.getElementById("pauseBtn").innerHTML = '<i class="fa fa-pause"></i> <i class="fa fa-play"></i>';

    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, currentSpeed);
}


// ------------------------------------------------------------------------
function gameLoop() {
    if (!gameRunning) return;   // ⬅ Stop running when paused

    update();
    draw();
}

function update() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wall collision
    if (
        head.x < 0 || head.x >= tileCountX ||
        head.y < 0 || head.y >= tileCountY
    ) {
        resetGame();
        return;
    }

    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            resetGame();
            return;
        }
    }

    snake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
        eatSound.currentTime = 0;
        eatSound.play();

        score++;
        document.getElementById('scr1').value = score;
        updateHighScore();
        placeFood();
    }
    else {
        snake.pop();
    }
}

// HIGH SCORE SYSTEM-------------------------------------------------------------------
// Load high score from localStorage
let highScore = localStorage.getItem("snakeHighScore") || 0;
document.getElementById('scr2').value = highScore;

// Update high score when score increases
function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("snakeHighScore", highScore);
        document.getElementById('scr2').value = highScore;
    }
}

//  DRAW CANVAS (fixed)--------------------------------------------------------------------
let waveOffset = 0;

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // === GRID BACKGROUND ===
    // ctx.strokeStyle = "rgba(0,255,0,0.15)";
    // ctx.lineWidth = 1;
    // for (let x = 0; x < canvasSize; x += gridSize) {
    //     ctx.beginPath();
    //     ctx.moveTo(x, 0);
    //     ctx.lineTo(x, canvasSize);
    //     ctx.stroke();
    // }
    // for (let y = 0; y < canvasSize; y += gridSize) {
    //     ctx.beginPath();
    //     ctx.moveTo(0, y);
    //     ctx.lineTo(canvasSize, y);
    //     ctx.lineTo(canvasSize, y);
    //     ctx.stroke();
    // }
    // --------------------------------------------------------------
    waveOffset += 2.25;

    for (let i = 0; i < snake.length; i++) {
        let segment = snake[i];

        // Wave movement
        let wiggleX = Math.sin((i + waveOffset) / 3) * 1.2;
        let wiggleY = Math.cos((i + waveOffset) / 3) * 1.2;

        let drawX = segment.x * gridSize + wiggleX;
        let drawY = segment.y * gridSize + wiggleY;


        // BODY gradient
        let grad = ctx.createLinearGradient(drawX, drawY, drawX, drawY + gridSize);
        grad.addColorStop(0, "#00ff66");
        grad.addColorStop(1, "#006622");
        ctx.fillStyle = grad;

        // Nokia style STRETCH effect
        let stretch = 2;

        ctx.beginPath();
        ctx.roundRect(
            drawX - stretch,
            drawY - stretch,
            gridSize + stretch * 2,
            gridSize + stretch * 2,
            5
        );
        ctx.fill();

        // Skin scale texture
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.beginPath();
        ctx.arc(drawX + gridSize / 2, drawY + gridSize / 2, 3, 0, Math.PI * 2);
        ctx.fill();

        // HEAD
        if (i === 0) {
            ctx.fillStyle = "#00ff99";
            ctx.beginPath();
            ctx.roundRect(drawX, drawY, gridSize, gridSize, 6);
            ctx.fill();

            // Eyes
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(drawX + gridSize * 0.25, drawY + gridSize * 0.3, 2.5, 0, Math.PI * 2);
            ctx.arc(drawX + gridSize * 0.75, drawY + gridSize * 0.3, 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(drawX + gridSize * 0.25, drawY + gridSize * 0.3, 1, 0, Math.PI * 2);
            ctx.arc(drawX + gridSize * 0.75, drawY + gridSize * 0.3, 1, 0, Math.PI * 2);
            ctx.fill();
        }

        // TAIL
        if (i === snake.length - 1) {
            ctx.fillStyle = "#004d26";
            ctx.beginPath();
            ctx.moveTo(drawX + gridSize / 2, drawY + gridSize);
            ctx.lineTo(drawX, drawY + gridSize / 2);
            ctx.lineTo(drawX + gridSize, drawY + gridSize / 2);
            ctx.closePath();
            ctx.fill();
        }
    }

    // Draw animated circular food
    let pulse = Math.sin(Date.now() / 150) * 3 + (gridSize / 2);

    ctx.fillStyle = "#ff4444"; // red
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        pulse / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Add glowing effect
    ctx.strokeStyle = "#f00";
    ctx.lineWidth = 8;
    ctx.stroke();

}


function changeDirection(event) {
    playClick();  // 🔊 play click sound on arrow key

    switch (event.key) {
        case 'ArrowUp':
            if (dy === 0) {
                dx = 0;
                dy = -1;
            }
            break;

        case 'ArrowDown':
            if (dy === 0) {
                dx = 0;
                dy = 1;
            }
            break;

        case 'ArrowLeft':
            if (dx === 0) {
                dx = -1;
                dy = 0;
            }
            break;

        case 'ArrowRight':
            if (dx === 0) {
                dx = 1;
                dy = 0;
            }
            break;
    }
}

// -----------------------------------------------

function setDirection(direction) {
    playClick();
    switch (direction) {
        case 'up':
            if (dy === 0) {
                dx = 0;
                dy = -1;
            }
            break;
        case 'down':
            if (dy === 0) {
                dx = 0;
                dy = 1;
            }
            break;
        case 'left':
            if (dx === 0) {
                dx = -1;
                dy = 0;
            }
            break;
        case 'right':
            if (dx === 0) {
                dx = 1;
                dy = 0;
            }
            break;
    }
}


function placeFood() {
    food.x = Math.floor(Math.random() * tileCountX);
    food.y = Math.floor(Math.random() * tileCountY);
}


function resetGame() {
    gameRunning = false;

    // 🔊 Play game-over sound
    gameOverSound.currentTime = 0;
    gameOverSound.play();

    showGameOver();

    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;

    clearInterval(gameInterval);
}
