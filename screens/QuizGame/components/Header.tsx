import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { styles } from "../styles";
import { QuizGameScreenNavigationProp } from "../types";

interface HeaderProps {
  navigation: QuizGameScreenNavigationProp;
  currentQuestionIndex: number;
  totalQuestions: number;
}

export const Header: React.FC<HeaderProps> = ({
  navigation,
  currentQuestionIndex,
  totalQuestions,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft color="#E2E8F0" size={24} />
      </TouchableOpacity>

      <View style={styles.stepper}>
        {Array.from({ length: totalQuestions }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.stepIndicator,
              index <= currentQuestionIndex
                ? styles.activeStep
                : styles.inactiveStep,
            ]}
          />
        ))}
      </View>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
};
