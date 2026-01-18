// Major Project - Sudoku
// Rayyaan Chaghtai
// 
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"


let easyPuzzleLines, easySolutionLines; // Loads lines from the puzzle/solution text files
let puzzleLines, solutionLines;
let puzzles = [];                       // Stores all puzzles/solutions after parsing
let solutions = [];
let easyPuzzles = [];
let easySolutions = [];
let difficulty = "HARD";                // Which mode the player is in
let chosenPuzzle;                       // The puzzle/solution chosen for this round
let chosenSolution = []; 
let currentGrid;                        // The grids the game uses   
let solutionGrid;
let fixedGrid;
let mistakeGrid;
let startGrid;
let selectedRow = -1;                   // Selected cell
let selectedCol = -1;
let cellLocked = false;                 // Basic flags
let gameWon = false;
let gameOver = false;
let clearX, clearY, clearW, clearH;     // Top buttons
let revealX, revealY, revealW, revealH;
let newX, newY, newW, newH;
let easyX, easyY, easyW, easyH;
let hardX, hardY, hardW, hardH;         // Difficulty buttons
let undoX, undoY, undoW, undoH;
let pauseX, pauseY, pauseW, pauseH;     // Pause button
let board;                              // Main board 
let moveHistory = [];                   // Stores player moves for Undo
let hardTimeLimit = 600;                // Timer
let timeStart = 0;
let timeLeft = hardTimeLimit;
let isPaused = false;                   // Pause System
let pausedTimeLeft = 0;
let hardMistakeLimit = 5;               // Mistakes Limit
let clickSound;                         // Sound Effects
let correctSound;
let mistakeSound;
let victorySound;
let defeatSound;
let playedVictory = false;              // Prevent repeating win/lose sounds
let playedDefeat = false;


class SudokuBoard {
  constructor(puzzles, solutions) {
    this.puzzles = puzzles;
    this.solutions = solutions;
    this.mistakeCount = 0;
    this.difficulty = "hard";
    this.loadRandomPuzzle();
  }

  loadRandomPuzzle() {
    let index = floor(random(this.puzzles.length));
    this.chosenPuzzle = this.puzzles[index];
    this.chosenSolution = this.solutions[index];

    this.currentGrid = convertToGrid(this.chosenPuzzle);
    this.solutionGrid = convertToGrid(this.chosenSolution);

    this.fixedGrid = copyGrid(this.currentGrid);
    this.startGrid = copyGrid(this.currentGrid);

    this.mistakeGrid = [];
    for (let r = 0; r < 9; r++) {
      let rowArray = [];
      for (let c = 0; c < 9; c++) {
        rowArray.push(false);
      }
      this.mistakeGrid.push(rowArray);
    }
    this.mistakeCount = 0;
  }

  setDifficulty(level) {
    this.difficulty = level;
    this.loadRandomPuzzle();
  }

  clearCurrentPuzzle() {
    this.currentGrid = copyGrid(this.startGrid);
    this.fixedGrid = copyGrid(this.startGrid);

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        this.mistakeGrid[r][c] = false;
      }
    }
  }

  revealAnswer() {
    this.currentGrid = copyGrid(this.solutionGrid);     // Deletes the player's current progress and replaces it with a copy of the answer key.

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        this.mistakeGrid[r][c] = false;     // Clears all red mistakes
      }
    }
  }

  // Checks if cell's value matches the solution from the file
  isCorrectCell(row, col) {
    return this.currentGrid[row][col] === this.solutionGrid[row][col];

  }

  checkWin() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (this.currentGrid[r][c] === 0) {
          return false;
        }
        if (this.currentGrid[r][c] !== this.solutionGrid[r][c]) {
          return false;
        }
      }
    }
    return true;
  }

  updateMistakes() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        let value = this.currentGrid[r][c];     // Stores the number currently in this cell

        if (value === 0 || this.fixedGrid[r][c] !== 0) {      // If cell is empty or same as original puzzle
          this.mistakeGrid[r][c] = false; continue;     // Skip to the next cell
        }
        if (!this.isCorrectCell(r, c)) {      // If User's number doesn't match the solution
          if (!this.mistakeGrid[r][c]) {    // Error not counted yet
            this.mistakeCount++;      // Add 1 to players total mistakes
          }
          this.mistakeGrid[r][c] = true;      // Turns this cell red
        }
        else {
          this.mistakeGrid[r][c] = false;     // Keeps it the same color (black)
        }
      }
    }
  }

  setPuzzle(newPuzzles, newSolutions) {
    this.puzzles = newPuzzles;
    this.solutions = newSolutions;
    this.loadRandomPuzzle();
  }
}


// Loads the text/sound files before sketch starts
function preload() {
  // Puzzle + Solution text files
  puzzleLines = loadStrings("puzzles_hard.txt");
  solutionLines = loadStrings("solutions_hard.txt");
  easyPuzzleLines = loadStrings("puzzles_easy.txt");
  easySolutionLines = loadStrings("solutions_easy.txt");

  // Sound Effects
  clickSound = loadSound("sounds/click.mp3");
  correctSound = loadSound("sounds/correct.mp3");
  mistakeSound = loadSound("sounds/mistake.mp3");
  victorySound = loadSound("sounds/victory.mp3");
  defeatSound = loadSound("sounds/defeat.mp3");
}


// Helper functions to not repeat the same code everywhere
function playClick() {
  if (clickSound && clickSound.isLoaded()) {
    clickSound.play();
  }
}

function playCorrect() {
  if (correctSound && correctSound.isLoaded()) {
    correctSound.play();
  }
}

function playMistake() {
  if (mistakeSound && mistakeSound.isLoaded()) {
    mistakeSound.play();
  }
}


function setup() {
  createCanvas(windowWidth, windowHeight);

  // Converts Easy Files into arrays of 9 lines puzzles/solutions
  easyPuzzles = readGrid(easyPuzzleLines);
  easySolutions = readGrid(easySolutionLines);

  // Temporary holders while building hard puzzles
  let tempPuzzle = [];        // Holds one puzzle (9 Lines)
  let tempSolution = [];      // Holds one solution (9 Lines)

  // Read Hard Puzzles
  for (let line of puzzleLines) {
    if (line[0] === "G") {        // Skip lines like 'Grid 01'"
      continue;
    }
    tempPuzzle.push(line);        // Add the puzzle in temporary array

    // If 9 Lines are added, Puzzle Complete
    if (tempPuzzle.length === 9) {
      puzzles.push(tempPuzzle.concat());    // Saves the Puzzle to Puzzle List
      tempPuzzle = [];                      // Resets Array for Next Puzzle
    }
  }

  // Read Hard Solutions
  for (let line of solutionLines) {
    if (line[0] === "G") {                  // Skip lines like 'Grid 01'"
      continue;
    }
    tempSolution.push(line);

    if (tempSolution.length === 9) {
      solutions.push(tempSolution.concat());
      tempSolution = [];
    }
  }

  // Creates the board and pulls its grids into the global variables
  board = new SudokuBoard(puzzles, solutions);
  copyBoardToGame();

  // Start timer and reset game flags
  timeStart = millis();
  timeLeft = hardTimeLimit;
  moveHistory = [];
  gameOver = false;
  gameWon = false;

  // Reset sound flags
  playedVictory = false;
  playedDefeat = false;
}


// Turns the file lines into an array of 9 line grids
function readGrid(lines) {
  let all = [];               // Stores all puzzles
  let temp = [];              // Stores 1 puzzle (9 Lines)

  for (let line of lines) {
    if (line[0] === "G") {    // Skip "Grid 01" Lines
      continue;
    }
    temp.push(line);

    if (temp.length === 9) {
      all.push(temp.concat());  // Save Puzzle
      temp = [];                // Reset for next one
    }
  }
  return all;
}

function draw() {
  background("#e09db9ff");

  // Timer (Hard mode only) 
  if (!gameWon && !gameOver && difficulty === "HARD" && !isPaused) {
    let passedSec = floor((millis() - timeStart) / 1000);
    timeLeft = max(0, hardTimeLimit - passedSec);

    // Time ran out = game over
    if (timeLeft === 0) {
      gameOver = true;
      cellLocked = true;
      selectedRow = -1;
      selectedCol = -1;

      // Play defeat sound once
      if (!playedDefeat && defeatSound && defeatSound.isLoaded()) {
        defeatSound.play();
        playedDefeat = true;
      }
    }
  }

  // Text Styling (default)
  textAlign(LEFT, CENTER);
  fill("#2e351dff");
  textFont("Montserrat");
  noStroke();

  // LEFT PANEL (Instructions + Tips)
  textSize(100);
  text("SUDOKU", width / 2 - 900, 140);

  textSize(45);
  text("HOW TO PLAY", width / 2 - 900, 225);

  textSize(23);
  text(
    "To complete the Sudoku grid\n" +
    "Enter numbers into the blank spaces\n" +
    "So that each row, column, and 3x3 box\n" +
    "Contains the numbers 1 - 9 without repitition",
    width / 2 - 900, 320
  );

  textSize(45);
  text("DIFFICULTY LEVELS", width / 2 - 900, 430);

  // Show selected difficulty
  textSize(35);
  fill(0);
  text("Selected: " + difficulty, width / 2 - 900, 490);

  // Difficulty button sizes + positions
  easyW = 170;  easyH = 55;
  easyX = width / 2 - 900;
  easyY = 520;

  hardW = 170;  hardH = 55;
  hardX = easyX + easyW + 40;
  hardY = easyY;

  // Draw EASY button
  stroke(0); strokeWeight(2); fill(255);
  rect(easyX, easyY, easyW, easyH, 10);
  noStroke(); fill(0); textSize(24); textAlign(CENTER, CENTER);
  text("EASY", easyX + easyW / 2, easyY + easyH / 2);

  // Draw HARD button
  stroke(0); strokeWeight(2); fill(255);
  rect(hardX, hardY, hardW, hardH, 10);
  noStroke(); fill(0); textSize(24);
  text("HARD", hardX + hardW / 2, hardY + hardH / 2);

  // Tips section
  textAlign(LEFT, CENTER);
  fill("#2e351dff");
  textSize(45);
  text("TIPS FOR SOLVING", width / 2 - 900, 630);

  textSize(23);
  text(
    "• Focus on rows, columns, and boxes:\n  Look for areas with only 1–2 empty cells.\n\n" +
    "• Don’t guess, use logic:\n  Only place a number if it’s the only possible choice.\n\n" +
    "• Scan the board:\n  Start with numbers that appear most often.",
    width / 2 - 900, 780
  );

  // Dividing Line
  stroke(0);
  strokeWeight(1);
  let lineX = width / 2 - 395;
  line(lineX, 0, lineX, height);

  // Button Sizes
  clearW = 210;  clearH = 65;
  revealW = 230; revealH = clearH;
  newW = 210;    newH = clearH;
  undoW = 160;   undoH = clearH;
  pauseW = 160;  pauseH = clearH;   

  // Grid Layout
  let cellSize = 85;
  let gridSize = cellSize * 9;
  let gridX = width / 2 - 70;
  let gridY = height / 2 - 320;

  // Top bar (buttons) on top of grid
  let topBarY = gridY - 80;
  let buttonGap = 15;

  // Total width of all buttons and gaps
  let totalButtonsW = clearW + revealW + newW + undoW + pauseW + buttonGap * 4;

  // Center buttons above grid
  let startX = gridX + (gridSize - totalButtonsW) / 2;

  // Mistakes and Time
  textSize(40);
  fill(0);
  textAlign(RIGHT, TOP);

  let cornerX = gridX + gridSize;
  let cornerY = gridY + gridSize + 20;

  let mistakesTop = "Mistakes: " + board.mistakeCount;
  if (difficulty === "HARD") {
    mistakesTop += "/" + hardMistakeLimit;
  }
  text(mistakesTop, cornerX + 235, cornerY - 150);

  // Time display (Hard only)
  if (difficulty === "HARD") {
    textAlign(LEFT, TOP);
    let mins = floor(timeLeft / 60);
    let secs = timeLeft % 60;
    let timeText = "Time: " + mins + ":" + nf(secs, 2);
    text(timeText, cornerX + 20, cornerY - 95);
  }

  // Clear
  clearX = startX;
  clearY = topBarY;
  stroke(0); strokeWeight(2); fill(255);
  rect(clearX, clearY, clearW, clearH, 10);
  noStroke(); fill(0); textSize(28); textAlign(CENTER, CENTER);
  text("CLEAR", clearX + clearW / 2, clearY + clearH / 2);

  // Reveal Answer
  revealX = clearX + clearW + buttonGap;
  revealY = topBarY;
  stroke(0); strokeWeight(2); fill(255);
  rect(revealX, revealY, revealW, revealH, 10);
  noStroke(); fill(0); textSize(25);
  text("REVEAL ANSWER", revealX + revealW / 2, revealY + revealH / 2);

  // New Puzzle
  newX = revealX + revealW + buttonGap;
  newY = topBarY;
  stroke(0); strokeWeight(2); fill(255);
  rect(newX, newY, newW, newH, 10);
  noStroke(); fill(0); textSize(28);
  text("NEW PUZZLE", newX + newW / 2, newY + newH / 2);

  // UNDO
  undoX = newX + newW + buttonGap;
  undoY = topBarY;
  stroke(0); strokeWeight(2); fill(255);
  rect(undoX, undoY, undoW, undoH, 10);
  noStroke(); fill(0); textSize(28);
  text("UNDO", undoX + undoW / 2, undoY + undoH / 2);

  // Pause / Resume
  pauseX = undoX + undoW + buttonGap;
  pauseY = topBarY;
  stroke(0); strokeWeight(2); fill(255);
  rect(pauseX, pauseY, pauseW, pauseH, 10);
  noStroke(); fill(0); textSize(29);

  if (isPaused) {
    text("RESUME", pauseX + pauseW / 2, pauseY + pauseH / 2);
  } else {
    text("PAUSE", pauseX + pauseW / 2, pauseY + pauseH / 2);
  }

  // Draw Grid Background
  noStroke();
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      fill("#8a8888ff");
      rect(gridX + col * cellSize, gridY + row * cellSize, cellSize, cellSize);
    }
  }

  // Highlights Selected Row/Col/Box
  if (selectedRow !== -1 && selectedCol !== -1) {
    let boxRow = floor(selectedRow / 3) * 3;
    let boxCol = floor(selectedCol / 3) * 3;

    noStroke();
    fill(255, 255, 255, 35);
    rect(gridX + boxCol * cellSize, gridY + boxRow * cellSize, cellSize * 3, cellSize * 3);

    fill(255, 255, 255, 25);
    rect(gridX, gridY + selectedRow * cellSize, gridSize, cellSize);

    fill(255, 255, 255, 25);
    rect(gridX + selectedCol * cellSize, gridY, cellSize, gridSize);

    // Same number highlights
    let selectedValue = currentGrid[selectedRow][selectedCol];
    if (selectedValue !== 0) {
      fill(255, 255, 0, 80);
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (currentGrid[r][c] === selectedValue) {
            rect(gridX + c * cellSize, gridY + r * cellSize, cellSize, cellSize);
          }
        }
      }
    }

    // Selected cell highlight
    fill(255, 255, 0, 110);
    rect(gridX + selectedCol * cellSize, gridY + selectedRow * cellSize, cellSize, cellSize);
  }

  // Grid Lines
  stroke(0);
  strokeWeight(3);
  noFill();
  rect(gridX, gridY, gridSize, gridSize);

  for (let i = 1; i < 9; i++) {
    strokeWeight(i % 3 === 0 ? 3 : 1);
    let y = gridY + i * cellSize;
    line(gridX, y, gridX + gridSize, y);
  }

  for (let j = 1; j < 9; j++) {
    strokeWeight(j % 3 === 0 ? 3 : 1);
    let x = gridX + j * cellSize;
    line(x, gridY, x, gridY + gridSize);
  }

  // Win/Lose text
  if (gameWon) {
    textAlign(CENTER, CENTER);
    textSize(100);
    fill("#428475ff");
    text("YOU\nWIN!", lineX / 2 + 450, height / 2);
  }

  if (gameOver) {
    textAlign(CENTER, CENTER);
    textSize(95);
    fill(200, 0, 0);
    text("GAME\nOVER!", lineX / 2 + 450, height / 2);
  }

  // Pause
  if (isPaused) {
    noStroke();
    fill(0, 120);
    rect(gridX, gridY, gridSize, gridSize);

    textAlign(CENTER, CENTER);
    textSize(80);
    fill(255);
    text("PAUSED", gridX + gridSize / 2, gridY + gridSize / 2);
  } else {
    // Draw numbers normally
    textAlign(CENTER, CENTER);
    textFont("light montessarat");
    textSize(45);

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        let cellValue = currentGrid[r][c];
        if (cellValue !== 0) {
          fill(mistakeGrid[r][c] ? color(200, 0, 0) : 0);
          let x = gridX + c * cellSize + cellSize / 2;
          let y = gridY + r * cellSize + cellSize / 2;
          text(cellValue, x, y);
        }
      }
    }
  }
}


function mousePressed() {

  // Pause / Resume button
  if (mouseX > pauseX && mouseX < pauseX + pauseW &&
      mouseY > pauseY && mouseY < pauseY + pauseH) {

    playClick(); // click sound

    if (!gameWon && !gameOver) {
      if (!isPaused) {
        isPaused = true;               // freeze game
        pausedTimeLeft = timeLeft;     // store time
        selectedRow = -1;
        selectedCol = -1;
        cellLocked = true;             // lock input
      }
      else {
        isPaused = false;              // resume game
        cellLocked = false;

        // resume timer from paused spot
        timeStart = millis() - (hardTimeLimit - pausedTimeLeft) * 1000;
        timeLeft = pausedTimeLeft;
      }
    }
    return; // stop here
  }

  // if paused, ignore all clicks
  if (isPaused) {
    return;
  }

  // Clear button
  if (mouseX > clearX && mouseX < clearX + clearW &&
      mouseY > clearY && mouseY < clearY + clearH) {

    if (gameWon || gameOver) return;   // don’t clear end screen
    playClick();                       // click sound
    clearGame();                       // clear board
    return;
  }

  // Reveal button
  if (mouseX > revealX && mouseX < revealX + revealW &&
      mouseY > revealY && mouseY < revealY + revealH) {

    if (gameWon || gameOver) return;   // block at end
    playClick();
    revealAnswer();
    return;
  }

  // New Puzzle button
  if (mouseX > newX && mouseX < newX + newW &&
      mouseY > newY && mouseY < newY + newH) {

    playClick();
    newPuzzle();
    return;
  }

  // UNDO button
  if (mouseX > undoX && mouseX < undoX + undoW &&
      mouseY > undoY && mouseY < undoY + undoH) {

    if (gameWon || gameOver) return;   // no undo after finish
    playClick();

    if (moveHistory.length > 0) {
      let move = moveHistory.pop();    // last move

      currentGrid[move.row][move.col] = move.prevValue; // revert

      selectedRow = move.row;          // go back to cell
      selectedCol = move.col;
      cellLocked = false;

      board.updateMistakes();          // re-check mistakes
      copyBoardToGame();

      gameWon = board.checkWin();      // re-check win
      gameOver = (difficulty === "HARD" && board.mistakeCount >= hardMistakeLimit);
    }
    return;
  }

  // GRID click (select cell)
  let cellSize = 85;
  let gridX = width / 2 - 70;
  let gridY = height / 2 - 320;

  if (mouseX >= gridX && mouseX < gridX + cellSize * 9 &&
      mouseY >= gridY && mouseY < gridY + cellSize * 9) {

    playClick(); // click only on grid

    let newCol = floor((mouseX - gridX) / cellSize);
    let newRow = floor((mouseY - gridY) / cellSize);

    if (newRow !== selectedRow || newCol !== selectedCol) {
      cellLocked = false; // allow new input
    }

    selectedCol = newCol;
    selectedRow = newRow;
    return; // stop here (important)
  }

  // EASY button
  if (mouseX >= easyX && mouseX < easyX + easyW &&
      mouseY >= easyY && mouseY < easyY + easyH) {

    playClick();

    difficulty = "EASY";
    board.setPuzzle(easyPuzzles, easySolutions);
    copyBoardToGame();

    gameWon = false;
    gameOver = false;
    selectedRow = -1;
    selectedCol = -1;
    cellLocked = false;
    moveHistory = [];

    timeStart = millis();
    timeLeft = hardTimeLimit;
    isPaused = false;
    pausedTimeLeft = 0;
    return;
  }

  // HARD button
  if (mouseX >= hardX && mouseX < hardX + hardW &&
      mouseY >= hardY && mouseY < hardY + hardH) {

    playClick();

    difficulty = "HARD";
    board.setPuzzle(puzzles, solutions);
    copyBoardToGame();

    gameWon = false;
    gameOver = false;
    selectedRow = -1;
    selectedCol = -1;
    cellLocked = false;
    moveHistory = [];

    timeStart = millis();
    timeLeft = hardTimeLimit;
    isPaused = false;
    pausedTimeLeft = 0;
    return;
  }
}



// Let User Enter and Delete Numbers (Not the Helper Numbers)
function keyPressed() {
  if (gameWon || gameOver || isPaused) return;         // ignore input now
  if (selectedRow === -1 || selectedCol === -1) return; // no cell picked
  if (fixedGrid[selectedRow][selectedCol] !== 0) return; // helper cell locked

  // block overwriting unless you re click cell
  if (cellLocked && key >= "1" && key <= "9") return;

  let prev = currentGrid[selectedRow][selectedCol];

  // number input
  if (key >= "1" && key <= "9") {
    let newVal = int(key);

    if (newVal !== prev) {
      moveHistory.push({              // save move for undo
        row: selectedRow,
        col: selectedCol,
        prevValue: prev,
        newValue: newVal
      });

      // play correct/wrong sound
      if (newVal === solutionGrid[selectedRow][selectedCol]) {
        playCorrect();
      } else {
        playMistake();
      }
    }

    currentGrid[selectedRow][selectedCol] = newVal;
    cellLocked = true;
    updateMistakes();
  }

  // delete / backspace
  if (keyCode === BACKSPACE || keyCode === DELETE) {
    if (prev !== 0) {
      moveHistory.push({              // save delete undo
        row: selectedRow,
        col: selectedCol,
        prevValue: prev,
        newValue: 0
      });
    }

    currentGrid[selectedRow][selectedCol] = 0;
    cellLocked = false;
    updateMistakes();
  }
}


// Checks whether a move by user follows Sudoku Rules (Row, Column, 3x3 Box)
function isValidMove(row, col, value) {
  // Checks Row
  for (let c = 0; c < 9; c++) {
    if (c !== col && currentGrid[row][c] === value) {      // Ignores the current column
      return false;     // If same number already exists in this row, return false
    }
  }
  // Checks Column
  for (let r = 0; r < 9; r++) {
    if (r !== row && currentGrid[r][col] === value) {      // Ignores the current row
      return false;     // If same number already exists in this column, return false
    }
  }
  // Checks 3x3 Box
  let boxRowStart = floor(row / 3) * 3;     // Finds the starting row of 3x3 Box
  let boxColStart = floor(col / 3) * 3;     // Finds the starting col of 3x3 Box

  for (let r = boxRowStart; r < boxRowStart + 3; r++) {
    for (let c = boxColStart; c < boxColStart + 3; c++) {
      if ((r !== row || c !== col) && currentGrid[r][c] === value) {
        return false;     // If number already exists in box, return false
      }
    }
  }
  // Return true if move passes all checks
  return true;
}


// Check if a Single Cell Matches the Solution
function isCorrectCell(row, col) {
  return currentGrid[row][col] === solutionGrid[row][col];      // Check user input with the solution
}


function checkWin() {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (currentGrid[r][c] === 0) {
        return false;
      }

      if (currentGrid[r][c] !== solutionGrid[r][c]) {
        return false;
      }
    }
  }
  return true;
}


// Convert the puzzle numbers into the 9x9 grid
function convertToGrid(puzzle) {
  let grid = [];

  for (let i = 0; i < 9; i++) {
    let rowArray = [];        // Empty Array to represents a Single Row
    for (let j = 0; j < 9; j++) {
      rowArray.push(int(puzzle[i][j]));      // int converts the text like "5" to a number 5
    }
    grid.push(rowArray);      // Add Completed Row of Nums to Main Grid
  }
  return grid;
}


// Makes a copy of a 2D grid so the original puzzle cannot be changed
function copyGrid(grid) {
  let newGrid = [];
  for (let row = 0; row < 9; row++) {
    newGrid.push(grid[row].concat());     // creates a copy of the row array
  }

  return newGrid;
}


function copyBoardToGame() {
  currentGrid = board.currentGrid;
  solutionGrid = board.solutionGrid;
  fixedGrid = board.fixedGrid;
  startGrid = board.startGrid;
  mistakeGrid = board.mistakeGrid;
}

// clear Current Puzzle
function clearGame() {
  board.clearCurrentPuzzle();
  copyBoardToGame();

  gameWon = false;
  gameOver = false;
  cellLocked = false;
  selectedRow = -1;
  selectedCol = -1;
  moveHistory = [];
  isPaused = false;
  pausedTimeLeft = 0;
  playedVictory = false;
  playedDefeat = false;
}


// Reveal Full Solution On The Board
function revealAnswer() {
  board.revealAnswer();
  copyBoardToGame();

  cellLocked = true;
  selectedRow = -1;
  selectedCol = -1;
  gameWon = true;
  gameOver = false;
  moveHistory = [];
  timeStart = millis();
  timeLeft = hardTimeLimit;
  isPaused = false;
  pausedTimeLeft = 0;
  playedDefeat = false;
  if (!playedVictory && victorySound && victorySound.isLoaded()) {
    victorySound.play();
    playedVictory = true;
  }
}


// Load a New Puzzle on the Grid
function newPuzzle() {
  board.loadRandomPuzzle();
  copyBoardToGame();

  gameWon = false;
  gameOver = false;
  cellLocked = false;
  selectedRow = -1;
  selectedCol = -1;
  moveHistory = [];
  timeStart = millis();
  timeLeft = hardTimeLimit;
  isPaused = false;
  pausedTimeLeft = 0;
  playedVictory = false;
  playedDefeat = false;
}