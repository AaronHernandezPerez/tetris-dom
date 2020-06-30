document.addEventListener("DOMContentLoaded", () => {
  const Grid = document.getElementById("grid");
  const RowWidth = 10;
  const NextGrid = document.getElementById("next-grid");
  const NextWidth = 4;

  const FrozenClass = "frozen";
  const InvisibleClass = "invisible";
  const TetrominoClass = "tetromino";

  const HammerBody = new Hammer(document.body);
  HammerBody.get("swipe").set({ direction: Hammer.DIRECTION_ALL });
  HammerBody.get("pan").set({ threshold: 15, direction: Hammer.DIRECTION_ALL });

  for (let i = 0; i < RowWidth * 2; i++) {
    const element = document.createElement("div");
    element.classList.add(InvisibleClass);
    Grid.appendChild(element);
  }

  for (let i = 0; i < RowWidth * 20; i++) {
    Grid.appendChild(document.createElement("div"));
  }

  for (let i = 0; i < NextWidth * 4; i++) {
    NextGrid.appendChild(document.createElement("div"));
  }

  let tetrisSquares = Array.from(document.querySelectorAll("#grid div"));
  window.tetrisSquares = tetrisSquares;
  let nextSquares = Array.from(document.querySelectorAll("#next-grid div"));
  const LevelDisplay = document.getElementById("level");
  const LinesDisplay = document.getElementById("lines");
  const ScoreDisplay = document.getElementById("score");
  const RotateBtn = document.getElementById("rotate");
  const LeftBtn = document.getElementById("left");
  const DownBtn = document.getElementById("down");
  const RightBtn = document.getElementById("right");
  const StartBtn = document.getElementById("start-button");
  const Restart = document.getElementById("restart");
  const VibrationBtn = document.getElementById("vibration");
  const ScoreTable = [40, 100, 300, 1200];
  const NessFramerate = 60.0988;

  const DownOffset = RowWidth;
  const LeftOffset = -1;
  const RightOffset = 1;

  // Variables
  let timeToNextFrame = null;

  let completedLevels = 0;
  let completedLines = 0;
  let currentTetromio;
  let currentTetrominoIndex;
  let currentTetromioPosition = 0;
  let currentPosition = 4;
  let score = 0;
  let pause = false;
  let ended = false;
  let timer = null;
  let vibration = true;

  // Order in the display of 10*20
  // Position relative to a square of 4x4
  const tTetromino = {
    rowOffset: 0,
    positions: [
      [RowWidth * 2 + 1, RowWidth * 2 + 2, RowWidth * 2 + 3, RowWidth * 3 + 2],
      [RowWidth + 2, RowWidth * 2 + 2, RowWidth * 2 + 3, RowWidth * 3 + 2],
      [RowWidth + 2, RowWidth * 2 + 1, RowWidth * 2 + 2, RowWidth * 2 + 3],
      [RowWidth + 2, RowWidth * 2 + 1, RowWidth * 2 + 2, RowWidth * 3 + 2],
    ],
  };

  const jTetromino = {
    rowOffset: 0,
    positions: [
      [RowWidth * 2 + 1, RowWidth * 2 + 2, RowWidth * 2 + 3, RowWidth * 3 + 3],
      [RowWidth + 2, RowWidth + 3, RowWidth * 2 + 2, RowWidth * 3 + 2],
      [RowWidth + 1, RowWidth * 2 + 1, RowWidth * 2 + 2, RowWidth * 2 + 3],
      [RowWidth + 2, RowWidth * 2 + 2, RowWidth * 3 + 1, RowWidth * 3 + 2],
    ],
  };

  const zTetromino = {
    rowOffset: 1,
    positions: [
      [RowWidth + 1, RowWidth + 2, RowWidth * 2 + 2, RowWidth * 2 + 3],
      [RowWidth + 3, RowWidth * 2 + 2, RowWidth * 2 + 3, RowWidth * 3 + 2],
    ],
  };

  const oTetromino = {
    rowOffset: 0,
    positions: [[RowWidth * 2 + 1, RowWidth * 2 + 2, RowWidth * 3 + 1, RowWidth * 3 + 2]],
  };

  const sTetromino = {
    rowOffset: 1,
    positions: [
      [RowWidth + 2, RowWidth + 3, RowWidth * 2 + 1, RowWidth * 2 + 2],
      [RowWidth + 2, RowWidth * 2 + 2, RowWidth * 2 + 3, RowWidth * 3 + 3],
    ],
  };

  const lTetromino = {
    rowOffset: 0,
    positions: [
      [RowWidth * 2 + 1, RowWidth * 2 + 2, RowWidth * 2 + 3, RowWidth * 3 + 1],
      [RowWidth + 2, RowWidth * 2 + 2, RowWidth * 3 + 2, RowWidth * 3 + 3],
      [RowWidth + 3, RowWidth * 2 + 1, RowWidth * 2 + 2, RowWidth * 2 + 3],
      [RowWidth + 1, RowWidth + 2, RowWidth * 2 + 2, RowWidth * 3 + 2],
    ],
  };

  const iTetromino = {
    rowOffset: 0,
    positions: [
      [RowWidth * 2, RowWidth * 2 + 1, RowWidth * 2 + 2, RowWidth * 2 + 3],
      [2, RowWidth + 2, RowWidth * 2 + 2, RowWidth * 3 + 2],
    ],
  };

  const TheTetrominoes = [tTetromino, jTetromino, zTetromino, oTetromino, sTetromino, lTetromino, iTetromino];

  let nextTetrominoIndex = getRandomTetrominoe();

  // Functions
  function getRandomTetrominoe() {
    let random = Math.floor(Math.random() * TheTetrominoes.length + 1);

    // Classic tetris random piece
    if (random === currentTetrominoIndex || random == TheTetrominoes.length) {
      random = Math.floor(Math.random() * TheTetrominoes.length);
    }

    return random;
  }

  function draw() {
    currentTetromio.forEach((index) => {
      if (currentPosition + index > 0 && currentPosition + index < tetrisSquares.length) {
        tetrisSquares[currentPosition + index].classList.add(TetrominoClass);
      }
    });
  }

  function drawNext() {
    const NextToClean = NextGrid.querySelectorAll(`.${TetrominoClass}`);

    for (let i = 0; i < NextToClean.length; i++) {
      NextToClean[i].classList.remove(TetrominoClass);
    }

    TheTetrominoes[nextTetrominoIndex].positions[0].forEach((index) => {
      if (index >= RowWidth) {
        let rest = index % RowWidth;
        let divider = parseInt(index / RowWidth);
        index = rest + NextWidth * divider;
      }

      nextSquares[index + 0].classList.add(TetrominoClass);
    });
  }

  function undraw() {
    currentTetromio.forEach((index) => {
      if (currentPosition + index > 0 && currentPosition + index < tetrisSquares.length) {
        tetrisSquares[currentPosition + index].classList.remove(TetrominoClass);
      }
    });
  }

  function newTetrominoe() {
    currentTetrominoIndex = nextTetrominoIndex;
    nextTetrominoIndex = getRandomTetrominoe();
    drawNext();
    currentTetromioPosition = 0;
    currentTetromio = TheTetrominoes[currentTetrominoIndex].positions[currentTetromioPosition];
    currentPosition = 3 + RowWidth * TheTetrominoes[currentTetrominoIndex].rowOffset;
  }

  function addScore(points) {
    score += points;
    ScoreDisplay.innerText = score;
  }

  function addLines(lines) {
    completedLines += lines;
    LinesDisplay.innerText = completedLines;
  }

  function addLevel(level = 1) {
    completedLevels += level;
    LevelDisplay.innerText = completedLevels;
    startGameInterval();
  }

  function setLevel() {
    if (completedLines < 10) {
      timeToNextFrame = (1 / NessFramerate) * 48;
    } else if (completedLines === 10) {
      timeToNextFrame = (1 / NessFramerate) * 43;
      addLevel();
    } else if (completedLines === 20) {
      timeToNextFrame = (1 / NessFramerate) * 38;
      addLevel();
    } else if (completedLines === 30) {
      timeToNextFrame = (1 / NessFramerate) * 33;
      addLevel();
    } else if (completedLines === 40) {
      timeToNextFrame = (1 / NessFramerate) * 28;
      addLevel();
    } else if (completedLines === 50) {
      timeToNextFrame = (1 / NessFramerate) * 23;
      addLevel();
    } else if (completedLines === 60) {
      timeToNextFrame = (1 / NessFramerate) * 18;
      addLevel();
    } else if (completedLines === 70) {
      timeToNextFrame = (1 / NessFramerate) * 13;
      addLevel();
    } else if (completedLines === 80) {
      timeToNextFrame = (1 / NessFramerate) * 8;
      addLevel();
    } else if (completedLines === 90) {
      timeToNextFrame = (1 / NessFramerate) * 6;
      addLevel();
    } else if (completedLines === 100) {
      timeToNextFrame = (1 / NessFramerate) * 6;
      addLevel();
    } else if (completedLines === 130) {
      timeToNextFrame = (1 / NessFramerate) * 4;
      addLevel();
    } else if (completedLines === 160) {
      timeToNextFrame = (1 / NessFramerate) * 3;
      addLevel();
    } else if (completedLines === 190) {
      timeToNextFrame = (1 / NessFramerate) * 2;
      addLevel();
    } else if (completedLines === 290) {
      timeToNextFrame = 1 / NessFramerate;
      addLevel();
    } else if (completedLines > 290) {
      addLevel();
    }
  }

  function checkCompletedRow() {
    let lines = -1;

    for (let i = 0; i < tetrisSquares.length; i += RowWidth) {
      let completedRow = true;

      for (let j = 0; j < RowWidth; j++) {
        if (!tetrisSquares[i + j].classList.contains(FrozenClass)) {
          completedRow = false;
          break;
        }
      }

      if (completedRow) {
        // Remove row and add points
        const RemovedRow = tetrisSquares.splice(i, RowWidth);
        const FirstCell = Grid.querySelector(`div:not(.${InvisibleClass})`);

        RemovedRow.forEach((cell) => {
          cell.classList.remove(FrozenClass);
          FirstCell.before(cell);
          tetrisSquares.splice(tetrisSquares.indexOf(FirstCell), 0, cell);
        });
        lines++;
        addLines(1);
        setLevel();
      }
    }

    if (lines >= 0) {
      addScore(ScoreTable[lines]);
    }
  }

  function nextFrame() {
    undraw();

    if (checkCollision()) {
      // next tetromino
      currentTetromio.forEach((index) => tetrisSquares[currentPosition + index].classList.add(FrozenClass));
      checkCompletedRow();
      newTetrominoe();

      if (currentTetromio.some((pos) => tetrisSquares[currentPosition + pos].classList.contains(FrozenClass))) {
        finishGame();
        Grid.classList.add("lost");
      }
    } else {
      currentPosition += RowWidth;
    }

    draw();
  }

  function updatePosition(pos = DownOffset) {
    if (!checkCollision(pos)) {
      undraw();
      currentPosition += pos;
      draw();
      vibrate();
    }
  }

  // Returns true if there isa collision
  function checkCollision(offset = RowWidth, tetromio = currentTetromio) {
    return tetromio.some(
      (pos) => currentPosition + pos + offset >= tetrisSquares.length || tetrisSquares[currentPosition + pos + offset].classList.contains(FrozenClass)
    );
  }

  function finishGame() {
    clearInterval(timer);
    ended = true;
  }

  function nextPosition(position = currentTetromioPosition) {
    return position + 1 >= TheTetrominoes[currentTetrominoIndex].positions.length ? 0 : position + 1;
  }

  function rotatePosition() {
    // We check all positions untill one fit, if no one fits continue
    let position = currentTetromioPosition;
    do {
      position = nextPosition(position);
      const checkedTetromino = TheTetrominoes[currentTetrominoIndex].positions[position];
      if (!checkCollision(0, checkedTetromino)) {
        if (canMoveLeft(checkedTetromino) || canMoveRight(checkedTetromino)) {
          undraw();
          currentTetromioPosition = position;
          currentTetromio = TheTetrominoes[currentTetrominoIndex].positions[currentTetromioPosition];
          draw();
          vibrate();
        }
      }
    } while (position !== currentTetromioPosition);
  }

  function canMoveLeft(tetromino = currentTetromio) {
    return !tetromino.some((pos) => (currentPosition + pos) % RowWidth === 0);
  }

  function moveLeft() {
    if (canMoveLeft()) {
      updatePosition(LeftOffset);
    }
  }

  function canMoveRight(tetromino = currentTetromio) {
    return !tetromino.some((pos) => (currentPosition + pos) % RowWidth == RowWidth - 1);
  }

  function moveRight() {
    if (canMoveRight()) {
      updatePosition(RightOffset);
    }
  }

  function restartGame() {
    // Clearing grid
    tetrisSquares.forEach((cell) => {
      cell.classList.remove(TetrominoClass);
      cell.classList.remove(FrozenClass);
    });
    Grid.classList.remove("lost");

    ended = false;
    completedLevels = 0;
    score = 0;
    completedLines = 0;

    clearInterval(timer);
    startGame();
  }

  function vibrate() {
    if (vibration) {
      try {
        navigator.vibrate(15);
      } catch (error) {}
    }
  }

  function togglePause() {
    pause = !pause;
  }

  function keyAction(event) {
    if (!pause) {
      if (!ended) {
        switch (event.key) {
          case "ArrowUp":
            rotatePosition();
            break;
          case "ArrowDown":
            updatePosition();
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
      } else {
        restartGame();
      }
    }
  }

  function setClickEvents(element, funct) {
    element.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
    var hm = new Hammer(element);
    let holdFlag;

    function clearHold() {
      if (holdFlag) clearInterval(holdFlag);
    }

    hm.on("tap", () => {
      funct();
    });

    hm.on("press", () => {
      clearHold();

      holdFlag = setInterval(() => {
        funct();
      }, 50);
    });

    hm.on("pressup", () => {
      clearHold();
    });

    hm.on("panend panstart", () => {
      clearHold();
    });
  }

  let panData;
  const PanThreshold = 40;
  const PanUpThreshold = 80;

  function clearPan() {
    panData = { deltaX: 0, deltaY: 0 };
  }

  clearPan();

  function mapPan(event) {
    switch (event.additionalEvent) {
      case "panleft":
        if (event.deltaX < panData.deltaX - PanThreshold) {
          keyAction({ key: "ArrowLeft" });
          panData.deltaX = event.deltaX;
        }
        break;
      case "panright":
        if (event.deltaX > panData.deltaX + PanThreshold) {
          keyAction({ key: "ArrowRight" });
          panData.deltaX = event.deltaX;
        }
        break;
      case "panup":
        if (event.deltaY < panData.deltaY - PanUpThreshold) {
          keyAction({ key: "ArrowUp" });
          panData.deltaY = event.deltaY;
        }
        break;
      case "pandown":
        if (event.deltaY > panData.deltaY + PanThreshold) {
          keyAction({ key: "ArrowDown" });
          panData.deltaY = event.deltaY;
        }
        break;

      default:
        break;
    }
  }

  function startGameInterval(interval = timeToNextFrame) {
    if (timer) clearInterval(timer);
    // Move piece
    timer = setInterval(() => {
      if (!pause) {
        nextFrame();
      }
    }, interval * 1000);
  }

  function startGame() {
    addLevel(0);
    addScore(0);
    addLines(0);

    newTetrominoe();
    draw();
    setLevel();
    startGameInterval();
  }

  // Events
  StartBtn.addEventListener("click", togglePause);
  Restart.addEventListener("click", restartGame);
  VibrationBtn.addEventListener("change", () => {
    vibration = VibrationBtn.checked;
  });

  // Control Events
  window.addEventListener("keydown", keyAction);
  setClickEvents(RotateBtn, () => {
    keyAction({ key: "ArrowUp" });
  });
  setClickEvents(LeftBtn, () => {
    keyAction({ key: "ArrowLeft" });
  });
  setClickEvents(DownBtn, () => {
    keyAction({ key: "ArrowDown" });
  });
  setClickEvents(RightBtn, () => {
    keyAction({ key: "ArrowRight" });
  });

  // Gestures events
  HammerBody.on("pan", mapPan);
  HammerBody.on("panend panstart", clearPan);

  // setPanEvents(
  //   "panup",
  //   "y",
  //   () => {
  //     mapKeys({ key: "ArrowUp" });
  //   },
  //   80
  // );
  // setPanEvents("panleft", "x", () => {
  //   mapKeys({ key: "ArrowLeft" });
  // });
  // setPanEvents("pandown", "y", () => {
  //   mapKeys({ key: "ArrowDown" });
  // });
  // setPanEvents("panright", "x", () => {
  //   mapKeys({ key: "ArrowRight" });
  // });

  // Starting game!
  startGame();
});
