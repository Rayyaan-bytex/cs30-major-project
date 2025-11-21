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
  background("#ce7e9fff");
  textAlign(LEFT, CENTER);
  fill("#2e351dff");
  textSize(70);
  textStyle(NORMAL);
  textFont("Montserrat");
  text("Sudoku", width / 2 - 875, height / 2 - 380);

  textSize(28);
  text("HOW TO PLAY", width / 2 - 900, height / 2 - 280);

  textSize(20);
  text("To complete the Sudoku grid\nEnter numbers into the blank spaces\nSo that each row, column, and 3x3 box\nContains the numbers 1 - 9 without repitition", 
    width / 2 - 900, height / 2 - 200);
}