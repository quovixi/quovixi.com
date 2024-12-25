const words = [
    "row", "exchange", "scrap", "clash", 
    "finish", "bass", "tan", "bottom",        
    "aisle", "yule", "heal", "wheel",
    "column", "feature", "review", "splash"
];

const groups = [
    { words: ["row", "exchange", "scrap", "clash"], description: "Words for quarrel" },
    { words: ["finish", "bass", "tan", "bottom"], description: "_______ line" },
    { words: ["aisle", "yule", "heal", "wheel"], description: "Pronoun homophones (e.g. I'll)" },
    { words: ["column", "feature", "review", "splash"], description: "Types of newspaper article" }
];

let shuffledWords = [];
const selectedCards = new Set();
const correctGuessedWords = new Set();
let incorrectGuesses = 0;

const gameElement = document.getElementById("game");
const feedbackElement = document.getElementById("feedback");
const correctGroupsElement = document.getElementById("correct-groups");
const incorrectCounterElement = document.getElementById("incorrect-counter");

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function initializeGame() {
    shuffledWords = words.filter(word => !correctGuessedWords.has(word));
    shuffle(shuffledWords);

    gameElement.innerHTML = "";

    feedbackElement.textContent = "";
    selectedCards.clear();

    shuffledWords.forEach(word => {
        const card = document.createElement("div");
        card.textContent = word;
        card.className = "card";
        card.addEventListener("click", () => toggleSelection(card));
        gameElement.appendChild(card);
    });
}

function toggleSelection(card) {
    const word = card.textContent;
    if (selectedCards.has(word)) {
        selectedCards.delete(word);
        card.classList.remove("selected");
    } else if (selectedCards.size < 4) {
        selectedCards.add(word);
        card.classList.add("selected");
    }
}

function clearSelections() {
    Array.from(gameElement.children).forEach(card => card.classList.remove("selected"));
    selectedCards.clear();
}

function updateIncorrectCounter() {
    const incorrectCounterContainer = document.getElementById("incorrect-counter-container");
    if (incorrectGuesses > 0) {
        incorrectCounterContainer.style.display = "block";
    } else {
        incorrectCounterContainer.style.display = "none";
    }
    incorrectCounterElement.textContent = `Incorrect guesses: ${incorrectGuesses}`;
}

function updateCorrectGroups() {
    const correctGroupsContainer = document.getElementById("correct-groups-container");
    if (correctGuessedWords.size > 0) {
        correctGroupsContainer.style.display = "block";
    } else {
        correctGroupsContainer.style.display = "none";
    }
}

function checkGroup() {
    const selectedArray = Array.from(selectedCards);

    if (selectedArray.length < 4) {
        feedbackElement.textContent = "Select exactly 4 cards!";
        clearSelections();
        return;
    }

    const oneAwayGroup = groups.find(group => {
        const correctWords = selectedArray.filter(word => group.words.includes(word));
        const incorrectWords = selectedArray.filter(word => !group.words.includes(word));
        return correctWords.length === 3 && incorrectWords.length === 1;
    });

    if (oneAwayGroup) {
        feedbackElement.textContent = "One away!";
        incorrectGuesses++;
        updateIncorrectCounter();
        clearSelections();
        return;
    }

    const groupMatch = groups.find(group => group.words.every(word => selectedArray.includes(word)));

    if (groupMatch) {
        feedbackElement.textContent = "That's a group!";
        const groupElement = document.createElement("div");
        groupElement.className = "group";
        groupElement.innerHTML = `<strong>${groupMatch.description}</strong><span>${groupMatch.words.join(", ")}</span>`;
        correctGroupsElement.appendChild(groupElement);

        selectedArray.forEach(word => {
            correctGuessedWords.add(word);
            const card = Array.from(gameElement.children).find(c => c.textContent === word);
            if (card) {
                gameElement.removeChild(card);
            }
        });

        updateCorrectGroups();
        checkGameCompletion();

    } else {
        feedbackElement.textContent = "Not a group!";
        incorrectGuesses++;
        updateIncorrectCounter();
    }

    clearSelections();
}

function checkGameCompletion() {
    const totalWords = groups.reduce((sum, group) => sum + group.words.length, 0);
    if (correctGuessedWords.size === totalWords) {
        document.getElementById("controls").style.display = "none";
        feedbackElement.textContent = "Congratulations! You're super smart and good-looking!";
    }
}

document.getElementById("check").addEventListener("click", checkGroup);
document.getElementById("shuffle").addEventListener("click", initializeGame);
document.getElementById("clear").addEventListener("click", clearSelections);

initializeGame();
updateIncorrectCounter();
updateCorrectGroups();
