// Major Project - Sudoku
// Rayyaan Chaghtai
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"


// GLOBAL VARIABLES
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

// Top buttons
let clearX, clearY, clearW, clearH;
let revealX, revealY, revealW, revealH;
let newX, newY, newW, newH;
let undoX, undoY, undoW, undoH;
let pauseX, pauseY, pauseW, pauseH;

// Difficulty buttons
let easyX, easyY, easyW, easyH;
let hardX, hardY, hardW, hardH;

let board;                              // Main board
let moveHistory = [];                   // Stores player moves for Undo

// Timer (Hard mode)
let hardTimeLimit = 600;
let timeStart = 0;
let timeLeft = hardTimeLimit;

// Pause system
let isPaused = false;
let pausedTimeLeft = 0;

// Mistake limit (Hard mode)
let hardMistakeLimit = 5;

// Sound effects
let clickSound;
let correctSound;
let mistakeSound;
let victorySound;
let defeatSound;

// Prevent repeating win/lose sounds
let playedVictory = false;
let playedDefeat = false;


// Loads the text/sound files before sketch starts
function preload() {
  // Puzzle and Solution text files
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
    tempPuzzle.push(line);

    if (tempPuzzle.length === 9) {
      puzzles.push(tempPuzzle.concat());
      tempPuzzle = [];
    }
  }

  // Read Hard Solutions
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

  // Creates the board and pulls its grids into the global variables
  board = new SudokuBoard(puzzles, solutions);
  copyBoardToGame();

  timeStart = millis();       // Start timer and reset game flags
  timeLeft = hardTimeLimit;
  moveHistory = [];
  gameOver = false;
  gameWon = false;

  playedVictory = false;    // Reset sound flags
  playedDefeat = false;

  isPaused = true;                 // start paused 
  pausedTimeLeft = timeLeft;       // store current timeLeft
  cellLocked = true;               // lock grid input
  selectedRow = -1;                // no selected cell
  selectedCol = -1;
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

  // --- UI Drawing starts here ---
  // (We’re not making new functions yet, just keeping it readable)

  // Text Styling (default)
  textAlign(LEFT, CENTER);
  fill("#2e351dff");
  textFont("Montserrat");
  noStroke();

  // LEFT PANEL (Instructions + Tips)
  textSize(100);
  text("SUDOKU", width / 2 - 900, 80);

  textSize(45);
  text("HOW TO PLAY", width / 2 - 900, 160);

  textSize(23);
  text(
    "To complete the Sudoku grid\n" +
    "Enter numbers into the blank spaces\n" +
    "So that each row, column, and 3x3 box\n" +
    "Contains the numbers 1-9 without repetition.\n" +
    "Click a cell, then press a number (1-9) to enter it.\n" +
    "Press BACKSPACE or DELETE to clear a cell.\n" +
    "The game starts paused.\n" +
    "Press RESUME to begin playing.",
    width / 2 - 900, 300);

  textSize(45);
  text("DIFFICULTY LEVELS", width / 2 - 900, 460);

  // Show selected difficulty
  textSize(35);
  fill(0);
  text("Selected: " + difficulty, width / 2 - 900, 520);

  // Difficulty button sizes and positions
  easyW = 170; easyH = 55;
  easyX = width / 2 - 900;
  easyY = 550;

  hardW = 170; hardH = 55;
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
  text("TIPS FOR SOLVING", width / 2 - 900, 660);

  textSize(23);
  text(
    "• Focus on rows, columns, and boxes:\n  Look for areas with only 1-2 empty cells.\n" +
    "• Don't guess, use logic:\n  Only place a number if it's the only possible choice.\n" +
    "• Scan the board:\n  Start with numbers that appear most often.",
    width / 2 - 900, 780
  );

  // Dividing Line
  stroke(0);
  strokeWeight(1);
  let lineX = width / 2 - 395;
  line(lineX, 0, lineX, height);

  // Button Sizes
  clearW = 210; clearH = 65;
  revealW = 230; revealH = clearH;
  newW = 210; newH = clearH;
  undoW = 160; undoH = clearH;
  pauseW = 160; pauseH = clearH;

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

  // Highlights Selected Row/Col/Box + same numbers
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

  // Pause overlay
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
  // Pause/Resume Button
  if (mouseX > pauseX &&
    mouseX < pauseX + pauseW &&
    mouseY > pauseY &&
    mouseY < pauseY + pauseH) {

    playClick();   // button click sound

    if (!gameWon && !gameOver) {    // don’t allow pausing after win or game over

      if (!isPaused) {      // PAUSE the game
        isPaused = true;
        pausedTimeLeft = timeLeft;   // remember remaining time

        selectedRow = -1;
        selectedCol = -1;
        cellLocked = true;           // lock the grid
      }
      else {      // RESUME the game
        isPaused = false;
        cellLocked = false;

        timeStart = millis() - (hardTimeLimit - pausedTimeLeft) * 1000;     // rebuild timer so it continues correctly
        timeLeft = pausedTimeLeft;
      }
    }
    return;
  }

  if (isPaused) {
    return;
  }      // block all other clicks while paused

  // Clear Button
  if (mouseX > clearX && mouseX < clearX + clearW &&
    mouseY > clearY && mouseY < clearY + clearH) {

    if (gameWon || gameOver) return;          // If the game already ended, don’t let Clear do anything

    playClick();        // Sound for clicking a button

    clearGame();        // Clears the board back to the starting puzzle
    return;
  }

  // Reveal Button
  if (mouseX > revealX && mouseX < revealX + revealW &&
    mouseY > revealY && mouseY < revealY + revealH) {

    if (gameWon || gameOver) return;          //  If the game already ended, don’t let Reveal do anything

    playClick();      // click sound
    revealAnswer();   // show the full solution
    return;
  }

  // New Puzzle Button
  if (mouseX > newX && mouseX < newX + newW &&
    mouseY > newY && mouseY < newY + newH) {

    playClick();   // click sound
    newPuzzle();   // loads a completely new puzzle
    return;
  }

  // UNDO Button
  if (mouseX > undoX && mouseX < undoX + undoW &&
    mouseY > undoY && mouseY < undoY + undoH) {

    if (gameWon || gameOver) return;

    playClick(); // button click sound

    if (moveHistory.length > 0) {         // Only undo if there’s actually something in history

      let move = moveHistory.pop();       // Take the most recent move and remove it from history

      currentGrid[move.row][move.col] = move.prevValue;   // Revert the cell back to what it was before that move

      selectedRow = move.row;       // Move selection back to the same cell (feels natural)
      selectedCol = move.col;

      cellLocked = false;           // Unlock so the player can type again

      board.updateMistakes();       // Recount mistakes and sync board data
      copyBoardToGame();

      gameWon = board.checkWin();   // After undo, re check if puzzle is still won/still over

      gameOver = (difficulty === "HARD" && board.mistakeCount >= hardMistakeLimit);
    }
    return;
  }

  // Select Cell in Grid
  let cellSize = 85;              // size of one cell
  let gridX = width / 2 - 70;     // grid starting X
  let gridY = height / 2 - 320;   // grid starting Y

  if (mouseX >= gridX && mouseX < gridX + cellSize * 9 &&       // If the click was inside the 9x9 grid area
    mouseY >= gridY && mouseY < gridY + cellSize * 9) {

    playClick();  // only play sound when clicking an actual cell

    let newCol = floor((mouseX - gridX) / cellSize);          // Convert mouse position into row/col numbers
    let newRow = floor((mouseY - gridY) / cellSize);

    if (newRow !== selectedRow || newCol !== selectedCol) {       // If user clicked a different cell, allow typing again
      cellLocked = false;
    }

    selectedCol = newCol;         // Save the selected cell
    selectedRow = newRow;

    return;
  }

  // Easy Button
  if (mouseX >= easyX && mouseX < easyX + easyW &&
    mouseY >= easyY && mouseY < easyY + easyH) {

    playClick(); // click sound

    difficulty = "EASY";          // Switch difficulty and load an easy puzzle set
    board.setPuzzle(easyPuzzles, easySolutions);
    copyBoardToGame();

    gameWon = false;          // Reset game state 
    gameOver = false;
    selectedRow = -1;
    selectedCol = -1;
    cellLocked = false;
    moveHistory = [];
    timeStart = millis();         // Reset timer and pause system 
    timeLeft = hardTimeLimit;
    isPaused = false;
    pausedTimeLeft = 0;
    playedVictory = false;        // Allow win/lose sounds to play again
    playedDefeat = false;

    return;
  }

  // Hard Button
  if (mouseX >= hardX && mouseX < hardX + hardW &&
    mouseY >= hardY && mouseY < hardY + hardH) {

    playClick();   // click sound

    difficulty = "HARD";        // Switch difficulty and load hard puzzles again
    board.setPuzzle(puzzles, solutions);
    copyBoardToGame();

    gameWon = false;      // Reset game state 
    gameOver = false;
    selectedRow = -1;
    selectedCol = -1;
    cellLocked = false;
    moveHistory = [];
    timeStart = millis();     // Reset timer and pause system for hard mode
    timeLeft = hardTimeLimit;
    isPaused = false;
    pausedTimeLeft = 0;
    playedVictory = false;      // Allow win/lose sounds to play again
    playedDefeat = false;

    return;
  }
}

// Let User Enter and Delete Numbers (Not the Helper Numbers)
function keyPressed() {

  if (gameWon || gameOver || isPaused) return;    // If the game is finished or paused, ignore all keyboard input

  if (selectedRow === -1 || selectedCol === -1) return; // If no cell is selected, do nothing

  if (fixedGrid[selectedRow][selectedCol] !== 0) return;  // If the selected cell is a fixed (given) number, block input

  if (cellLocked && key >= "1" && key <= "9") return;       // Prevent typing over a number unless the cell was reselected

  let prev = currentGrid[selectedRow][selectedCol];         // Store the current value before changing it (for undo)

  if (key >= "1" && key <= "9") {   // If a number key (1–9) is pressed
    let newVal = int(key);          // convert key to a number

    if (newVal !== prev) {      // Only record the move if the value actually changes
      moveHistory.push({
        row: selectedRow,
        col: selectedCol,
        prevValue: prev,
        newValue: newVal
      });

      if (newVal === solutionGrid[selectedRow][selectedCol]) {      // Play sound based on whether the number is correct or wrong
        playCorrect();
      } else {
        playMistake();
      }
    }

    currentGrid[selectedRow][selectedCol] = newVal;     // Place the number in the grid

    cellLocked = true;        // Lock the cell so it can’t be overwritten immediately

    updateMistakes();         // Recheck mistakes and win/lose conditions
  }

  if (keyCode === BACKSPACE || keyCode === DELETE) {      // If backspace or delete is pressed

    // Save the delete action for undo (only if the cell was not empty)
    if (prev !== 0) {
      moveHistory.push({
        row: selectedRow,
        col: selectedCol,
        prevValue: prev,
        newValue: 0
      });
    }

    currentGrid[selectedRow][selectedCol] = 0;      // Clear the selected cell

    cellLocked = false;   // Unlock the cell so a new number can be entered

    updateMistakes();
  }
}


function updateMistakes() {
  board.updateMistakes();                 // re check all cells for mistakes
  copyBoardToGame();                      // sync board data to main game grids

  if (difficulty === "HARD" && board.mistakeCount >= hardMistakeLimit) { // mistake limit reached
    gameOver = true;                      // end the game
    cellLocked = true;                    // stop further input
    selectedRow = -1;                     // clear selection
    selectedCol = -1;

    if (!playedDefeat && defeatSound && defeatSound.isLoaded()) { // play defeat sound once
      defeatSound.play();
      playedDefeat = true;
    }
    return;
  }

  if (board.checkWin()) {                 // check if puzzle is fully solved
    gameWon = true;                       // mark game as won
    selectedRow = -1;
    selectedCol = -1;
    cellLocked = true;                    // lock board after win

    if (!playedVictory && victorySound && victorySound.isLoaded()) { // play win sound once
      victorySound.play();
      playedVictory = true;
    }
  }
}

function clearGame() {
  board.clearCurrentPuzzle();             // reset grid to starting puzzle
  copyBoardToGame();

  gameWon = false;                        // reset win flag
  gameOver = false;
  cellLocked = false;                    // allow input again
  selectedRow = -1;                      // clear selection
  selectedCol = -1;
  moveHistory = [];                      // clear undo history
  isPaused = false;                      // make sure game is not paused
  pausedTimeLeft = 0;                    // reset paused timer value
  playedVictory = false;                 // allow sounds again
  playedDefeat = false;
}

function newPuzzle() {
  board.loadRandomPuzzle();               // load a completely new puzzle
  copyBoardToGame();

  gameWon = false;                        // reset game state
  gameOver = false;
  cellLocked = false;
  selectedRow = -1;
  selectedCol = -1;
  moveHistory = [];                      // reset undo history
  timeStart = millis();                  // restart timer
  timeLeft = hardTimeLimit;
  isPaused = false;                      // reset pause state
  pausedTimeLeft = 0;
  playedVictory = false;
  playedDefeat = false;
}

function revealAnswer() {
  board.revealAnswer();                  // fill grid with correct solution
  copyBoardToGame();

  cellLocked = true;                     // lock the grid (user can't edit)
  selectedRow = -1;                     // clear selection
  selectedCol = -1;
  gameWon = true;
  gameOver = false;
  moveHistory = [];
  timeStart = millis();                 // reset timer display
  timeLeft = hardTimeLimit;
  isPaused = false;
  pausedTimeLeft = 0;

  playedDefeat = false;                 // allow victory sound
  if (!playedVictory && victorySound && victorySound.isLoaded()) {
    victorySound.play();
    playedVictory = true;
  }
}


// Helper functions to not repeat the same code everywhere
function playClick() {
  if (clickSound && clickSound.isLoaded()) {   // make sure click sound exists and is loaded
    clickSound.play();                         // play click sound
  }
}

function playCorrect() {
  if (correctSound && correctSound.isLoaded()) { // check if correct sound is ready
    correctSound.play();                         // play correct number sound
  }
}

function playMistake() {
  if (mistakeSound && mistakeSound.isLoaded()) { // check if mistake sound is ready
    mistakeSound.play();                         // play wrong number sound
  }
}


// Turns the file lines into an array of 9 line grids
function readGrid(lines) {
  let all = [];            // stores all completed puzzles
  let temp = [];           // temporarily holds one puzzle (9 lines)

  for (let line of lines) {
    if (line[0] === "G") { // skip lines like "Grid 01"
      continue;
    }
    temp.push(line);       // add line to current puzzle

    if (temp.length === 9) { // once we have 9 lines
      all.push(temp.concat()); // save full puzzle
      temp = [];               // reset for next puzzle
    }
  }
  return all;              // return all puzzles
}

// Convert the puzzle numbers into the 9x9 grid
function convertToGrid(puzzle) {
  let grid = [];                    // final 9x9 number grid

  for (let i = 0; i < 9; i++) {     // loop through each row
    let rowArray = [];              // holds numbers for one row

    for (let j = 0; j < 9; j++) {   // loop through each column
      rowArray.push(int(puzzle[i][j])); // convert char to number and store it
    }

    grid.push(rowArray);            // add completed row to grid
  }

  return grid;                      // return the full grid
}

// Makes a copy of a 2D grid so the original puzzle cannot be changed
function copyGrid(grid) {
  let newGrid = [];        // new grid to avoid changing original
  for (let row = 0; row < 9; row++) {
    newGrid.push(grid[row].concat()); // copy each row
  }
  return newGrid;          // return the copied grid
}

// Pull board grids into global variables (so draw/input can use them easily)
function copyBoardToGame() {
  currentGrid = board.currentGrid;     // sync current grid
  solutionGrid = board.solutionGrid;   // sync solution grid
  fixedGrid = board.fixedGrid;         // sync fixed cells
  startGrid = board.startGrid;         // sync starting grid
  mistakeGrid = board.mistakeGrid;     // sync mistake tracking
}


// main logic of the sudoku board and data
class SudokuBoard {
  constructor(puzzles, solutions) {                   // runs once when you create the board
    this.puzzles = puzzles;                           // store all puzzle options (hard/easy set)
    this.solutions = solutions;                       // store matching solutions
    this.mistakeCount = 0;                            // total mistakes made so far
    this.difficulty = "hard";                         // default difficulty label
    this.loadRandomPuzzle();                          // instantly start with a random puzzle
  }

  loadRandomPuzzle() {                                      // picks a random puzzle and builds all grids
    let index = floor(random(this.puzzles.length));          // random puzzle index
    this.chosenPuzzle = this.puzzles[index];                 // the actual puzzle (9 lines)
    this.chosenSolution = this.solutions[index];             // matching solution (9 lines)

    this.currentGrid = convertToGrid(this.chosenPuzzle);     // player's working grid 
    this.solutionGrid = convertToGrid(this.chosenSolution);  // correct answer grid 

    this.fixedGrid = copyGrid(this.currentGrid);             // helper numbers that can’t be edited
    this.startGrid = copyGrid(this.currentGrid);             // original puzzle state (for Clear button)

    this.mistakeGrid = [];                                   // true/false grid for red mistake cells
    for (let r = 0; r < 9; r++) {
      let rowArray = [];
      for (let c = 0; c < 9; c++) {
        rowArray.push(false);                                // start with “not a mistake”
      }
      this.mistakeGrid.push(rowArray);                       // add completed row to mistakeGrid
    }

    this.mistakeCount = 0;                                   // reset mistakes when new puzzle loads
  }

  setDifficulty(level) {                                     // switches difficulty and reloads puzzle
    this.difficulty = level;                                 // save the new difficulty label
    this.loadRandomPuzzle();                                 // restart with a new puzzle
  }

  clearCurrentPuzzle() {                                     // resets board back to its starting puzzle
    this.currentGrid = copyGrid(this.startGrid);             // undo all player inputs
    this.fixedGrid = copyGrid(this.startGrid);               // reset the helper numbers too

    for (let r = 0; r < 9; r++) {                            // clear the red mistake marks
      for (let c = 0; c < 9; c++) {
        this.mistakeGrid[r][c] = false;                      // nothing is marked wrong anymore
      }
    }
  }

  revealAnswer() {                                           // fills board with the full solution
    this.currentGrid = copyGrid(this.solutionGrid);          // replace player grid with answer grid

    for (let r = 0; r < 9; r++) {                            // remove all red mistake marks
      for (let c = 0; c < 9; c++) {
        this.mistakeGrid[r][c] = false;                      // solved board shouldn’t show mistakes
      }
    }
  }

  isCorrectCell(row, col) {
    return this.currentGrid[row][col] === this.solutionGrid[row][col]; // compare against solution
  }

  checkWin() {                                               // checks if the entire board is solved
    for (let r = 0; r < 9; r++) {                            // check every cell
      for (let c = 0; c < 9; c++) {
        if (this.currentGrid[r][c] === 0) return false;      // still empty means not solved
        if (this.currentGrid[r][c] !== this.solutionGrid[r][c]) return false; // wrong value means not solved
      }
    }
    return true;                                             // every cell matches solution means win
  }

  updateMistakes() {                                         // updates red cells and counts new mistakes
    for (let r = 0; r < 9; r++) {                            // go through every cell
      for (let c = 0; c < 9; c++) {
        let value = this.currentGrid[r][c];                  // number currently in this cell

        if (value === 0 || this.fixedGrid[r][c] !== 0) {     // skip blanks and original “given” numbers
          this.mistakeGrid[r][c] = false;                    // those should never be red
          continue;                                          // move on to next cell
        }

        if (!this.isCorrectCell(r, c)) {                     // player enters wrong
          if (!this.mistakeGrid[r][c]) {                     // only count it if it wasn’t already wrong
            this.mistakeCount++;                             // add one to total mistakes
          }
          this.mistakeGrid[r][c] = true;                     // mark this cell red
        }
        else {                                               // player typed the correct number
          this.mistakeGrid[r][c] = false;                    // keep it normal color (black)
        }
      }
    }
  }

  setPuzzle(newPuzzles, newSolutions) {                      // swaps the puzzle set (easy vs hard)
    this.puzzles = newPuzzles;                               // replace puzzle list
    this.solutions = newSolutions;                           // replace solution list
    this.loadRandomPuzzle();                                 // restart with a random puzzle from new set
  }
}