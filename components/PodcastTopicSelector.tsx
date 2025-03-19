import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Sparkles } from "lucide-react-native";

// Suggested topics for the podcast
const SUGGESTED_TOPICS = [
  "Future of AI and its impact on society",
  "Space exploration and colonization",
  "Climate change solutions",
  "The future of work and remote collaboration",
  "Cryptocurrency and the future of finance",
  "Mental health in the digital age",
  "The ethics of technology",
  "Sustainable living and eco-friendly practices",
  "Education in the 21st century",
  "Social media and its influence on culture",
];

type Props = {
  onSelectTopic: (topic: string) => void;
};

export default function PodcastTopicSelector({ onSelectTopic }: Props) {
  const [customTopic, setCustomTopic] = useState("");

  const handleSelectSuggestion = (topic: string) => {
    setCustomTopic(topic);
    onSelectTopic(topic);
  };

  const handleSubmitCustomTopic = () => {
    if (customTopic.trim()) {
      onSelectTopic(customTopic.trim());
    }
  };

  const renderTopicItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.topicItem}
      onPress={() => handleSelectSuggestion(item)}
    >
      <Text style={styles.topicItemText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a Podcast Topic</Text>
      <Text style={styles.subtitle}>
        Select from our suggestions or create your own topic.
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={customTopic}
          onChangeText={setCustomTopic}
          placeholder="Enter a custom topic..."
          placeholderTextColor="#94A3B8"
          onSubmitEditing={handleSubmitCustomTopic}
          returnKeyType="go"
        />
        <TouchableOpacity
          style={[
            styles.submitButton,
            !customTopic.trim() && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitCustomTopic}
          disabled={!customTopic.trim()}
        >
          <Text style={styles.submitButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.suggestionsContainer}>
        <View style={styles.suggestionsHeader}>
          <Sparkles size={16} color="#94A3B8" />
          <Text style={styles.suggestionsTitle}>Suggested Topics</Text>
        </View>

        <FlatList
          data={SUGGESTED_TOPICS}
          renderItem={renderTopicItem}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.suggestionsList}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: "Inter-Bold",
    fontSize: 20,
    color: "#E2E8F0",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    paddingHorizontal: 16,
    color: "#E2E8F0",
    fontFamily: "Inter-Regular",
    marginRight: 12,
  },
  submitButton: {
    height: 48,
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "rgba(59, 130, 246, 0.3)",
  },
  submitButtonText: {
    fontFamily: "Inter-Bold",
    color: "white",
    fontSize: 14,
  },
  suggestionsContainer: {
    flex: 1,
  },
  suggestionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "#94A3B8",
    marginLeft: 8,
  },
  suggestionsList: {
    paddingBottom: 16,
  },
  topicItem: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  topicItemText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#E2E8F0",
  },
});
