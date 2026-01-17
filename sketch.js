// Major Project - Sudoku
// Rayyaan Chaghtai
// 
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"


let easyPuzzleLines, easySolutionLines;
let puzzleLines, solutionLines;
let puzzles = [];
let solutions = [];
let easyPuzzles = [];
let easySolutions = [];
let difficulty = "HARD";
let chosenPuzzle;
let chosenSolution = [];
let currentGrid;
let solutionGrid;
let selectedRow = -1;
let selectedCol = -1;
let fixedGrid;
let mistakeGrid;
let cellLocked = false;
let gameWon = false;
let gameOver = false;
let clearX, clearY, clearW, clearH;
let startGrid;
let revealX, revealY, revealW, revealH;
let newX, newY, newW, newH;
let board;
let easyX, easyY, easyW, easyH;
let hardX, hardY, hardW, hardH;
let undoX, undoY, undoW, undoH;
let moveHistory = [];
let hardTimeLimit = 600;
let timeStart = 0;
let timeLeft = hardTimeLimit;
let pauseX, pauseY, pauseW, pauseH;
let isPaused = false;
let pausedTimeLeft = 0;
let hardMistakeLimit = 5;


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


// Loads the text file containing 10 sudoku puzzles 
function preload() {
  puzzleLines = loadStrings("puzzles_hard.txt");
  solutionLines = loadStrings("solutions_hard.txt");
  easyPuzzleLines = loadStrings("puzzles_easy.txt");
  easySolutionLines = loadStrings("solutions_easy.txt");
}



function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);

  easyPuzzles = readGrid(easyPuzzleLines);
  easySolutions = readGrid(easySolutionLines);

  // Extracts the text file into puzzles

  let tempPuzzle = [];        // Holds one puzzle
  let tempSolution = [];

  // READ PUZZLES - Loop through all lines loaded from the file 
  for (let line of puzzleLines) {

    // Skip lines like 'Grid 01'"
    if (line[0] === "G") {
      continue;
    }
    tempPuzzle.push(line);        // Add the puzzle in temporary array

    // If 9 Lines are added, Puzzle Complete
    if (tempPuzzle.length === 9) {
      puzzles.push(tempPuzzle.concat());    // Saves the Puzzle to Puzzle List
      tempPuzzle = [];      // Resets Array for Next Puzzle
    }
  }

  // - - - READ SOLUTIONS - - - 
  for (let line of solutionLines) {
    if (line[0] === "G") {
      continue;
    }
    tempSolution.push(line);

    if (tempSolution.length === 9) {
      solutions.push(tempSolution.concat());
      tempSolution = [];
    }
  }

  board = new SudokuBoard(puzzles, solutions);
  copyBoardToGame();

  timeStart = millis();
  timeLeft = hardTimeLimit;
  moveHistory = [];
  gameOver = false;
  gameWon = false;
}


// Turns the file lines into an array of 9 line grids
function readGrid(lines) {
  let all = [];
  let temp = [];

  for (let line of lines) {
    if (line[0] === "G") {
      continue;
    }
    temp.push(line);

    if (temp.length === 9) {
      all.push(temp.concat());
      temp = [];
    }
  }
  return all;
}

function draw() {
  background("#e09db9ff");

  if (!gameWon && !gameOver && difficulty === "HARD" && !isPaused) {
    let passedSec = floor((millis() - timeStart) / 1000);
    timeLeft = max(0, hardTimeLimit - passedSec);

    if (timeLeft === 0) {
      gameOver = true;
      cellLocked = true;
      selectedRow = -1;
      selectedCol = -1;
    }
  }

  textAlign(LEFT, CENTER);
  fill("#2e351dff");
  textFont("Montserrat");

  // Adding Text (Instructions, Headings, etc
  strokeWeight(1);
  noStroke();

  // let leftW = 380;
  // let gap = 45;

  textSize(100);
  text("SUDOKU", width / 2 - 900, 140);

  textSize(45);
  text("HOW TO PLAY", width / 2 - 900, 225);

  textSize(23);
  text("To complete the Sudoku grid\nEnter numbers into the blank spaces\nSo that each row, column, and 3x3 box\nContains the numbers 1 - 9 without repitition",
    width / 2 - 900, 320);

  textSize(45);
  text("DIFFICULTY LEVELS", width / 2 - 900, 430);

  // Shows which one is Selected (small text)
  textSize(35);
  fill(0);
  textAlign(LEFT, CENTER);
  text("Selected: " + difficulty, width / 2 - 900, 490);

  easyW = 170;
  easyH = 55;
  easyX = width / 2 - 900;
  easyY = 520;

  hardW = 170;
  hardH = 55;
  hardX = easyX + easyW + 40;
  hardY = easyY;

  // Easy Button
  stroke(0);
  strokeWeight(2);
  fill(255);
  rect(easyX, easyY, easyW, easyH, 10);

  noStroke();
  fill(0);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("EASY", easyX + easyW / 2, easyY + easyH / 2);

  // Hard Button
  stroke(0);
  strokeWeight(2);
  fill(255);
  rect(hardX, hardY, hardW, hardH, 10);

  noStroke();
  fill(0);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("HARD", hardX + hardW / 2, hardY + hardH / 2);

  textAlign(LEFT, CENTER);
  fill("#2e351dff");
  textSize(45);
  text("TIPS FOR SOLVING", width / 2 - 900, 630);

  textSize(23);
  text(
    "• Focus on rows, columns, and boxes:\n  Look for areas with only 1–2 empty cells.\n\n" +
    "• Don’t guess, use logic:\n  Only place a number if it’s the only possible choice.\n\n" +
    "• Scan the board:\n  Start with numbers that appear most often.",
    width / 2 - 900, 780);

  // Dividing Line

  stroke(0);
  strokeWeight(1);
  let lineX = width / 2 - 395;
  // let availableWidth = width - lineX;
  line(lineX, 0, lineX, height);

  if (undoW === undefined) {
    undoW = 160;
  }
  pauseW = 160;
  pauseH = clearH;

  // Sizes
  clearW = 210;
  clearH = 65;
  revealW = 230;
  revealH = clearH;
  newW = 210;
  newH = clearH;

  // Draw Sudoku Grid
  let buttonGap = 15;
  let totalButtonsW = clearW + revealW + newW + undoW + pauseW + buttonGap * 4;
  let cellSize = 85;
  let gridSize = cellSize * 9;
  let gridX = width / 2 - 70;
  let gridY = height / 2 - 320;
  let topBarY = gridY - 80;
  let startX = gridX + (gridSize - totalButtonsW) / 2;

  // let topGap = 18;


  // Display Mistake Counter
  textSize(40);
  fill(0);
  textAlign(RIGHT, TOP);
  // let bottomY = gridY + gridSize + 35;
  // let leftEdge = gridX;
  // let rightEdge = gridX + gridSize;
  let cornerX = gridX + gridSize;
  let cornerY = gridY + gridSize + 20;
  let mistakesTop = "Mistakes: " + board.mistakeCount;
  if (difficulty === "HARD") {
    mistakesTop += "/" + hardMistakeLimit;
  }
  text(mistakesTop, cornerX + 235, cornerY - 150);

  let mistakesW = textWidth(mistakesTop);
  let totalBarW = mistakesW + 30 + totalButtonsW;
  // let barX = gridX + (gridSize - totalBarW) / 2;

  if (difficulty === "HARD") {
    textAlign(LEFT, TOP);
    let mins = floor(timeLeft / 60);
    let secs = timeLeft % 60;
    let timeText = "Time: " + mins + ":" + nf(secs, 2);
    text(timeText, cornerX + 20, cornerY - 95);
  }

  clearX = startX;
  clearY = topBarY;

  stroke(0);
  strokeWeight(2);
  fill(255);
  rect(clearX, clearY, clearW, clearH, 10);

  noStroke();
  fill(0);
  textSize(28);
  textAlign(CENTER, CENTER);
  text("CLEAR", clearX + clearW / 2, clearY + clearH / 2);

  // Draw Reveal Answers Button
  revealX = clearX + clearW + buttonGap;
  revealY = topBarY;

  stroke(0);
  strokeWeight(2);
  fill(255);
  rect(revealX, revealY, revealW, revealH, 10);

  noStroke();
  fill(0);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("REVEAL ANSWER", revealX + revealW / 2, revealY + revealH / 2);

  // New Puzzle Button
  newX = revealX + revealW + buttonGap;
  newY = topBarY;

  stroke(0);
  strokeWeight(2);
  fill(255);
  rect(newX, newY, newW, newH, 10);

  noStroke();
  fill(0);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("NEW PUZZLE", newX + newW / 2, newY + newH / 2);
  textAlign(LEFT, CENTER);

  // UNDO Button 
  undoW = 160;
  undoH = clearH;
  undoX = newX + newW + buttonGap;
  undoY = topBarY;

  stroke(0);
  strokeWeight(2);
  fill(255);
  rect(undoX, undoY, undoW, undoH, 10);

  noStroke();
  fill(0);
  textSize(28);
  textAlign(CENTER, CENTER);
  text("UNDO", undoX + undoW / 2, undoY + undoH / 2);

  textAlign(LEFT, CENTER);

  pauseX = undoX + undoW + buttonGap;
  pauseY = topBarY;
  pauseH = clearH;

  stroke(0);
  strokeWeight(2);
  fill(255);
  rect(pauseX, pauseY, pauseW, pauseH, 10);

  noStroke();
  fill(0);
  textSize(26);
  textAlign(CENTER, CENTER);

  if (isPaused) {
    text("RESUME", pauseX + pauseW / 2, pauseY + pauseH / 2);
  }
  else {
    text("PAUSE", pauseX + pauseW / 2, pauseY + pauseH / 2);
  }

  textAlign(LEFT, CENTER);




  // Draw Main Sudoku Grid
  noStroke();
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      fill("#8a8888ff");
      rect(gridX + col * cellSize, gridY + row * cellSize, cellSize, cellSize);   // Calculate position based on grid starting point and cell index
    }
  }

  // Highlighting Row, Col, Box, and all Instances of Same Number
  if (selectedRow !== -1 && selectedCol !== -1) {
    let boxRow = floor(selectedRow / 3) * 3;
    let boxCol = floor(selectedCol / 3) * 3;
    noStroke();     // Highlight the 3x3 Box
    fill(255, 255, 255, 35);
    rect(gridX + boxCol * cellSize, gridY + boxRow * cellSize, cellSize * 3, cellSize * 3);

    // Highlight the Selected Row
    fill(255, 255, 255, 25);
    rect(gridX, gridY + selectedRow * cellSize, gridSize, cellSize);

    // Highlight the Selected Col
    fill(255, 255, 255, 25);
    rect(gridX + selectedCol * cellSize, gridY, cellSize, gridSize);

    // Highlight Every Instance of Selected Number
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
    // Darker Highlight for Selected Cell on TOp
    fill(255, 255, 0, 110);
    rect(gridX + selectedCol * cellSize, gridY + selectedRow * cellSize, cellSize, cellSize);
  }


  // Highlight Selected Cell
  if (selectedRow !== -1 && selectedCol !== -1) {
    noStroke();
    fill(255, 255, 0, 120);     // Highlighted with yellow color with transparency

    let highlightX = gridX + selectedCol * cellSize;
    let highlightY = gridY + selectedRow * cellSize;

    rect(highlightX, highlightY, cellSize, cellSize);       // Draw a rectangle over the selected cell to highlight it
  }

  // Make 3X3 lines thick + thin
  stroke(0);

  // Make Border Thick
  strokeWeight(3);
  noFill();
  rect(gridX, gridY, gridSize, gridSize);

  // Horizontal Lines
  for (let i = 1; i < 9; i++) {
    if (i % 3 === 0) {
      strokeWeight(3);
    }
    else {
      strokeWeight(1);
    }
    let y = gridY + i * cellSize;
    line(gridX, y, gridX + gridSize, y);
  }

  // Verticle Lines
  for (let j = 1; j < 9; j++) {
    if (j % 3 === 0) {
      strokeWeight(3);
    }
    else {
      strokeWeight(1);
    }
    let x = gridX + j * cellSize;
    line(x, gridY, x, gridY + gridSize);
  }

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

  strokeWeight(1);

  if (isPaused) {
    noStroke();
    fill(0, 120);
    rect(gridX, gridY, gridSize, gridSize);

    textAlign(CENTER, CENTER);
    textSize(80);
    fill(255);
    text("PAUSED", gridX + gridSize / 2, gridY + gridSize / 2);
  }

  else {
    textAlign(CENTER, CENTER);      // Draw the Sudoku numbers
    textFont("light montessarat");
    fill(0);
    textSize(45);

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        let cellValue = currentGrid[r][c];

        // Only draw numbers 1 - 9, not zero
        if (cellValue !== 0) {

          // Draw Mistakes in Red
          if (mistakeGrid[r][c]) {
            fill(200, 0, 0);
          }
          else {
            fill(0);
          }
          let x = gridX + c * cellSize + cellSize / 2;
          let y = gridY + r * cellSize + cellSize / 2;
          text(cellValue, x, y);
        }
      }
    }
  }
}


// Recheck Entire Board After Every Move
function updateMistakes() {
  board.updateMistakes();
  copyBoardToGame();

  if (difficulty === "HARD" && board.mistakeCount >= hardMistakeLimit) {
    gameOver = true;
    cellLocked = true;
    selectedRow = -1;
    selectedCol = -1;
    return;
  }

  if (board.checkWin()) {
    gameWon = true;
    selectedRow = -1;
    selectedCol = -1;
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
}


function mousePressed() {
  // Pause/Resume Button
  if (mouseX > pauseX &&
    mouseX < pauseX + pauseW &&
    mouseY > pauseY &&
    mouseY < pauseY + pauseH) {

    if (!gameWon && !gameOver) {
      if (!isPaused) {
        isPaused = true;
        pausedTimeLeft = timeLeft;
        selectedRow = -1;
        selectedCol = -1;
        cellLocked = true;
      }
      else {
        isPaused = false;
        cellLocked = false;

        timeStart = millis() - (hardTimeLimit - pausedTimeLeft) * 1000;
        timeLeft = pausedTimeLeft;
      }
    }
    return;
  }

  if (isPaused) {
    return;
  }

  // clear Button Click
  if (mouseX > clearX &&
    mouseX < clearX + clearW &&
    mouseY > clearY &&
    mouseY < clearY + clearH) {
    if (gameWon || gameOver) {
      return;
    }
    clearGame();
    return;
  }

  // Reveal Answer Button Click
  if (mouseX > revealX &&
    mouseX < revealX + revealW &&
    mouseY > revealY &&
    mouseY < revealY + revealH) {
    if (gameWon || gameOver) {
      return;
    }
    revealAnswer();
    return;
  }


  // New Puzzle Button Click
  if (mouseX > newX &&
    mouseX < newX + newW &&
    mouseY > newY &&
    mouseY < newY + newH) {
    newPuzzle();
    return;
  }

  // UNDO Button Click
  if (mouseX > undoX &&
    mouseX < undoX + undoW &&
    mouseY > undoY &&
    mouseY < undoY + undoH) {

    if (gameWon || gameOver) {
      return;
    }

    if (moveHistory.length > 0) {
      let move = moveHistory.pop();

      currentGrid[move.row][move.col] = move.prevValue;

      selectedRow = move.row;
      selectedCol = move.col;
      cellLocked = false;

      board.updateMistakes();
      copyBoardToGame();

      gameWon = board.checkWin();

      if (difficulty === "HARD" && board.mistakeCount >= 5) {
        gameOver = true;
      }
      else {
        gameOver = false;
      }
    }
    return;
  }

  // Grid Position and Size
  let cellSize = 85;
  let gridX = width / 2 - 70;
  let gridY = height / 2 - 320;

  // Check if mouse is inside the grid
  if (mouseX >= gridX &&
    mouseX < gridX + cellSize * 9 &&
    mouseY >= gridY &&
    mouseY < gridY + cellSize * 9) {
    // Calculate the column and row
    let newCol = floor((mouseX - gridX) / cellSize);
    let newRow = floor((mouseY - gridY) / cellSize);
    // If clicking a different cell, unlock the input to enter new number
    if (newRow !== selectedRow || newCol !== selectedCol) {
      cellLocked = false;
    }
    // Store the new selected cell
    selectedCol = newCol;
    selectedRow = newRow;
  }

  // Easy Button Click
  if (mouseX >= easyX &&
    mouseX < easyX + easyW &&
    mouseY >= easyY &&
    mouseY < easyY + easyH) {

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

  // Hard Button Click
  if (mouseX >= hardX &&
    mouseX < hardX + hardW &&
    mouseY >= hardY &&
    mouseY < hardY + hardH) {

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
  if (gameWon || gameOver || isPaused) {
    return;
  }

  if (selectedRow === -1 || selectedCol === -1) {     // If no cell is selected, do nothing
    return;
  }

  if (fixedGrid[selectedRow][selectedCol] !== 0) {      // if the cell is a helper number, do nothing
    return;
  }

  if (cellLocked && key >= "1" && key <= "9") {     // Prevent overwriting a number unless the cell has been unlocked by clicking it again
    return;
  }

  let prev = currentGrid[selectedRow][selectedCol];

  if (key >= "1" && key <= "9") {
    let newVal = int(key);

    if (newVal !== prev) {
      moveHistory.push({
        row: selectedRow,
        col: selectedCol,
        prevValue: prev,
        newValue: newVal
      });
    }

    currentGrid[selectedRow][selectedCol] = newVal;
    cellLocked = true;
    updateMistakes();
  }

  if (keyCode === BACKSPACE || keyCode === DELETE) {      // If user presses backspace or delete
    if (prev !== 0) {
      moveHistory.push({
        row: selectedRow,
        col: selectedCol,
        prevValue: prev,
        newValue: 0
      });
    }
    currentGrid[selectedRow][selectedCol] = 0;      // Clear the selected cell
    cellLocked = false;     // unlock cell after removing number
    updateMistakes();
  }
}