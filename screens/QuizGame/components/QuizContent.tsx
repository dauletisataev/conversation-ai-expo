import React from "react";
import { View, Text } from "react-native";
import { styles } from "../styles";
import { Question } from "../types";

interface QuizContentProps {
  question: Question;
}

export const QuizContent: React.FC<QuizContentProps> = ({ question }) => {
  // Display differently based on question type
  if (question.type === "pronunciation") {
    return (
      <>
        <Text style={styles.questionText}>{question.question}</Text>
        <View style={styles.contentText}>
          <Text
            style={[
              styles.contentText,
              styles.highlightedWord,
              { marginBottom: 0 },
            ]}
          >
            {question.highlightedWord}
          </Text>
        </View>
      </>
    );
  }

  // Default display for other question types
  return (
    <>
      <Text style={styles.questionText}>{question.question}</Text>
      <Text style={styles.contentText}>
        {question.content}{" "}
        <Text style={styles.highlightedWord}>{question.highlightedWord}</Text>
        {question.type === "synonyms" ? " audience." : ""}
      </Text>
    </>
  );
};
