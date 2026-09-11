// This is main.py + quiz_brain.py + ui.py re-created in JavaScript, so the
// project can run in a web page. The real Python version lives next to this
// file. Questions come from the Open Trivia Database, fetched here with
// fetch() instead of requests.get() in data.py.

const API_URL = "https://opentdb.com/api.php?amount=10&type=boolean&category=18";

// Used only if the API call fails (offline, rate-limited, etc.)
const FALLBACK_QUESTIONS = [
  { text: "The HTML5 standard was published in 2014.", answer: "True" },
  { text: "The first computer bug was formed by faulty wires.", answer: "False" },
  { text: "FLAC stands for 'Free Lossless Audio Condenser'.", answer: "False" },
  { text: "Linus Torvalds created Linux and Git.", answer: "True" },
  { text: "The programming language 'Python' is based off a modified version of 'JavaScript'.", answer: "False" },
  { text: "AMD created the first consumer 64-bit processor.", answer: "True" },
  { text: "'HTML' stands for Hypertext Markup Language.", answer: "True" },
  { text: "In most programming languages, the operator ++ is equivalent to the statement '+= 1'.", answer: "True" },
  { text: "The IBM PC used an Intel 8008 microprocessor clocked at 4.77 MHz and 8 kilobytes of memory.", answer: "False" },
  { text: "All program codes have to be compiled into an executable file in order to be run.", answer: "False" },
];

// html.unescape(), browser style
function unescapeHtml(text) {
  const box = document.createElement("textarea");
  box.innerHTML = text;
  return box.value;
}

// ---------------------------- quiz_brain.py ---------------------------- //
class QuizBrain {
  constructor(questionList) {
    this.question_number = 0;
    this.score = 0;
    this.question_list = questionList;
    this.current_question = null;
  }

  still_has_questions() {
    return this.question_number < this.question_list.length;
  }

  next_question() {
    this.current_question = this.question_list[this.question_number];
    this.question_number += 1;
    const q_text = unescapeHtml(this.current_question.text);
    return `Q.${this.question_number}: ${q_text}`;
  }

  check_answer(user_answer) {
    const correct_answer = this.current_question.answer;
    const is_right = user_answer.toLowerCase() === correct_answer.toLowerCase();
    if (is_right) {
      this.score += 1;
    }
    return is_right;
  }
}

// -------------------------------- ui.py -------------------------------- //
class QuizInterface {
  constructor(quizBrain) {
    this.quiz = quizBrain;
    this.scoreLabel = document.getElementById("score");
    this.card = document.getElementById("card");
    this.questionText = document.getElementById("question");
    this.trueButton = document.getElementById("true");
    this.falseButton = document.getElementById("false");
    this.timer = null;

    this.trueButton.addEventListener("click", () => this.true_pressed());
    this.falseButton.addEventListener("click", () => this.false_pressed());

    this.get_next_question();
  }

  get_next_question() {
    // Outside so that it always goes back to white
    this.card.classList.remove("right", "wrong");
    this.scoreLabel.textContent = `Score: ${this.quiz.score}`;
    if (this.quiz.still_has_questions()) {
      this.questionText.textContent = this.quiz.next_question();
      this.trueButton.disabled = false;
      this.falseButton.disabled = false;
    } else {
      this.questionText.textContent =
        `You've completed the quiz. Final score: ${this.quiz.score}/${this.quiz.question_number}`;
      this.trueButton.disabled = true;
      this.falseButton.disabled = true;
    }
  }

  true_pressed() {
    const is_right = this.quiz.check_answer("True");
    this.give_feedback(is_right);
  }

  false_pressed() {
    const is_right = this.quiz.check_answer("False");
    this.give_feedback(is_right);
  }

  give_feedback(is_right) {
    // block double-clicks during the 1 second flash
    this.trueButton.disabled = true;
    this.falseButton.disabled = true;
    this.card.classList.add(is_right ? "right" : "wrong");
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.get_next_question(), 1000);
  }
}

// ------------------------- data.py + main.py ------------------------- //
async function loadQuestions() {
  const hint = document.getElementById("hint");
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.results || data.results.length === 0) throw new Error("empty result");
    hint.textContent = "10 live computer-science questions from the Open Trivia Database. True or False?";
    return data.results.map((q) => ({ text: q.question, answer: q.correct_answer }));
  } catch (err) {
    hint.textContent = "Open Trivia Database not reachable, using a built-in question set instead. True or False?";
    return FALLBACK_QUESTIONS;
  }
}

loadQuestions().then((questionBank) => {
  const quiz = new QuizBrain(questionBank);
  new QuizInterface(quiz);
});
