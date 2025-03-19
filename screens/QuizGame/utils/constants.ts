import { Question } from "../types";

// Sample questions data
export const QUESTIONS: Question[] = [
  // Question 1: Vocabulary question
  {
    type: "correct-word",
    question: "Choose the correct meaning",
    content: "The word 'ubiquitous' means:",
    options: [
      "Rare and unusual",
      "Present everywhere",
      "Extremely beautiful",
      "Incredibly fast",
    ],
    correctAnswers: ["Present everywhere"],
    explanation:
      "Ubiquitous means existing or being everywhere at the same time; constantly encountered; widespread.",
    highlightedWord: "",
  },

  // Question 2: Synonyms question
  {
    type: "synonyms",
    question: "Select 3 synonyms for the word",
    content: "The speaker was very",
    highlightedWord: "courageous",
    options: ["Brave", "Timid", "Fearless", "Cowardly", "Valiant", "Anxious"],
    correctAnswers: ["Brave", "Fearless", "Valiant"],
    explanation:
      "Courageous means not deterred by danger or pain; brave. Its synonyms include brave, fearless, and valiant.",
  },

  // Question 3: Pronunciation question
  {
    type: "pronunciation",
    question: "Pronounce this word correctly",
    content: "Say the word highlighted in blue",
    options: [],
    correctAnswers: ["entrepreneur"],
    explanation:
      "An entrepreneur is a person who organizes and operates a business, taking on greater than normal financial risks.",
    highlightedWord: "entrepreneur",
  },

  // Question 4: Idiom question
  {
    type: "correct-word",
    question: "What does this idiom mean?",
    content: "To 'bite the bullet' means:",
    options: [
      "To accept something difficult",
      "To make a mistake",
      "To eat very quickly",
      "To speak without thinking",
    ],
    correctAnswers: ["To accept something difficult"],
    explanation:
      "To 'bite the bullet' means to accept or endure a painful or otherwise unpleasant situation that is unavoidable.",
    highlightedWord: "",
  },

  // Question 5: Fill-in-the-blank grammar question
  {
    type: "correct-word",
    question: "Choose the correct word",
    content: "If I _____ known earlier, I would have told you.",
    options: ["have", "had", "would have", "would had"],
    correctAnswers: ["had"],
    explanation:
      "In conditional sentences expressing past unreal conditions, we use 'had + past participle' in the if-clause.",
    highlightedWord: "",
  },

  // Question 6: Pronunciation of challenging word
  {
    type: "pronunciation",
    question: "Pronounce this word correctly",
    content: "Say the word highlighted in blue",
    options: [],
    correctAnswers: ["worcestershire"],
    explanation:
      "Worcestershire is a county in England and also a type of sauce. It's pronounced as 'WUSS-ter-sher'.",
    highlightedWord: "worcestershire",
  },

  // Question 7: Antonyms question
  {
    type: "synonyms",
    question: "Select 3 antonyms for the word",
    content: "She is known for being very",
    highlightedWord: "generous",
    options: [
      "Stingy",
      "Benevolent",
      "Greedy",
      "Charitable",
      "Selfish",
      "Kind",
    ],
    correctAnswers: ["Stingy", "Greedy", "Selfish"],
    explanation:
      "Generous means showing a readiness to give more than is necessary. Its antonyms include stingy, greedy, and selfish.",
  },
];
