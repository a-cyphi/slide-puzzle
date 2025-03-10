class Game {
    cols = 4;
    rows = 4;
    count;
    blocks;
    emptyBlockCoords = [3, 3];
    indexes = [];
    moveCount = 0; // Track number of moves
    startTime = null; // Track start time of the game
    timerInterval = null; // Track the timer interval

    constructor() {
        this.count = this.cols * this.rows;
        this.blocks = Array.from(document.querySelectorAll('.puzzle-block'));
        this.init();
        window.addEventListener("resize", () => this.updateBlockPositions());

        // Add event listener for the New Game button
        document.getElementById("new-game-btn").addEventListener("click", () => this.resetGame());
    }

    init() {
        // Reset the indexes array
        this.indexes = [];
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                let blockIDx = x + y * this.cols;
                let block = this.blocks[blockIDx];

                if (block) {
                    this.positionBlockAtCoord(blockIDx, x, y);
                    // Remove existing event listeners and add a new one
                    block.removeEventListener('click', this.handleBlockClick);
                    block.addEventListener('click', this.handleBlockClick.bind(this, blockIDx));
                    this.indexes.push(blockIDx);
                } else {
                    this.indexes.push(null); // The empty space
                }
            }
        }

        this.emptyBlockCoords = [3, 3]; // Reset empty slot
        this.moveCount = 0; // Reset move counter
        this.updateMoveCounter(); // Update move counter display
        this.startTimer(); // Start the timer
        this.randomize(100); // Randomize the puzzle
    }

    resetGame() {
        window.location.reload();
    }
    

    startTimer() {
        this.startTime = Date.now(); // Record the start time
        this.timerInterval = setInterval(() => this.updateTimer(), 1000); // Update timer every second
    }

    stopTimer() {
        clearInterval(this.timerInterval); // Stop the timer
    }

    updateTimer() {
        const currentTime = Math.floor((Date.now() - this.startTime) / 1000); // Calculate elapsed time in seconds
        document.getElementById("timer").textContent = currentTime; // Update the timer display
    }

    updateMoveCounter() {
        const moveCounterElement = document.getElementById("move-counter");
        if (moveCounterElement) {
            moveCounterElement.textContent = this.moveCount; // Update the move counter display
        }
    }

    randomize(iterationCount) {
        let randomMoves = 0;
        for (let i = 0; i < iterationCount; i++) {
            let neighbors = this.getMovableBlocks();
            let randomBlockIdx = neighbors[Math.floor(Math.random() * neighbors.length)];
            if (this.moveBlock(randomBlockIdx, true)) {
                randomMoves++;
            }
        }
        console.log(`Randomized with ${randomMoves} moves`);
    }

    getMovableBlocks() {
        let [ex, ey] = this.emptyBlockCoords;
        let possibleMoves = [];

        if (ex > 0) possibleMoves.push(this.indexes[ex - 1 + ey * this.cols]);
        if (ex < this.cols - 1) possibleMoves.push(this.indexes[ex + 1 + ey * this.cols]);
        if (ey > 0) possibleMoves.push(this.indexes[ex + (ey - 1) * this.cols]);
        if (ey < this.rows - 1) possibleMoves.push(this.indexes[ex + (ey + 1) * this.cols]);

        return possibleMoves.filter(idx => idx !== null);
    }

    moveBlock(blockIdx, isRandomMove = false) {
        let blockCoords = this.canMoveBlock(blockIdx);
        if (!blockCoords) return false;

        let emptyIdx = this.emptyBlockCoords[0] + this.emptyBlockCoords[1] * this.cols;
        let clickedIdx = blockCoords[0] + blockCoords[1] * this.cols;

        // Swap positions visually
        this.positionBlockAtCoord(blockIdx, this.emptyBlockCoords[0], this.emptyBlockCoords[1]);

        // Swap indexes in the array
        [this.indexes[emptyIdx], this.indexes[clickedIdx]] = [this.indexes[clickedIdx], this.indexes[emptyIdx]];

        this.emptyBlockCoords = [...blockCoords]; // Update empty block position

        // Increment move count only if it's not a random move
        if (!isRandomMove) {
            this.moveCount++; // Increment move counter
            this.updateMoveCounter(); // Update move counter display
        }
        return true;
    }

    canMoveBlock(blockIdx) {
        let [ex, ey] = this.emptyBlockCoords;
        let blockNum = this.indexes.indexOf(blockIdx);
        let x = blockNum % this.cols;
        let y = Math.floor(blockNum / this.cols);

        if ((x === ex && Math.abs(y - ey) === 1) || (y === ey && Math.abs(x - ex) === 1)) {
            return [x, y];
        }
        return null;
    }

    positionBlockAtCoord(blockIdx, x, y) {
        let block = this.blocks[blockIdx];
        if (!block) return;

        let container = document.getElementById("puzzle-container");
        let size = container.clientWidth / this.cols;

        block.style.width = size + "px";
        block.style.height = size + "px";
        block.style.left = (x * size) + "px";
        block.style.top = (y * size) + "px";
    }

    updateBlockPositions() {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                let blockIDx = x + y * this.cols;
                this.positionBlockAtCoord(blockIDx, x, y);
            }
        }
    }

    handleBlockClick(blockIdx) {
        if (this.moveBlock(blockIdx, false) && this.checkPuzzleSolved()) {
            this.stopTimer(); // Stop the timer when the puzzle is solved
    
            // Calculate the final game time
            const currentTime = Math.floor((Date.now() - this.startTime) / 1000);
    
            setTimeout(() => {
                alert("Puzzle Solved!\nTime spent on current game in seconds: " + currentTime + 
                      "\nNumber of moves: " + this.moveCount +
                      "\nPress 'New Game' if you would like to play again!");
            }, 600);
        }
    }
    

    checkPuzzleSolved() {
        return this.indexes.every((val, idx) => val === idx || val === null);
    }
}

window.onload = () => new Game();