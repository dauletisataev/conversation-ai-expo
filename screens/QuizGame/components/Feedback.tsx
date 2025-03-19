import React from "react";
import { View, Text } from "react-native";
import { Check } from "lucide-react-native";
import { styles } from "../styles";

interface FeedbackProps {
  isCorrect: boolean | null;
  explanation: string;
}

export const Feedback: React.FC<FeedbackProps> = ({
  isCorrect,
  explanation,
}) => {
  if (isCorrect === null) return null;

  return (
    <View style={styles.feedbackContainer}>
      {isCorrect && (
        <View style={styles.correctFeedback}>
          <View style={styles.checkIconContainer}>
            <Check size={16} color="#fff" />
          </View>
          <Text style={styles.correctText}>Correct!</Text>
        </View>
      )}

      {isCorrect && <Text style={styles.explanationText}>{explanation}</Text>}
    </View>
  );
};
