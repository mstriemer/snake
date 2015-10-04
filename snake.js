const MAX_FOOD_ATTEMPTS = 5;
const INITIAL_SNAKE_SIZE = 3;
const BOARD_SIZE = 30;
const TILES = {
  EMPTY: 0,
  FOOD: 1,
};
const DIR = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
};
const KEYS = {
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  LEFT: 37,
};

function renderBoard(board) {
  let boardElement = document.createElement('pre');
  let rowText = '';
  for (let row of board) {
    for (let col of row) {
      if (col === TILES.EMPTY) {
        rowText += ' ';
      } else if (col < 0) {
        rowText += '*';
      } else if (col === TILES.FOOD) {
        rowText += '0';
      }
    }
    rowText += '\n';
  }
  boardElement.textContent = rowText;
  return boardElement;
}

function getRandomCoords() {
  return {
    row: parseInt(Math.random() * BOARD_SIZE, 10),
    col: parseInt(Math.random() * BOARD_SIZE, 10),
  }
}

function addFood(board) {
  for (var i = 0; i < MAX_FOOD_ATTEMPTS; i++) {
    let { row, col } = getRandomCoords();
    if (board[row][col] === TILES.EMPTY) {
      board[row][col] = TILES.FOOD;
      return board;
    }
  }
  return board;
}

function initializeBoard() {
  let board = [];
  for (var row=0; row < BOARD_SIZE; row++) {
    board[row] = [];
    for (var col=0; col < BOARD_SIZE; col++) {
      board[row][col] = TILES.EMPTY;
    }
  }

  for (var i=0; i < INITIAL_SNAKE_SIZE; i++) {
    board[BOARD_SIZE / 2][BOARD_SIZE / 2 - i] = -(INITIAL_SNAKE_SIZE - i);
  }

  return addFood(board);
}

function renderGame(game) {
  let rendered = renderBoard(game.board);
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  document.body.appendChild(rendered);
}

function findHead({ board, snakeSize }) {
  for (var row=0; row < BOARD_SIZE; row++) {
    for (var col=0; col < BOARD_SIZE; col++) {
      if (board[row][col] === -snakeSize) {
        return { row, col };
      }
    }
  }
  throw new Error('Could not find snake.');
}

function findNewHead(gameState) {
  let { direction } = gameState;
  let { row, col } = findHead(gameState);
  let newHead = { row, col };
  if (direction === DIR.UP) {
    newHead.row = (newHead.row - 1 + BOARD_SIZE) % BOARD_SIZE;
  } else if (direction === DIR.RIGHT) {
    newHead.col = (newHead.col + 1 + BOARD_SIZE) % BOARD_SIZE;
  } else if (direction === DIR.DOWN) {
    newHead.row = (newHead.row + 1 + BOARD_SIZE) % BOARD_SIZE;
  } else if (direction === DIR.LEFT) {
    newHead.col = (newHead.col - 1 + BOARD_SIZE) % BOARD_SIZE;
  }
  return newHead;
}

function nextGameState(lastGameState, direction) {
  let { board, snakeSize } = lastGameState;
  let newHead = findNewHead(lastGameState);
  let newBoard = [];
  let growthFactor;
  if (board[newHead.row][newHead.col] === TILES.FOOD) {
    growthFactor = 1;
  } else {
    growthFactor = 0;
  }
  for (let row=0; row < BOARD_SIZE; row++) {
    newBoard[row] = [];
    for (let col=0; col < BOARD_SIZE; col++) {
      if (newHead.row === row && newHead.col === col) {
        newBoard[row][col] = -snakeSize - growthFactor;
      } else if (board[row][col] < 0) {
        newBoard[row][col] = board[row][col] + 1 - growthFactor;
      } else {
        newBoard[row][col] = board[row][col];
      }
    }
  }
  if (growthFactor > 0) {
    addFood(newBoard);
  }
  return {
    board: newBoard,
    direction,
    snakeSize: snakeSize + growthFactor,
  };
}

function playGame() {
  let direction = DIR.RIGHT;
  let states = [];
  states.unshift({
    board: initializeBoard(),
    direction,
    snakeSize: INITIAL_SNAKE_SIZE,
  });
  renderGame(states[0]);
  document.addEventListener('keydown', function(e) {
    let lastDirection = states[0].direction;
    if (e.keyCode === KEYS.UP && lastDirection !== DIR.DOWN) {
      direction = DIR.UP;
    } else if (e.keyCode === KEYS.RIGHT && lastDirection !== DIR.LEFT) {
      direction = DIR.RIGHT;
    } else if (e.keyCode === KEYS.DOWN && lastDirection !== DIR.UP) {
      direction = DIR.DOWN;
    } else if (e.keyCode === KEYS.LEFT && lastDirection !== DIR.RIGHT) {
      direction = DIR.LEFT;
    }
  });
  setInterval(function() {
    states.unshift(nextGameState(states[0], direction));
    renderGame(states[0]);
  }, 500);
}

playGame();
