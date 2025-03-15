import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ChatMessage, Message } from "./components/ChatMessage";
import { useState } from "react";
import { Platform } from "react-native";
import tools from "./utils/tools";
import ConvAiDOMComponent from "./components/ConvAI";
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);

  const [fontsLoaded] = useFonts({
    "Inter-Regular": Inter_400Regular,
    "Inter-Bold": Inter_700Bold,
  });

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
          <Text style={styles.tutorTitle}>AI Tutor Features:</Text>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>
              Interactive learning sessions
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>Voice-guided explanations</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>Personalized assistance</Text>
          </View>
        </View>
        <View style={styles.domComponentContainer}>
          <ConvAiDOMComponent
            dom={{ style: styles.domComponent }}
            platform={Platform.OS}
            get_battery_level={tools.get_battery_level}
            change_brightness={tools.change_brightness}
            flash_screen={tools.flash_screen}
            onMessage={(message) => {
              setMessages((prev) => [message, ...prev]);
            }}
          />
        </View>
      </View>

      <View style={styles.chatContainer}>
        <ScrollView
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
        </ScrollView>
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
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
});
