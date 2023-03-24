const boxes = document.querySelectorAll(".box");
const gameResult = document.querySelector(".game-result");
const playerSwitcher = document.querySelector("input[type=checkbox]");
const playerSwitcherLabel = document.querySelector("label");
const displayWinner = document.querySelector(".display-winner");
const playAgainBtn = document.querySelector(".play-again-btn");

const playerScore = document.querySelector(".player");
const computerScore = document.querySelector(".computer");
const player1Score = document.querySelector(".player1");
const player2Score = document.querySelector(".player2");

const playerScoreValue = document.querySelector(".player-score-value");
const computerScoreValue = document.querySelector(".computer-score-value");
const player1ScoreValue = document.querySelector(".player1-score-value");
const player2ScoreValue = document.querySelector(".player2-score-value");

const playerTurnDisplay = document.querySelector(".player-turn-display");
const playerTurnDisplayBox = document.querySelector(".turn-box");

const playerMarkerDisplay = document.querySelector(".player-marker-display");

const player1MarkerDisplay = document.querySelector(".player1-marker-display");
const player2MarkerDisplay = document.querySelector(".player2-marker-display");
const computerMarkerDisplay = document.querySelector(
  ".computer-marker-display"
);

const btnReset = document.querySelector(".btn-reset");

let players = {
  player1: {
    name: "player 1",
    marker: null,
    nextPlayer: false,
    score: 0,
  },
  player2: {
    name: "player 2",
    marker: null,
    nextPlayer: false,
    score: 0,
  },
  player: {
    name: "player",
    marker: null,
    nextPlayer: false,
    score: 0,
  },
  computer: {
    name: "computer",
    marker: null,
    nextPlayer: false,
    score: 0,
  },
};

const winningCombos = [
  // horizontal
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // vertical
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // diagonal
  [0, 4, 8],
  [2, 4, 6],
];

const board = new Array(9).fill("");
const { player, player1, player2, computer } = players;

// functions

function handleBoxClick(event) {
  let box = event.target;
  if (box.textContent === "") {
    box.textContent = getPlayerMarker();
    box.classList.add("marker");
    box.style = "pointer-events: none";
    board[box.dataset.index] = getPlayerMarker();

    const currentPlayer = switchPlayers();
    playerTurnDisplay.textContent = `${
      player1.nextPlayer ? player1.name : player2.name
    } turn`;
    checkWinner(currentPlayer);
  }
}

function getRandomIndex() {
  const random = Math.floor(Math.random() * 2);
  return random;
}

function assignMarkerToPlayers() {
  const randomIndex = getRandomIndex();
  const markers = ["x", "o"];
  if (playerSwitcher.checked) {
    player1.marker = markers[randomIndex];
    player2.marker = markers[(randomIndex + 1) % 2];
  } else {
    player.marker = markers[randomIndex];
    computer.marker = markers[(randomIndex + 1) % 2];
  }
}

function getFirstPlayer() {
  const randomIndex = getRandomIndex();
  const options = [true, false];

  if (playerSwitcher.checked) {
    player1.nextPlayer = options[randomIndex];
    player2.nextPlayer = options[(randomIndex + 1) % 2];
  } else {
    player.nextPlayer = options[randomIndex];
    computer.nextPlayer = options[(randomIndex + 1) % 2];
  }
}

function getPlayerMarker() {
  let marker = null;

  if (playerSwitcher.checked) {
    if (player1.nextPlayer) {
      marker = player1.marker;
    } else {
      marker = player2.marker;
    }
  } else {
    if (player.nextPlayer) {
      marker = player.marker;
    } else {
      marker = computer.marker;
    }
  }

  return marker;
}

function switchPlayers() {
  let currentPlayer = null;

  if (playerSwitcher.checked) {
    player1.nextPlayer = !player1.nextPlayer;
    player2.nextPlayer = !player2.nextPlayer;
    currentPlayer = player1.nextPlayer ? player2 : player1;
  } else {
    player.nextPlayer = !player.nextPlayer;
    computer.nextPlayer = !computer.nextPlayer;
    currentPlayer = player.nextPlayer ? computer : player;
  }

  return currentPlayer;
}

function checkWinner(currentPlayer) {
  let winner = "";
  for (let combo of winningCombos) {
    const [a, b, c] = combo;

    const cellA = board[a];
    const cellB = board[b];
    const cellC = board[c];

    if (cellA !== "" && cellA === cellB && cellA === cellC) {
      winner = cellA;
      break;
    }
  }

  if (winner) {
    showGameResult(`${currentPlayer.name} wins`);
    currentPlayer.score++;
    localStorage.setItem("scoreInfo", JSON.stringify(players));
  } else if (!board.includes("")) {
    showGameResult(`It's a tie`);
  } else {
    if (computer.nextPlayer) {
      computerTurn();
    }
  }
}

function updateScoreValue() {
  playerScoreValue.textContent = player.score;
  computerScoreValue.textContent = computer.score;
  player1ScoreValue.textContent = player1.score;
  player2ScoreValue.textContent = player2.score;
}

function showGameResult(result) {
  displayWinner.style = "display: flex";
  gameResult.textContent = result;
  boxes.forEach((box) => (box.style = "pointer-events: none"));
}

function handleSwitcher(event) {
  resetGame();
  changePanelDisplay();
  event.target.checked
    ? (playerSwitcherLabel.textContent = "2P")
    : (playerSwitcherLabel.textContent = "1P");
}

function resetGame() {
  boxes.forEach((box) => {
    box.textContent = "";
    box.style = "pointer-events: auto";
  });

  for (let i = 0; i < board.length; i++) {
    board[i] = "";
  }
  displayWinner.style = "display: none";

  for (const prop in players) {
    players[prop].marker = null;
    players[prop].nextPlayer = false;
  }

  init();
}

// minimax section

function getBestMoveIndex() {
  let bestScore = -Infinity;
  let bestMoveIndex = null;
  for (let i = 0; i < board.length; i++) {
    if (board[i] === "") {
      board[i] = computer.marker;
      let score = minimax(board, 0, false);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        bestMoveIndex = i;
      }
    }
  }
  return bestMoveIndex;
}

function minimax(board, depth, isMaximizing) {
  let result = evaluate(board);
  if (result !== null) {
    return result;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = computer.marker;
        let score = minimax(board, depth + 1, false);
        board[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = player.marker;
        let score = minimax(board, depth + 1, true);
        board[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function evaluate(board) {
  for (let combo of winningCombos) {
    const [a, b, c] = combo;

    const cellA = board[a];
    const cellB = board[b];
    const cellC = board[c];

    if (cellA !== "" && cellA === cellB && cellA === cellC) {
      if (cellA === computer.marker) {
        return 1;
      } else {
        return -1;
      }
    }
  }

  if (!board.includes("")) {
    return 0;
  }

  return null;
}

function computerTurn() {
  const bestMoveIndex = getBestMoveIndex();
  const indexLookUp = {
    0: 0,
    1: 3,
    2: 6,
    3: 1,
    4: 4,
    5: 7,
    6: 2,
    7: 5,
    8: 8,
  };
  const box = boxes[indexLookUp[bestMoveIndex]];
  handleBoxClick({ target: box });
}

function changePanelDisplay() {
  const playerScoreDisplay = playerSwitcher.checked ? "none" : "block";
  const player1ScoreDisplay = playerSwitcher.checked ? "block" : "none";
  playerScore.style.display = playerScoreDisplay;
  computerScore.style.display = playerScoreDisplay;
  player1Score.style.display = player1ScoreDisplay;
  player2Score.style.display = player1ScoreDisplay;
  playerTurnDisplayBox.style.display = player1ScoreDisplay;
}

// ===================

function init() {
  getFirstPlayer();
  assignMarkerToPlayers();

  if (computer.nextPlayer) {
    computerTurn();
  }

  playerMarkerDisplay.textContent = `(${player.marker})`;
  player1MarkerDisplay.textContent = `(${player1.marker})`;
  player2MarkerDisplay.textContent = `(${player2.marker})`;
  computerMarkerDisplay.textContent = `(${computer.marker})`;

  playerTurnDisplay.textContent = `${
    player1.nextPlayer ? player1.name : player2.name
  } turn`;

  if (localStorage.getItem("scoreInfo") !== null) {
    const storage = JSON.parse(localStorage.getItem("scoreInfo"));
    //update scores
    for (const prop in storage) {
      players[prop].score = storage[prop].score;
    }
  }

  updateScoreValue();
}

init();

// event listeners

boxes.forEach((box) => {
  box.addEventListener("click", handleBoxClick);
});

playerSwitcher.addEventListener("change", handleSwitcher);

playAgainBtn.addEventListener("click", resetGame);

btnReset.addEventListener("click", () => {
  let result = confirm("Are you sure?");
  if (result == true) {
    localStorage.clear();
    location.reload();
  }
});
