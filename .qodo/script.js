// Chess piece symbols
const PIECES = {
  K: "♔",
  Q: "♕",
  R: "♖",
  B: "♗",
  N: "♘",
  P: "♙",
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};

// Initial board setup
const INITIAL_BOARD = [
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  [".", ".", ".", ".", ".", ".", ".", "."],
  [".", ".", ".", ".", ".", ".", ".", "."],
  [".", ".", ".", ".", ".", ".", ".", "."],
  [".", ".", ".", ".", ".", ".", ".", "."],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["R", "N", "B", "Q", "K", "B", "N", "R"],
];

// Predefined brutal game moves (simplified format: from-to)
const BRUTAL_GAME = [
  ["e2", "e4"],
  ["e7", "e5"],
  ["g1", "f3"],
  ["b8", "c6"],
  ["f1", "c4"],
  ["f8", "c5"],
  ["c2", "c3"],
  ["f7", "f5"],
  ["e4", "f5"],
  ["d7", "d6"],
  ["d2", "d3"],
  ["c8", "xf5"],
  ["d1", "b3"],
  ["d8", "d7"],
  ["f3", "g5"],
  ["c5", "b6"],
  ["c4", "f7"],
  ["e8", "xf7"],
  ["d3", "d4"],
  ["f7", "g8"],
  ["d4", "e5"],
  ["d6", "xe5"],
  ["g5", "e6"],
  ["g8", "f7"],
  ["e6", "d8"],
  ["a8", "xd8"],
  ["b3", "f7"],
  ["f7", "g6"],
  ["b1", "d2"],
  ["h7", "h6"],
  ["d2", "e4"],
  ["g6", "g5"],
  ["e4", "f6"],
  ["g7", "xf6"],
  ["f7", "xf6"],
  ["h8", "g8"],
  ["f6", "f7"],
  ["g8", "g7"],
  ["f7", "f8"],
  ["g7", "h7"],
  ["f8", "f7"],
  ["h7", "g8"],
  ["f7", "g7"],
  ["g8", "h8"],
  ["g7", "f8"],
];

// Helper for DOM access
const $ = (id) => document.getElementById(id);

// Board logic
const Board = {
  state: [],
  reset() {
    this.state = JSON.parse(JSON.stringify(INITIAL_BOARD));
  },
  getPiece(row, col) {
    return this.state[row][col];
  },
  setPiece(row, col, piece) {
    this.state[row][col] = piece;
  },
  movePiece(fromRow, fromCol, toRow, toCol) {
    const piece = this.getPiece(fromRow, fromCol);
    this.setPiece(toRow, toCol, piece);
    this.setPiece(fromRow, fromCol, ".");
  },
};

// Game logic
const Game = {
  moveIndex: 0,
  isPlaying: false,
  intervalId: null,
  whiteCaptured: [],
  blackCaptured: [],
  reset() {
    this.moveIndex = 0;
    this.isPlaying = false;
    this.whiteCaptured = [];
    this.blackCaptured = [];
    Board.reset();
  },
  parseMove(move) {
    // Accepts [from, to] or [from, 'x'+to] for captures
    const files = "abcdefgh";
    let [from, to] = move;
    if (to.startsWith("x")) to = to.slice(1);

    if (from && to && from.length === 2 && to.length === 2) {
      const fromCol = files.indexOf(from[0]);
      const fromRow = 8 - parseInt(from[1]);
      const toCol = files.indexOf(to[0]);
      const toRow = 8 - parseInt(to[1]);
      if (
        fromCol >= 0 &&
        fromCol < 8 &&
        fromRow >= 0 &&
        fromRow < 8 &&
        toCol >= 0 &&
        toCol < 8 &&
        toRow >= 0 &&
        toRow < 8
      ) {
        return { fromRow, fromCol, toRow, toCol, from, to };
      }
    }
    return null;
  },
  makeMove(move) {
    const parsed = this.parseMove(move);
    if (!parsed) return false;
    const { fromRow, fromCol, toRow, toCol, from, to } = parsed;
    const movingPiece = Board.getPiece(fromRow, fromCol);
    if (movingPiece === ".") return false;

    // Capture logic
    const capturedPiece = Board.getPiece(toRow, toCol);
    if (capturedPiece !== ".") {
      if (capturedPiece === capturedPiece.toUpperCase()) {
        this.whiteCaptured.push(PIECES[capturedPiece]);
      } else {
        this.blackCaptured.push(PIECES[capturedPiece]);
      }
      setTimeout(() => UI.highlightCapture(to), 50);
    }

    Board.movePiece(fromRow, fromCol, toRow, toCol);
    setTimeout(() => UI.highlightMove(from, to), 50);
    return true;
  },
};

// UI logic
const UI = {
  initializeBoard() {
    const board = $("chessboard");
    board.innerHTML = "";
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement("div");
        square.className = `square ${(row + col) % 2 === 0 ? "light" : "dark"}`;
        square.id = `${String.fromCharCode(97 + col)}${8 - row}`;
        board.appendChild(square);
      }
    }
    this.updateBoardDisplay();
  },
  updateBoardDisplay() {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = $(`${String.fromCharCode(97 + col)}${8 - row}`);
        const piece = Board.getPiece(row, col);
        square.textContent = piece !== "." ? PIECES[piece] : "";
        square.classList.remove("highlight", "capture");
      }
    }
  },
  highlightMove(from, to) {
    const fromSquare = $(from);
    const toSquare = $(to);
    if (fromSquare) fromSquare.classList.add("highlight");
    if (toSquare) toSquare.classList.add("highlight");
  },
  highlightCapture(to) {
    const square = $(to);
    if (square) square.classList.add("capture");
  },
  updateMoveList() {
    const movesDiv = $("moves");
    let html = "";
    for (let i = 0; i <= Game.moveIndex && i < BRUTAL_GAME.length; i++) {
      const move = BRUTAL_GAME[i];
      const moveNumber = Math.floor(i / 2) + 1;
      const isWhite = i % 2 === 0;
      const className = i === Game.moveIndex ? "current" : "";
      if (isWhite) {
        html += `<div class="move ${className}"><span>${moveNumber}. ${move[0]} ${move[1]}</span></div>`;
      } else {
        html = html.slice(0, -6) + ` ${move[1]}</span></div>`;
      }
    }
    movesDiv.innerHTML = html;
    movesDiv.scrollTop = movesDiv.scrollHeight;
  },
  updateCapturedPieces() {
    $("whiteCaptured").textContent = Game.whiteCaptured.join(" ");
    $("blackCaptured").textContent = Game.blackCaptured.join(" ");
  },
  updateGameStatus() {
    const status = $("gameStatus");
    if (Game.moveIndex >= BRUTAL_GAME.length) {
      status.textContent = "💀 BRUTAL CHECKMATE! Game Over! 💀";
      status.className = "status checkmate";
      Game.isPlaying = false;
      clearInterval(Game.intervalId);
    } else {
      const isWhiteMove = Game.moveIndex % 2 === 0;
      status.textContent = `${isWhiteMove ? "White" : "Black"} to move - Move ${
        Game.moveIndex + 1
      }`;
      status.className = "status playing";
    }
  },
};

// Simulation controls
function playNextMove() {
  if (Game.moveIndex >= BRUTAL_GAME.length) {
    Game.isPlaying = false;
    clearInterval(Game.intervalId);
    UI.updateGameStatus();
    $("startBtn").disabled = false;
    return;
  }
  const move = BRUTAL_GAME[Game.moveIndex];
  const success = Game.makeMove(move);
  if (success) {
    setTimeout(() => {
      UI.updateBoardDisplay();
      UI.updateMoveList();
      UI.updateCapturedPieces();
      UI.updateGameStatus();
    }, 100);
    Game.moveIndex++;
  } else {
    Game.moveIndex++;
    if (Game.moveIndex < BRUTAL_GAME.length) playNextMove();
  }
}

function startSimulation() {
  if (Game.isPlaying) return;
  Game.isPlaying = true;
  const speed = parseInt($("speedSlider").value);
  Game.intervalId = setInterval(playNextMove, speed);
  $("startBtn").disabled = true;
}

function resetGame() {
  Game.reset();
  UI.updateBoardDisplay();
  UI.updateMoveList();
  UI.updateCapturedPieces();
  UI.updateGameStatus();
  $("startBtn").disabled = false;
}

// Event listeners
$("startBtn").addEventListener("click", startSimulation);
$("resetBtn").addEventListener("click", resetGame);
$("speedSlider").addEventListener("input", function () {
  const speed = parseInt(this.value);
  $("speedValue").textContent = (speed / 1000).toFixed(1) + "s";
  if (Game.isPlaying) {
    clearInterval(Game.intervalId);
    Game.intervalId = setInterval(playNextMove, speed);
  }
});

// Initialize
Board.reset();
UI.initializeBoard();
UI.updateGameStatus();
