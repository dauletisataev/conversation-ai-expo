import React, { useState, useRef, useEffect } from "react";
import {
  View,
  SafeAreaView,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import ConfettiCannon from "react-native-confetti-cannon";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

import { QuizGameScreenNavigationProp } from "./types";
import { QUESTIONS } from "./utils/constants";
import {
  Header,
  QuizContent,
  Feedback,
  OptionsGrid,
  ActionButton,
  MicrophoneButton,
  PronunciationPlayback,
  UserAudioPlayback,
} from "./components";
import {
  checkSingleOptionCorrectness,
  checkAllSelectionsCorrect,
  updateSelectedOptions,
  areTextsSimilar,
} from "./utils/optionHandlers";
import { styles } from "./styles";
import { ELEVENLABS_API_KEY } from "@env";

const { width } = Dimensions.get("window");

export default function QuizGameScreen() {
  const navigation = useNavigation<QuizGameScreenNavigationProp>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<ConfettiCannon>(null);
  const [optionStatuses, setOptionStatuses] = useState<
    Record<string, "correct" | "incorrect" | null>
  >({});
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [userAudioUri, setUserAudioUri] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    "Inter-Regular": Inter_400Regular,
    "Inter-Medium": Inter_500Medium,
    "Inter-SemiBold": Inter_600SemiBold,
    "Inter-Bold": Inter_700Bold,
  });

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const isSynonymsQuestion = currentQuestion.type === "synonyms";
  const isPronunciationQuestion = currentQuestion.type === "pronunciation";
  const maxSelections = isSynonymsQuestion ? 3 : 1;

  // Function to get the category label based on question type and content
  const getCategoryLabel = (): string => {
    const { type, content, highlightedWord } = currentQuestion;

    switch (type) {
      case "synonyms":
        // Check if it's an antonym question by looking at the content
        if (content.includes("antonym") || highlightedWord === "generous") {
          return "ANTONYMS";
        }
        return "SYNONYMS";

      case "pronunciation":
        return "PRONUNCIATION";

      case "correct-word":
        // Check for different types of vocabulary questions
        if (content.includes("'bite the bullet'")) {
          return "IDIOMS";
        } else if (content.includes("_____")) {
          return "GRAMMAR";
        } else if (content.includes("ubiquitous")) {
          return "VOCABULARY";
        }
        return "VOCABULARY";

      default:
        return "VOCABULARY";
    }
  };

  useEffect(() => {
    if (showConfetti) {
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
    }
  }, [showConfetti]);

  if (!fontsLoaded) {
    return null;
  }

  const handleOptionPress = (option: string) => {
    if (isCorrect !== null && isCorrect) return;

    let newSelectedOptions = updateSelectedOptions(
      selectedOptions,
      option,
      maxSelections,
      isSynonymsQuestion
    );

    let newOptionStatuses = { ...optionStatuses };

    if (selectedOptions.includes(option)) {
      newOptionStatuses[option] = null;
    } else {
      const isOptionCorrect = checkSingleOptionCorrectness(
        option,
        currentQuestion
      );
      newOptionStatuses[option] = isOptionCorrect ? "correct" : "incorrect";

      if (!isSynonymsQuestion) {
        if (isOptionCorrect) {
          setIsCorrect(true);
          setShowConfetti(true);
        } else {
          setIsCorrect(false);
        }
      }
    }

    setSelectedOptions(newSelectedOptions);
    setOptionStatuses(newOptionStatuses);

    if (isSynonymsQuestion && newSelectedOptions.length === maxSelections) {
      const allCorrect = checkAllSelectionsCorrect(
        newSelectedOptions,
        currentQuestion
      );

      if (allCorrect) {
        setIsCorrect(true);
        setShowConfetti(true);
      } else {
        setIsCorrect(false);
      }
    }
  };

  const handleRecordingComplete = (text: string, audioUri: string | null) => {
    if (!text) {
      setTranscribedText("");
      setUserAudioUri(audioUri);
      return;
    }

    setTranscribedText(text);
    setUserAudioUri(audioUri);

    // Get the correct pronunciation from the current question
    // For pronunciation questions, the highlighted word is what we want
    const correctPronunciation =
      currentQuestion?.type === "pronunciation"
        ? currentQuestion?.highlightedWord || ""
        : currentQuestion?.correctAnswers?.[0] || "";

    // Compare the transcribed text with the correct answer using fuzzy matching
    // First, normalize both strings (lowercase, remove punctuation, normalize spacing)
    const normalizedTranscribed = text
      .toLowerCase()
      .replace(/[.,!?;:'"()\[\]{}]/g, "")
      .trim()
      .replace(/\s+/g, " ");

    const normalizedCorrect = correctPronunciation
      .toLowerCase()
      .replace(/[.,!?;:'"()\[\]{}]/g, "")
      .trim()
      .replace(/\s+/g, " ");

    // Use both exact matching and fuzzy matching
    const exactMatch = normalizedTranscribed === normalizedCorrect;
    const fuzzyMatch = areTextsSimilar(text, correctPronunciation, 0.85);

    // Consider correct if either exact match or fuzzy match is successful
    const isCorrect = exactMatch || fuzzyMatch;

    // Update state
    setIsCorrect(isCorrect);

    // Show confetti if correct
    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOptions([]);
      setIsCorrect(null);
      setOptionStatuses({});
      setTranscribedText("");
      setUserAudioUri(null);
    } else {
      navigation.goBack();
    }
  };

  // Function to retry pronunciation
  const retryPronunciation = () => {
    setIsCorrect(null);
    setTranscribedText("");
    setUserAudioUri(null);
  };

  // Render audio playback buttons
  const renderAudioPlaybackButtons = () => {
    if (!isPronunciationQuestion || isRecording || isCorrect === null)
      return null;

    return (
      <View style={styles.audioPlaybackContainer}>
        {userAudioUri && <UserAudioPlayback audioUri={userAudioUri} />}
        <PronunciationPlayback
          word={currentQuestion.highlightedWord}
          elevenlabsApiKey={ELEVENLABS_API_KEY}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#0F172A", "#1E293B"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <Header
        navigation={navigation}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={QUESTIONS.length}
      />

      <Text style={styles.categoryLabel}>{getCategoryLabel()}</Text>

      <View style={styles.quizCard}>
        <QuizContent question={currentQuestion} />

        <Feedback
          isCorrect={isCorrect}
          explanation={currentQuestion.explanation}
        />

        {renderAudioPlaybackButtons()}

        {isPronunciationQuestion ? (
          <MicrophoneButton
            onRecordingComplete={handleRecordingComplete}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            elevenlabsApiKey={ELEVENLABS_API_KEY}
            isCorrect={isCorrect}
            transcribedText={transcribedText}
            expectedText={currentQuestion.highlightedWord}
          />
        ) : (
          <OptionsGrid
            options={currentQuestion.options}
            selectedOptions={selectedOptions}
            optionStatuses={optionStatuses}
            onOptionPress={handleOptionPress}
          />
        )}
      </View>

      <ActionButton
        isCorrect={isCorrect}
        isSynonymsQuestion={isSynonymsQuestion}
        isPronunciationQuestion={isPronunciationQuestion}
        maxSelections={maxSelections}
        onNextQuestion={nextQuestion}
      />

      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: width / 2, y: 0 }}
          autoStart={true}
          fadeOut={true}
          ref={confettiRef}
        />
      )}

      <StatusBar style="light" />
    </SafeAreaView>
  );
}
