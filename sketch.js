// Major Project - Sudoku
// Rayyaan Chaghtai
// 
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"


let puzzleLines;
let puzzles = [];

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
      puzzles.push([tempPuzzle]);       // Stores the Puzzle
      tempPuzzle = [];
    }
  }

  // Select a Random Puzzle from the text file
  let index = floor(random(puzzles.length));
  chosenPuzzle = puzzles[index];
  console.log(chosenPuzzle);


  // Convert the puzzle numbers into the 9x9 Grid
  currentGrid = convertToGrid(chosenPuzzle);
  console.table(currentGrid);
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
}


// Convert the puzzle number into the 9x9 grid
function convertToGrid() {
  let grid = [];

  for (let i = 0; i < 9; i++) {
    let row = [];
    for (let j = 0; j < 9; j++) {
      row.push(puzzleLines[i][j]);
    }
    grid.push[row];
  }
  return grid;
}