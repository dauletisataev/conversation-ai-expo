import React from "react";
import { View, Text, Pressable } from "react-native";
import { Check } from "lucide-react-native";
import { styles } from "../styles";

interface OptionsGridProps {
  options: string[];
  selectedOptions: string[];
  optionStatuses: Record<string, "correct" | "incorrect" | null>;
  onOptionPress: (option: string) => void;
}

export const OptionsGrid: React.FC<OptionsGridProps> = ({
  options,
  selectedOptions,
  optionStatuses,
  onOptionPress,
}) => {
  const getOptionStyle = (option: string) => {
    const isSelected = selectedOptions.includes(option);
    const optionStatus = optionStatuses[option];

    if (isSelected) {
      if (optionStatus === "correct") {
        return styles.correctOption;
      } else if (optionStatus === "incorrect") {
        return styles.incorrectOption;
      } else {
        return styles.selectedOption;
      }
    } else {
      return styles.option;
    }
  };

  const getOptionTextStyle = (option: string) => {
    const isSelected = selectedOptions.includes(option);
    return isSelected ? styles.selectedOptionText : styles.optionText;
  };

  return (
    <View style={styles.optionsGrid}>
      {Array.from({
        length: Math.ceil(options.length / 2),
      }).map((_, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.optionsRow}>
          {options
            .slice(rowIndex * 2, rowIndex * 2 + 2)
            .map((option, index) => (
              <Pressable
                key={index}
                style={[getOptionStyle(option), styles.optionItem]}
                onPress={() => onOptionPress(option)}
              >
                <Text style={getOptionTextStyle(option)}>{option}</Text>
              </Pressable>
            ))}
          {/* Add a placeholder if there's only one option in the last row */}
          {rowIndex * 2 + 1 >= options.length &&
            rowIndex * 2 < options.length && (
              <View style={styles.emptyOption} />
            )}
        </View>
      ))}
    </View>
  );
};
