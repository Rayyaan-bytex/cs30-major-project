// Major Project - Sudoku
// Rayyaan Chaghtai
// 
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"


let puzzleLines;
let puzzles = [];
let chosenPuzzle;
let currentGrid;
let selectedRow = -1;
let selectedCol = -1;
let fixedGrid;
let mistakeGrid;

// Loads the text file containing 10 sudoku puzzles 
function preload() {
  puzzleLines = loadStrings("puzzles.txt");
}



function setup() {
  createCanvas(windowWidth, windowHeight);

  // Extracts the text file into puzzles

  let tempPuzzle = [];        // Holds one puzzle

  // Loop through all lines loaded from the file
  for (let line of puzzleLines) {

    // Skip lines like 'Grid 01'"
    if (line[0] === "G") {
      continue;
    }
    
    // Add the puzzle in temporary array
    tempPuzzle.push(line);    
    
    // Once the 9 lines are collected, store the puzzle
    if (tempPuzzle.length === 9) {
      puzzles.push(tempPuzzle.concat());       // Stores the Puzzle  
      tempPuzzle = [];
    }

    // Initialize mistakes grid
    mistakeGrid = [];     
    for (let r = 0; r < 9; r++) {
      row = [];
      for (let c = 0; c < 9; c++) {
        row.push(false);  // No mistakes at the start
      }
      mistakeGrid.push(row);
    }
  }

  // Select a Random Puzzle from the text file
  let index = floor(random(puzzles.length));
  chosenPuzzle = puzzles[index];
  console.log(chosenPuzzle);


  // Convert the puzzle numbers into the 9x9 Grid
  currentGrid = convertToGrid(chosenPuzzle);
  console.table(currentGrid);

  // Copy original grid so the helper numbers are fixed
  fixedGrid = copyGrid(currentGrid);
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
  let gridY = height / 2 - 350;

  // Draw Main Sudoku Grid
  noStroke();
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      fill("#8a8888ff");
      rect(gridX + col * cellSize, gridY + row * cellSize, cellSize, cellSize);
    }
  }

  // Highlight Selected Cell
  if (selectedRow !== -1 && selectedCol!== -1) {
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

  strokeWeight(1);

  // Draw the Sudoku numbers
  textAlign(CENTER, CENTER);
  textFont("Uni Sans");         // ############### WORK ON THIS ###############
  fill(0);
  textSize(45);

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      let cellValue  = currentGrid[row][col];

      // Only draw numbers 1 - 9, not zero
      if (cellValue !== 0) {
        let x = gridX + col * cellSize + cellSize / 2; 
        let y = gridY + row * cellSize + cellSize / 2;
        text(cellValue, x, y);
      }
    }
  }
}


// Checks whether a move by user follows Sudoku Rules (Row, Column, 3x3 Box)
function isValidMove(row, col, value) {
  // Checks Row
  for (let c = 0; c < 9; c++) {       
    if (c!== col && currentGrid[row][c] === value) {      // Ignores the current column
      return false;     // If same number already exists in this row, return false
    }
  }
  // Checks Column
  for (let r = 0; r < 9; r++) {       
    if (r!== row && currentGrid[r][col] === value) {      // Ignores the current row
      return false;     // If same number already exists in this column, return false
    }
  }
  // Checks 3x3 Box
  let boxRowStart = floor(row / 3) * 3;     // Finds the starting row of 3x3 Box
  let boxColStart = floor(col / 3) * 3;     // Finds the starting col of 3x3 Box

  for (let r = boxRowStart; r < boxRowStart + 3; r++) {
    for (let c = boxColStart; c < boxColStart + 3; c++) {
      if ((r!== row || c!== col) && currentGrid[c][r] === value ) {     
        return false;     // If number already exists in box, return false
      }
    }
  }
  // Return true if move passes all checks
  return true;
}


// Convert the puzzle numbers into the 9x9 grid
function convertToGrid(puzzle) {
  let grid = [];

  for (let i = 0; i < 9; i++) {
    let row = [];
    for (let j = 0; j < 9; j++) {
      row.push(int(puzzle[i][j]));      // int converts the text like "5" to a number 5
    }
    grid.push(row);
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


// Detects which Sudoku cell the user clicks and stores its row and column
function mousePressed() {
  // Grid Position and Size
  let cellSize = 85;
  let gridX = width / 2 - 70;
  let gridY = height / 2 - 350;

  // Check if mouse is inside the grid
  if (mouseX >= gridX && 
      mouseX < gridX + cellSize * 9 &&
      mouseY >= gridY &&
      mouseY < gridY + cellSize * 9) {
    // Calculate the column and row
    selectedCol = floor((mouseX - gridX) / cellSize);
    selectedRow = floor((mouseY - gridY) / cellSize);
  }
}


// Let User Enter and Delete Numbers (Not the Helper Numbers)
function keyPressed() {
  if (selectedRow !== -1 && selectedCol !== -1) {       // Allow to input only if cell is selected
    if (fixedGrid[selectedRow][selectedCol] === 0) {    // Only let user edit if NOT a helper number

      // Enter Numbers 1 - 9
      if (key >= 1 && key <= 9) {        
        // Place number only if move follows the Sudoku rules
        let num = int(key);     // Comverts text to number
        if (isValidMove(selectedRow, selectedCol, num)) {
          currentGrid[selectedRow][selectedCol] = num;
        }
      }

      // Delete Numbers (Backspace and Delete)
      if (keyCode === BACKSPACE || keyCode === DELETE) {
        currentGrid[selectedRow][selectedCol] = 0;
      }       
    }
  }
}