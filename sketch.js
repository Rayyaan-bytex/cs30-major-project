// Major Project - Sudoku
// Rayyaan Chaghtai
// 
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"


let puzzleLines;
let solutionLines;
let puzzles = [];
let solutions = [];
let chosenPuzzle;
let chosenSolution = [];
let currentGrid;
let solutionGrid;
let selectedRow = -1;
let selectedCol = -1;
let fixedGrid;
let mistakeGrid;
let cellLocked = false;
let mistakeCount = 0;
let gameWon = false;
let restartX, restartY, restartW, restartH;
let startGrid;
let revealX, revealY, revealW, revealH;
let newX, newY, newW, newH;
let board;


class SudokuBoard {
  constructor(puzzles, solutions) {
    this.puzzles = puzzles;
    this.solutions = solutions;
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
  }

  restartCurrentPuzzle() {
    this.currentGrid = copyGrid(this.startGrid);
    this.fixedGrid = copyGrid(this.startGrid);

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        this.mistakeGrid[r][c] = false;
      }
    }
  }

  revealAnswer() {
    this.currentGrid = copyGrid(this.solutionGrid);

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        this.mistakeGrid[r][c] = false;
      }
    }
  }

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
        let value = this.currentGrid[r][c];

        if (value === 0 || this.fixedGrid[r][c] !== 0) {
          this.mistakeGrid[r][c] === false; continue;
        }
        if (!this.isCorrectCell(r, c)) {
          this.mistakeGrid[r][c] = true;
        }
        else {
          this.mistakeGrid[r][c] = false;
        }
      }
    }
  }
}


// Loads the text file containing 10 sudoku puzzles 
function preload() {
  puzzleLines = loadStrings("puzzles_hard.txt");
  solutionLines = loadStrings("solutions_hard.txt");
}



function setup() {
  createCanvas(windowWidth, windowHeight);

  // Extracts the text file into puzzles

  let tempPuzzle = [];        // Holds one puzzle
  let tempSolution = [];

  // - - - READ PUZZLES - - - Loop through all lines loaded from the file 
  for (let line of puzzleLines) {

    // Skip lines like 'Grid 01'"
    if (line[0] === "G")
      continue;
    tempPuzzle.push(line);        // Add the puzzle in temporary array

    if (tempPuzzle.length === 9) {
      puzzles.push(tempPuzzle.concat());
      tempPuzzle = [];
    }
  }

  // - - - READ SOLUTIONS - - - 
  for (let line of solutionLines) {
    if (line[0] === "G")
      continue;
    tempSolution.push(line);

    if (tempSolution.length === 9) {
      solutions.push(tempSolution.concat());
      tempSolution = [];
    }
  }

  board = new SudokuBoard(puzzles, solutions);
  copyBoardToGame();
}


function draw() {
  background("#e09db9ff");
  textAlign(LEFT, CENTER);
  fill("#2e351dff");
  textFont("Montserrat");

  // Adding Text (Instructions, Headings, etc
  strokeWeight(1);
  noStroke();

  textSize(70);
  text("SUDOKU", width / 2 - 900, height / 2 - 380);

  textSize(30);
  text("HOW TO PLAY", width / 2 - 900, height / 2 - 280);

  textSize(23);
  text("To complete the Sudoku grid\nEnter numbers into the blank spaces\nSo that each row, column, and 3x3 box\nContains the numbers 1 - 9 without repitition",
    width / 2 - 900, height / 2 - 195);

  textSize(30);
  text("DIFFICULTY LEVELS", width / 2 - 900, height / 2 - 80);

  textSize(30);
  text("TIPS FOR SOLVING", width / 2 - 900, height / 2 + 60);

  textSize(20);
  text("• Focus on Rows, Columns, and Boxes:\n Look for areas that have only 1 or 2 empty cells\n To make them easier to fill in.\n•Don't Guess, Use Logic:\
 Don't make a random guess.\n Only place a number if it is logically possible.\n• Scan the board: Try adding numbers that appear\n Most frequently in the grid"
  , width / 2 - 900, height / 2 + 180);

  // Dividing Line

  stroke(0);
  strokeWeight(1);
  let lineX = width / 2 - 425;
  line(lineX, 0, lineX, height);

  // Draw Sudoku Grid

  let cellSize = 85;
  let gridSize = cellSize * 9;
  let gridX = width / 2 - 70;
  let gridY = height / 2 - 320;
  let topBarX = -20;
  let topBarY = gridY - 110;
  let barGap = 20;

  // Sizes
  restartW = 210;
  restartH = 65;
  revealW = 230;
  revealH = restartH;
  newW = 210;
  newH = restartH;

  let barX = gridX + topBarX;

  // Display Mistake Counter
  textSize(40);
  fill(0);
  textAlign(LEFT, CENTER);
  text("Mistakes: " + mistakeCount, barX - 25, topBarY + restartH / 2);

  let mistakesTextW = textWidth("Mistakes: ");

  restartX = barX + mistakesTextW + barGap;
  restartY = topBarY;

  stroke(0);
  strokeWeight(2);
  fill(255);
  rect(restartX, restartY, restartW, restartH, 10);

  noStroke();
  fill(0);
  textSize(28);
  textAlign(CENTER, CENTER);
  text("CLEAR", restartX + restartW / 2, restartY + restartH / 2);

  // Draw Reveal Answers Button
  revealX = restartX + restartW + barGap;
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
  newX = revealX + revealW + barGap;
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

  // Draw Main Sudoku Grid
  noStroke();
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      fill("#8a8888ff");
      rect(gridX + col * cellSize, gridY + row * cellSize, cellSize, cellSize);
    }
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
    textSize(75);
    fill("#428475ff");
    text("YOU\nWIN!", lineX / 2 + 450, height / 2);
  }

  strokeWeight(1);

  // Draw the Sudoku numbers
  textAlign(CENTER, CENTER);
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


// Recheck Entire Board After Every Move
function updateMistakes() {
  board.updateMistakes();
  copyBoardToGame();
  
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
    let rowArray = [];
    for (let j = 0; j < 9; j++) {
      rowArray.push(int(puzzle[i][j]));      // int converts the text like "5" to a number 5
    }
    grid.push(rowArray);
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

// Restart Current Puzzle
function restartGame() {
  board.restartCurrentPuzzle();
  copyBoardToGame();

  mistakeCount = 0;
  gameWon = false;
  cellLocked = false;
  selectedRow = -1;
  selectedCol = -1;
}


// Reveal Full Solution On The Board
function revealAnswer() {
  board.revealAnswer();
  copyBoardToGame();

  cellLocked = true;
  selectedRow = -1;
  selectedCol = -1;
  mistakeCount = 0;
  gameWon = true;
}


// Load a New Puzzle on the Grid
function newPuzzle() {
  board.loadRandomPuzzle();
  copyBoardToGame();

  mistakeCount = 0;     // Reset Game State
  gameWon = false;
  cellLocked = false;
  selectedRow = -1;
  selectedCol = -1;
}


// Detects which Sudoku cell the user clicks and stores its row and column
function mousePressed() {
  // Restart Button Click
  if (mouseX > restartX &&
    mouseX < restartX + restartW &&
    mouseY > restartY &&
    mouseY < restartY + restartH) {
    restartGame();
    return;
  }

  // Reveal Answer Button Click
  if (mouseX > revealX &&
    mouseX < revealX + revealW &&
    mouseY > revealY &&
    mouseY < revealY + revealH) {
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
}


// Let User Enter and Delete Numbers (Not the Helper Numbers)
function keyPressed() {
  if (gameWon) {
    return;
  }
  if (selectedRow === -1 || selectedCol === -1) {     // If no cell is selected, do nothing
    return;
  }
  if (fixedGrid[selectedRow][selectedCol] !== 0) {      // if the cell is a hellper number, do nothing
    return;
  }
  if (cellLocked && key >= "1" && key <= "9") {     // Prevent overwriting a number unless the cell has been unlocked by clicking it again
    return;
  }
  if (key >= "1" && key <= "9") {     // If user presses a number 1 - 9
    currentGrid[selectedRow][selectedCol] = int(key);     // Place number into selected cell
    cellLocked = true;      // Lock the cell so the user can't overwrite it instantly
    updateMistakes();     // Recheck entire grid for mistakes
  }
  if (keyCode === BACKSPACE || keyCode === DELETE) {      // If user presses backspace or delete
    currentGrid[selectedRow][selectedCol] = 0;      // Clear the selected cell
    cellLocked = false;     // unlock cell after removing number
    updateMistakes();
  }
}