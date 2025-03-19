import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../styles";

interface ActionButtonProps {
  isCorrect: boolean | null;
  isSynonymsQuestion: boolean;
  isPronunciationQuestion?: boolean;
  maxSelections: number;
  onNextQuestion: () => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  isCorrect,
  isSynonymsQuestion,
  isPronunciationQuestion = false,
  maxSelections,
  onNextQuestion,
}) => {
  if (isCorrect === null) {
    return (
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          {isPronunciationQuestion
            ? "Tap the microphone and pronounce the word"
            : isSynonymsQuestion
            ? `Select ${maxSelections} synonyms`
            : "Select the correct word"}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.bottomText}>
      {isCorrect && (
        <TouchableOpacity
          style={[styles.actionButton, styles.enabledButton]}
          onPress={onNextQuestion}
        >
          <Text style={styles.actionButtonText}>Next Question</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
