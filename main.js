document.addEventListener("DOMContentLoaded", () => {
  const Grid = document.getElementById("grid");
  const RowWidth = 10;
  const NextGrid = document.getElementById("next-grid");
  const NextWidth = 4;

  for (let i = 0; i < RowWidth * 20; i++) {
    Grid.appendChild(document.createElement("div"));
  }

  for (let i = 0; i < NextWidth * NextWidth; i++) {
    NextGrid.appendChild(document.createElement("div"));
  }

  let tetrisSquares = Array.from(document.querySelectorAll("#grid div"));
  let nextSquares = Array.from(document.querySelectorAll("#next-grid div"));
  const ScoreDisplay = document.getElementById("score");
  const StartBtn = document.getElementById("start-button");
  const FrozenClass = "frozen";

  const DownOffset = RowWidth;
  const LeftOffset = -1;
  const RightOffset = 1;

  let currentTetromio;
  let currentTetrominoIndex;
  let currentTetromioPosition = 0;
  let currentPosition = 4;
  let score = 0;

  // Order in the display of 10*20
  // Position relative to currentPosition
  const jTetromino = [
    [1, 2, 3, RowWidth + 3],
    [2, RowWidth + 2, RowWidth * 2 + 2, 3],
    [1, RowWidth + 1, RowWidth + 2, RowWidth + 3],
    [2, RowWidth + 2, RowWidth * 2 + 2, RowWidth * 2 + 1],
  ];

  const lTetromino = [];

  const sTetromino = [
    [2, 3, RowWidth + 1, RowWidth + 2],
    [2, RowWidth + 2, RowWidth + 3, RowWidth * 2 + 3],
  ];

  const zTetromino = [];

  const tTetromino = [
    [RowWidth + 1, RowWidth + 2, RowWidth + 3, RowWidth * 2 + 2],
    [2, RowWidth + 2, RowWidth + 3, RowWidth * 2 + 2],
    [2, RowWidth + 1, RowWidth + 2, RowWidth + 3],
    [2, RowWidth + 1, RowWidth + 2, RowWidth * 2 + 2],
  ];

  const oTetromino = [[1, 2, RowWidth + 1, RowWidth + 2]];

  const iTetromino = [
    [0, 1, 2, 3],
    [2, RowWidth + 2, RowWidth * 2 + 2, RowWidth * 3 + 2],
  ];

  const TheTetrominoes = [
    // jTetromino,
    // sTetromino,
    // tTetromino,
    // oTetromino,
    iTetromino,
  ];

  let nextTetrominoIndex = getRandomTetrominoe();

  // Functions
  function getRandomTetrominoe() {
    return Math.floor(Math.random() * TheTetrominoes.length);
  }

  function draw() {
    currentTetromio.forEach((index) => {
      tetrisSquares[currentPosition + index].classList.add("tetromino");
    });
  }

  function drawNext() {
    const NextToClean = NextGrid.querySelectorAll(".tetromino");

    for (let i = 0; i < NextToClean.length; i++) {
      NextToClean[i].classList.remove("tetromino");
    }

    TheTetrominoes[nextTetrominoIndex][0].forEach((index) => {
      if (index >= RowWidth) {
        let rest = index % RowWidth;
        let divider = parseInt(index / RowWidth);
        index = rest + NextWidth * divider;
      }
      nextSquares[index + 0].classList.add("tetromino");
    });
  }

  function undraw() {
    currentTetromio.forEach((index) => {
      tetrisSquares[currentPosition + index].classList.remove("tetromino");
    });
  }

  function newTetrominoe() {
    currentTetrominoIndex = nextTetrominoIndex;
    drawNext();
    nextTetrominoIndex = getRandomTetrominoe();
    currentTetromio = TheTetrominoes[currentTetrominoIndex][0];
    currentPosition = 3;
  }

  function checkCompletedRow() {
    for (let i = 0; i < tetrisSquares.length; i += RowWidth) {
      let completedRow = true;

      for (let j = 0; j < RowWidth; j++) {
        if (!tetrisSquares[i + j].classList.contains(FrozenClass)) {
          completedRow = false;
          break;
        }
      }

      if (completedRow) {
        console.log("Completed row!");
      }
    }
  }

  function nextFrame() {
    undraw();
    if (checkCollision()) {
      // next tetromino
      currentTetromio.forEach((index) =>
        tetrisSquares[currentPosition + index].classList.add(FrozenClass)
      );
      checkCompletedRow();
      newTetrominoe();
      if (
        currentTetromio.some((pos) =>
          tetrisSquares[currentPosition + pos].classList.contains(FrozenClass)
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
        currentPosition + pos + offset >= tetrisSquares.length ||
        tetrisSquares[currentPosition + pos + offset].classList.contains(
          FrozenClass
        )
    );
  }

  function finishGame() {
    clearInterval(timer);
    window.removeEventListener("keydown", mapKeys);
  }

  function rotatePosition() {
    undraw();
    currentTetromioPosition =
      ++currentTetromioPosition >= TheTetrominoes[currentTetrominoIndex].length
        ? 0
        : currentTetromioPosition;
    currentTetromio =
      TheTetrominoes[currentTetrominoIndex][currentTetromioPosition];
    draw();
  }

  function moveLeft() {
    if (
      !currentTetromio.some((pos) => (currentPosition + pos) % RowWidth === 0)
    ) {
      updatePosition(LeftOffset);
    }
  }

  function moveRight() {
    if (
      !currentTetromio.some(
        (pos) => (currentPosition + pos) % RowWidth == RowWidth - 1
      )
    ) {
      updatePosition(RightOffset);
    }
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
        moveLeft();
        break;
      case "ArrowRight":
        moveRight();
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
  // let timer = setInterval(() => {
  // nextFrame();
  // }, 100);
});
