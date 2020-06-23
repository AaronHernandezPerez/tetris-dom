document.addEventListener("DOMContentLoaded", () => {
  const Grid = document.getElementById("grid");

  for (let i = 0; i < 200; i++) {
    Grid.appendChild(document.createElement("div"));
  }

  let squares = Array.from(document.querySelectorAll("#grid div"));
  const ScoreDisplay = document.getElementById("score");
  const StartBtn = document.getElementById("start-button");
  const RowWidth = 10;
  const FrozenClass = "frozen";

  let randomTetromino;
  let currentTetromio;
  let currentTetromioPosition = 0;
  let currentPosition = 4;
  let score = 0;

  // Order in the display of 10*20
  // Position relative to currentPosition
  const lTetromino = [
    [1, RowWidth + 1, RowWidth * 2 + 1, 2],
    [RowWidth, RowWidth + 1, RowWidth + 2, RowWidth * 2 + 2],
    [1, RowWidth + 1, RowWidth * 2 + 1, RowWidth * 2],
    [RowWidth, RowWidth * 2, RowWidth * 2 + 1, RowWidth * 2 + 2],
  ];

  const zTetromino = [
    [0, RowWidth, RowWidth + 1, RowWidth * 2 + 1],
    [RowWidth + 1, RowWidth + 2, RowWidth * 2, RowWidth * 2 + 1],
    [0, RowWidth, RowWidth + 1, RowWidth * 2 + 1],
    [RowWidth + 1, RowWidth + 2, RowWidth * 2, RowWidth * 2 + 1],
  ];

  const tTetromino = [
    [1, RowWidth, RowWidth + 1, RowWidth + 2],
    [1, RowWidth + 1, RowWidth + 2, RowWidth * 2 + 1],
    [RowWidth, RowWidth + 1, RowWidth + 2, RowWidth * 2 + 1],
    [1, RowWidth, RowWidth + 1, RowWidth * 2 + 1],
  ];

  const oTetromino = [
    [0, 1, RowWidth, RowWidth + 1],
    [0, 1, RowWidth, RowWidth + 1],
    [0, 1, RowWidth, RowWidth + 1],
    [0, 1, RowWidth, RowWidth + 1],
  ];

  const iTetromino = [
    [1, RowWidth + 1, RowWidth * 2 + 1, RowWidth * 3 + 1],
    [RowWidth, RowWidth + 1, RowWidth + 2, RowWidth + 3],
    [1, RowWidth + 1, RowWidth * 2 + 1, RowWidth * 3 + 1],
    [RowWidth, RowWidth + 1, RowWidth + 2, RowWidth + 3],
  ];

  const TheTetrominoes = [
    lTetromino,
    zTetromino,
    tTetromino,
    oTetromino,
    iTetromino,
  ];

  // Functions
  function getRandomTetrominoe() {
    return Math.floor(Math.random() * TheTetrominoes.length);
  }

  function draw() {
    currentTetromio.forEach((index) => {
      squares[currentPosition + index].classList.add("tetromino");
    });
  }

  function undraw() {
    currentTetromio.forEach((index) => {
      squares[currentPosition + index].classList.remove("tetromino");
    });
  }

  function newTetrominoe() {
    randomTetromino = getRandomTetrominoe();
    currentTetromio = TheTetrominoes[randomTetromino][0];
    currentPosition = 4;
  }

  function moveDown() {
    undraw();
    if (checkCollision()) {
      // next tetromino
      currentTetromio.forEach((index) =>
        squares[currentPosition + index].classList.add(FrozenClass)
      );
      newTetrominoe();
      if (
        currentTetromio.some((pos) =>
          squares[currentPosition + pos].classList.contains(FrozenClass)
        )
      ) {
        finishGame();
        Grid.classList.add("lost");
      }
    } else {
      currentPosition += RowWidth;
    }
    draw();
  }

  function updatePosition(pos) {
    if (!checkCollision(pos)) {
      undraw();
      currentPosition += pos;
      draw();
    }
  }

  // Returns true if there isa collision
  function checkCollision(offset = RowWidth, tetromio = currentTetromio) {
    return tetromio.some(
      (pos) =>
        currentPosition + pos + offset >= squares.length ||
        squares[currentPosition + pos + offset].classList.contains(FrozenClass)
    );
  }

  function finishGame() {
    clearInterval(timer);
    window.removeEventListener("keydown", mapKeys);
  }

  const DownOffset = RowWidth;
  const LeftOffset = -1;
  const RightOffset = 1;

  function rotatePosition() {
    undraw();
    currentTetromioPosition =
      ++currentTetromioPosition >= TheTetrominoes[randomTetromino].length
        ? 0
        : currentTetromioPosition;
    currentTetromio = TheTetrominoes[randomTetromino][currentTetromioPosition];
    draw();
  }

  function mapKeys(event) {
    switch (event.key) {
      case "ArrowUp":
        rotatePosition();
        break;
      case "ArrowDown":
        updatePosition(DownOffset);
        break;
      case "ArrowLeft":
        if (
          !currentTetromio.some(
            (pos) => (currentPosition + pos) % RowWidth === 0
          )
        ) {
          updatePosition(LeftOffset);
        }
        break;
      case "ArrowRight":
        if (
          !currentTetromio.some(
            (pos) => (currentPosition + pos) % RowWidth == RowWidth - 1
          )
        ) {
          updatePosition(RightOffset);
        }
        break;

      default:
        break;
    }
  }

  function startGame() {
    newTetrominoe();
    draw();

    window.addEventListener("keydown", mapKeys);
  }

  // Game script
  startGame();

  // Move piece
  let timer = setInterval(() => {
    moveDown();
  }, 1000);
});
