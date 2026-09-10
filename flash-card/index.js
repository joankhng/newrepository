// This is main.py re-created in JavaScript, so the project can run in a web page.
// The real Python version lives next to this file: main.py
// The browser reads french_words.csv with fetch() instead of pandas, and since a
// web page cannot write words_to_learn.csv, the remaining words are kept in
// localStorage - the web equivalent of a small local file.

const FLIP_DELAY_MS = 3000;
const STORAGE_KEY = "flash_card_words_to_learn";

let to_learn = [];
let current_card = {};
let flip_timer = null;

const card = document.getElementById("card");
const cardImage = document.getElementById("card-image");
const cardTitle = document.getElementById("card-title");
const cardWord = document.getElementById("card-word");
const status = document.getElementById("status");

// pandas.read_csv("data/french_words.csv"), browser style
async function loadWords() {
  const text = await fetch("data/french_words.csv").then((r) => r.text());
  const lines = text.trim().split(/\r?\n/).slice(1); // skip the header row
  return lines.map((line) => {
    const [french, english] = line.split(",");
    return { French: french.trim(), English: english.trim() };
  });
}

// Try words_to_learn (saved progress) first, fall back to the full list
async function loadProgress() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  }
  return loadWords();
}

// DataFrame.to_csv("data/words_to_learn.csv"), browser style
function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(to_learn));
}

function updateStatus() {
  status.textContent = `${to_learn.length} words left to learn`;
}

function nextCard() {
  clearTimeout(flip_timer);

  if (to_learn.length === 0) {
    card.classList.remove("back");
    cardImage.src = "images/card_front.png";
    cardTitle.textContent = "Bravo!";
    cardWord.textContent = "All words learned";
    updateStatus();
    return;
  }

  current_card = to_learn[Math.floor(Math.random() * to_learn.length)];

  card.classList.remove("back");
  cardImage.src = "images/card_front.png";
  cardTitle.textContent = "French";
  cardWord.textContent = current_card.French;

  flip_timer = setTimeout(flipCard, FLIP_DELAY_MS);
  updateStatus();
}

function flipCard() {
  card.classList.add("back");
  cardImage.src = "images/card_back.png";
  cardTitle.textContent = "English";
  cardWord.textContent = current_card.English;
}

function isKnown() {
  to_learn = to_learn.filter((word) => word !== current_card);
  saveProgress();
  nextCard();
}

document.getElementById("unknown").addEventListener("click", nextCard);
document.getElementById("known").addEventListener("click", isKnown);
document.getElementById("reset-progress").addEventListener("click", async () => {
  localStorage.removeItem(STORAGE_KEY);
  to_learn = await loadWords();
  nextCard();
});

loadProgress().then((words) => {
  to_learn = words;
  nextCard();
});
