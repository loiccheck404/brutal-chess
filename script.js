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

// Toddler-friendly explanations for each move
const MOVE_EXPLANATIONS = [
  "The white soldier (pawn) takes TWO big steps forward! Like giant steps!",
  "The black soldier does the same - two big steps toward white! Hi there!",
  "The white horsie (knight) jumps out! Horsies can jump over other pieces!",
  "The black horsie jumps out too! Now both horsies are ready to play!",
  "The white bishop (pointy hat guy) slides out diagonally like walking corner to corner!",
  "The black bishop slides out too! Now they're looking at each other!",
  "Another white soldier takes just ONE little step forward this time.",
  "A black soldier takes TWO big steps - getting closer to white pieces!",
  "OH NO! The white soldier EATS the black soldier! Like playing tag - you're out!",
  "A black soldier takes one little step forward.",
  "A white soldier takes one little step forward too.",
  "The black bishop slides over and EATS the white soldier! Chomp!",
  "The white queen (superhero piece!) slides over to a new spot.",
  "The black queen moves to a different square too.",
  "The white horsie jumps to a new spot - remember, horsies can jump!",
  "The black bishop slides to a different diagonal spot.",
  "The white bishop slides over and EATS a black soldier! Nom nom!",
  "OH WOW! The black king has to come out and eat the white bishop!",
  "A white soldier takes one step forward.",
  "The black king walks to a safer corner - kings don't like danger!",
  "The white soldier eats the black soldier! Chomp!",
  "The black soldier gets revenge and eats the white soldier back!",
  "The white horsie jumps to a really good spot!",
  "The black king moves to another square, trying to stay safe.",
  "The white horsie jumps and EATS something really important!",
  "The black castle (rook) slides over and eats the white horsie!",
  "The white queen zooms over and eats something! Queens can move anywhere!",
  "Something moves to safety.",
  "The white horsie jumps from its starting spot to a new place.",
  "A black soldier on the side takes one little step.",
  "The white horsie jumps to the middle of the board!",
  "Something black moves to escape.",
  "The white horsie jumps and eats something!",
  "A black soldier gets revenge and eats the white horsie!",
  "The white queen eats the black soldier!",
  "The black castle slides one square over.",
  "The white queen moves closer to the black king! Danger!",
  "The black castle tries to help protect the king.",
  "The white queen gets even closer! The black king is in BIG trouble!",
  "The black castle moves away.",
  "The white queen stays close, keeping the black king trapped!",
  "The black castle tries to help again.",
  "The white queen moves right next to the black king! So close!",
  "The black castle moves to the corner.",
  "The white queen moves to the perfect spot... CHECKMATE! The black king can't escape! Game over!",
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
    // Stop any running intervals
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Reset all game state variables
    this.moveIndex = 0;
    this.isPlaying = false;
    this.whiteCaptured = [];
    this.blackCaptured = [];

    // Reset the board to initial position
    Board.reset();

    console.log("Game state reset to initial position");
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
      const explanation = MOVE_EXPLANATIONS[i] || "";
      const moveNumber = Math.floor(i / 2) + 1;
      const isWhite = i % 2 === 0;
      const className = i === Game.moveIndex ? "current" : "";

      if (isWhite) {
        html += `<div class="move ${className}">
          <div class="move-notation">
            <span class="move-number">${moveNumber}.</span> 
            <span class="move-text">${move[0]} ${move[1]}</span>
          </div>
          <div class="move-explanation">${explanation}</div>
        </div>`;
      } else {
        // For black moves, we need to update the previous move div
        const lastMoveIndex = html.lastIndexOf(
          '<div class="move-explanation">'
        );
        if (lastMoveIndex !== -1) {
          // Insert black move before the explanation
          const beforeExplanation = html.substring(0, lastMoveIndex);
          const afterExplanation = html.substring(lastMoveIndex);
          const blackMoveText = ` <span class="black-move">${move[1]}</span>`;

          // Find the move-text span and append black move
          const moveTextEnd = beforeExplanation.lastIndexOf("</span>");
          const updatedHtml =
            beforeExplanation.substring(0, moveTextEnd) +
            blackMoveText +
            beforeExplanation.substring(moveTextEnd);

          html =
            updatedHtml +
            `<div class="move-explanation">${explanation}</div></div>`;
        }
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
      $("startBtn").disabled = false;
      $("pauseBtn").disabled = true;
      $("pauseBtn").textContent = "Pause";
    } else {
      const isWhiteMove = Game.moveIndex % 2 === 0;
      status.textContent = `${isWhiteMove ? "White" : "Black"} to move - Move ${
        Game.moveIndex + 1
      }`;
      status.className = "status playing";
    }
  },
};

// Simulation controls with Pause/Resume toggle
let simulationPaused = false;

function playNextMove() {
  if (Game.moveIndex >= BRUTAL_GAME.length) {
    Game.isPlaying = false;
    clearInterval(Game.intervalId);
    UI.updateGameStatus();
    $("startBtn").disabled = false;
    $("pauseBtn").disabled = true;
    $("pauseBtn").textContent = "Pause";
    simulationPaused = false;
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
  simulationPaused = false;
  const speed = parseInt($("speedSlider").value);
  Game.intervalId = setInterval(playNextMove, speed);
  $("startBtn").disabled = true;
  $("pauseBtn").disabled = false;
  $("pauseBtn").textContent = "Pause";
}

function togglePauseResume() {
  if (!Game.isPlaying && !simulationPaused) return; // Not started yet
  if (!simulationPaused) {
    // Pause
    simulationPaused = true;
    Game.isPlaying = false;
    clearInterval(Game.intervalId);
    $("pauseBtn").textContent = "Resume";
    $("startBtn").disabled = true;
  } else {
    // Resume
    simulationPaused = false;
    Game.isPlaying = true;
    const speed = parseInt($("speedSlider").value);
    Game.intervalId = setInterval(playNextMove, speed);
    $("pauseBtn").textContent = "Pause";
    $("startBtn").disabled = true;
  }
}

function resetGame() {
  // Stop any running simulation
  if (Game.intervalId) {
    clearInterval(Game.intervalId);
    Game.intervalId = null;
  }

  // Reset all game state
  Game.reset();
  simulationPaused = false;

  // Clear all visual highlights from board squares
  const squares = document.querySelectorAll(".square");
  squares.forEach((square) => {
    square.classList.remove("highlight", "capture");
  });

  // Reset UI elements
  UI.updateBoardDisplay();
  UI.updateMoveList();
  UI.updateCapturedPieces();
  UI.updateGameStatus();

  // Reset button states
  $("startBtn").disabled = false;
  $("pauseBtn").disabled = true;
  $("pauseBtn").textContent = "Pause";

  // Reset status message
  $("gameStatus").textContent = "Ready to start brutal simulation";
  $("gameStatus").className = "status playing";

  // Clear move list display
  $("moves").innerHTML = "";

  console.log("Game reset successfully!");
}

// Event listeners
$("startBtn").addEventListener("click", startSimulation);
$("pauseBtn").addEventListener("click", togglePauseResume);
$("resetBtn").addEventListener("click", resetGame);
$("speedSlider").addEventListener("input", function () {
  const speed = parseInt(this.value);
  $("speedValue").textContent = (speed / 1000).toFixed(1) + "s";
  if (Game.isPlaying) {
    clearInterval(Game.intervalId);
    Game.intervalId = setInterval(playNextMove, speed);
  }
});

// On page load, disable pauseBtn and initialize everything
window.addEventListener("DOMContentLoaded", function () {
  $("pauseBtn").disabled = true;
  $("pauseBtn").textContent = "Pause";
  Board.reset();
  UI.initializeBoard();
  UI.updateGameStatus();
  UI.updateMoveList();
  UI.updateCapturedPieces();

  // Add CSS for move explanations
  const style = document.createElement("style");
  style.textContent = `
    .move-notation {
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .move-number {
      color: #ffff00;
    }
    
    .move-text {
      color: #fff;
    }
    
    .black-move {
      color: #ccc;
    }
    
    .move-explanation {
      font-size: 12px;
      color: #aaa;
      font-style: italic;
      line-height: 1.3;
      margin-bottom: 8px;
      padding-left: 10px;
      border-left: 2px solid #444;
    }
    
    .move.current .move-explanation {
      color: #ffeb3b;
      border-left-color: #ffeb3b;
    }
  `;
  document.head.appendChild(style);
});
