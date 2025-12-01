// Major Project - Sudoku
// Rayyaan Chaghtai
// 
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"






function setup() {
  createCanvas(windowWidth, windowHeight);

}

function draw() {
  background("#e09db9ff");
  textAlign(LEFT, CENTER);
  fill("#2e351dff");
  textFont("Montserrat");

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


  let lineX = width / 2 - 425;
  line(lineX, 0, lineX, height);

  let cellSize = 80;
  let gridSize = cellSize * 9;
  let gridX = width / 2 - 300 + 225;
  let gridY = height / 2 - 300;

  // Draw Main Sudoku Grid
  for (let rows = 0; rows < 9; rows++) {
    for (let cols = 0; cols < 9; cols++) {
      fill("#8a8888ff");
      rect(gridX + cols * cellSize, gridY + rows * cellSize, cellSize, cellSize);
    }
  }

  // Make 3X3 lines thicker 
  strokeWeight(3);
  for (let i = 0; i < 9; i++) {
    line(gridX, gridY + i * cellSize, gridX + gridSize, gridY + i * cellSize);
  }
}


// https://projecteuler.net/resources/documents/0096_sudoku.txt 