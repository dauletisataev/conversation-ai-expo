import { Question } from "../types";

export const checkSingleOptionCorrectness = (
  option: string,
  currentQuestion: Question
): boolean => {
  return currentQuestion.correctAnswers.includes(option);
};

export const checkAllSelectionsCorrect = (
  selectedOptions: string[],
  currentQuestion: Question
): boolean => {
  return (
    selectedOptions.every((option) =>
      currentQuestion.correctAnswers.includes(option)
    ) && selectedOptions.length === currentQuestion.correctAnswers.length
  );
};

export const updateSelectedOptions = (
  currentSelected: string[],
  option: string,
  maxSelections: number,
  isSynonymsQuestion: boolean
): string[] => {
  let newSelectedOptions = [...currentSelected];

  if (newSelectedOptions.includes(option)) {
    // If already selected, deselect it
    newSelectedOptions = newSelectedOptions.filter((item) => item !== option);
  } else if (isSynonymsQuestion) {
    // For synonyms questions (multiple selection allowed)
    if (newSelectedOptions.length < maxSelections) {
      newSelectedOptions.push(option);
    }
  } else {
    // For single selection questions
    newSelectedOptions = [option];
  }

  return newSelectedOptions;
};

/**
 * Calculate the Levenshtein distance between two strings
 * This measures how many single character operations (insertions, deletions, substitutions)
 * are needed to change one string into another
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // Increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // Increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Check if two texts are similar using Levenshtein distance
 * Returns true if similarity is above the threshold
 */
export function areTextsSimilar(
  text1: string,
  text2: string,
  threshold = 0.85
): boolean {
  // Normalize both texts
  const normalizedText1 = text1
    .toLowerCase()
    .replace(/[.,!?;:'"()\[\]{}]/g, "")
    .trim()
    .replace(/\s+/g, " ");

  const normalizedText2 = text2
    .toLowerCase()
    .replace(/[.,!?;:'"()\[\]{}]/g, "")
    .trim()
    .replace(/\s+/g, " ");

  // Exact match check first
  if (normalizedText1 === normalizedText2) {
    return true;
  }

  // For very short strings, be more strict
  if (normalizedText1.length < 3 || normalizedText2.length < 3) {
    return normalizedText1 === normalizedText2;
  }

  // Calculate Levenshtein distance
  const distance = levenshteinDistance(normalizedText1, normalizedText2);

  // Calculate similarity as a ratio (1 - distance/maxLength)
  // This gives us a value between 0 and 1, where 1 is perfect match
  const maxLength = Math.max(normalizedText1.length, normalizedText2.length);
  const similarity = 1 - distance / maxLength;

  return similarity >= threshold;
}
