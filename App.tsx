import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ChatMessage, Message } from "./components/ChatMessage";
import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";
import tools from "./utils/tools";
import ConvAiDOMComponent from "./components/ConvAI";
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export default function App() {
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
  const [displayedText, setDisplayedText] = useState<string>("");
  const [wordIndex, setWordIndex] = useState<number>(0);
  const [words, setWords] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Word reveal speed in milliseconds (adjust as needed)
  const WORD_REVEAL_SPEED = 200;

  const [fontsLoaded] = useFonts({
    "Inter-Regular": Inter_400Regular,
    "Inter-Bold": Inter_700Bold,
  });

  // Process new message
  useEffect(() => {
    if (currentMessage) {
      // Clear any existing animation
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Reset state for new message
      const messageWords = currentMessage.message.split(/\s+/);
      setWords(messageWords);
      setWordIndex(0);
      setDisplayedText("");
    }
  }, [currentMessage]);

  // Handle word animation
  useEffect(() => {
    if (words.length > 0) {
      // Start the animation timer
      timerRef.current = setInterval(() => {
        if (wordIndex < words.length) {
          setDisplayedText((prev) => {
            // Add a space unless it's the first word
            const spacer = prev.length ? " " : "";
            return prev + spacer + words[wordIndex];
          });
          setWordIndex(wordIndex + 1);
        } else {
          // Animation complete, clear timer
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
        }
      }, WORD_REVEAL_SPEED);

      // Clean up timer on unmount or when words change
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [words, wordIndex]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#0F172A", "#1E293B"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.topContent}>
        <Text style={styles.description}>
          Your personal AI tutor powered by ElevenLabs voice technology and Expo
          React Native.
        </Text>

        <View style={styles.tutorInfo}>
          <Text style={styles.tutorTitle}>
            Click the button below to call the AI tutor:
          </Text>
        </View>
        <View style={styles.domComponentContainer}>
          <ConvAiDOMComponent
            dom={{ style: styles.domComponent }}
            platform={Platform.OS}
            get_battery_level={tools.get_battery_level}
            change_brightness={tools.change_brightness}
            flash_screen={tools.flash_screen}
            onMessage={(message) => {
              setCurrentMessage(message);
            }}
          />
        </View>
      </View>

      <View style={styles.chatContainer}>
        <View style={styles.currentTextContainer}>
          <Text style={styles.currentText}>{displayedText}</Text>
          <View style={styles.cursorContainer}>
            {wordIndex < words.length && <Text style={styles.cursor}>|</Text>}
          </View>
        </View>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topContent: {
    paddingTop: 40,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  description: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#E2E8F0",
    textAlign: "center",
    maxWidth: 300,
    lineHeight: 24,
    marginBottom: 24,
  },
  tutorInfo: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    marginBottom: 24,
  },
  tutorTitle: {
    fontFamily: "Inter-Bold",
    fontSize: 18,
    color: "#E2E8F0",
    marginBottom: 16,
  },
  featureItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  featureText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#E2E8F0",
  },
  domComponentContainer: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  domComponent: {
    width: 120,
    height: 120,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  currentTextContainer: {
    padding: 20,
    width: "100%",
    maxWidth: 600,
    minHeight: 100,
    justifyContent: "center",
  },
  currentText: {
    fontFamily: "Inter-Regular",
    fontSize: 18,
    color: "#E2E8F0",
    lineHeight: 28,
    textAlign: "center",
  },
  cursorContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    alignSelf: "center",
  },
  cursor: {
    color: "#4B9EF9",
    fontSize: 24,
    opacity: 1,
  },
});
