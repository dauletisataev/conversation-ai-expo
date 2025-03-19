import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { ArrowLeft, Mic, Play, Pause } from "lucide-react-native";
import api, { ConversationMessage } from "../utils/api";
import { Audio } from "expo-av";

type ConversationSimulatorScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ConversationSimulator"
>;

type ConversationSimulatorScreenRouteProp = RouteProp<
  RootStackParamList,
  "ConversationSimulator"
>;

export default function ConversationSimulatorScreen() {
  const navigation = useNavigation<ConversationSimulatorScreenNavigationProp>();
  const route = useRoute<ConversationSimulatorScreenRouteProp>();
  const { situationId } = route.params;
  const scrollViewRef = useRef<ScrollView>(null);

  // Audio playback state
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Audio recording state
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioPermission, setAudioPermission] = useState<boolean>(false);

  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [playing, setPlaying] = useState<boolean>(false);
  const [currentAudioId, setCurrentAudioId] = useState<string | null>(null);
  const [processingMessage, setProcessingMessage] = useState<string | null>(
    null
  );

  // Request audio recording permissions
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setAudioPermission(status === "granted");

      // Initialize audio mode for recording and playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    })();
  }, []);

  // Clean up audio when the component unmounts
  useEffect(() => {
    return () => {
      if (sound) {
        console.log("Unloading sound");
        sound.unloadAsync();
      }

      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [sound, recording]);

  // Fetch initial conversation
  const fetchConversation = async () => {
    try {
      setLoading(true);
      const data = await api.generateInitialConversation(situationId);
      setMessages(data);
      setError(null);

      // Auto-play the first AI message after a short delay
      // Wait until messages are definitely set before trying to play
      setTimeout(() => {
        if (data.length > 1) {
          const aiMessage = data.find((msg) => msg.type === "ai");
          if (aiMessage) {
            handlePlayAudio(aiMessage);
          }
        }
      }, 1500);
    } catch (err) {
      setError("Failed to load conversation. Please try again.");
      console.error("Error fetching conversation:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversation();
  }, [situationId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Stop recording and process the speech
  const stopRecording = async () => {
    console.log("Stopping recording");
    try {
      if (!recording) {
        setIsRecording(false); // Ensure recording state is reset even if there's no recording
        return;
      }

      setIsRecording(false);
      setProcessingMessage("Processing your speech...");

      // Save a reference to the current recording before stopping it
      const currentRecording = recording;
      setRecording(null); // Clear recording state early to prevent state issues

      // Stop the recording
      await currentRecording.stopAndUnloadAsync();
      const uri = currentRecording.getURI();

      if (!uri) {
        setProcessingMessage(null);
        throw new Error("No recording URI available");
      }

      console.log("Recording URI:", uri);

      // Prepare the audio file for upload
      const fileInfo = await fetch(uri);
      const audioBlob = await fileInfo.blob();

      // Check the blob type and convert if needed
      const isBrowser = Platform.OS === "web";
      let processedAudioBlob = audioBlob;

      if (isBrowser) {
        console.log("Browser audio blob type:", audioBlob.type);

        // If the blob is webm (from browser), we need to ensure it's handled correctly
        // For browsers, the ElevenLabs API expects specific formats
        if (audioBlob.type === "audio/webm") {
          // Create a file with the correct extension to help ElevenLabs identify the format
          processedAudioBlob = new Blob([audioBlob], { type: "audio/webm" });
        }
      }

      // Create form data for the API call
      const formData = new FormData();

      // Append the audio with proper filename and type to help ElevenLabs identify the format
      const filename = isBrowser ? "recording.webm" : "recording.m4a";
      formData.append("file", processedAudioBlob as any, filename);
      formData.append("model_id", "scribe_v1");
      formData.append("language_code", "en");

      console.log("Sending audio to ElevenLabs for transcription...");

      // Send the audio to ElevenLabs for transcription
      const transcriptionResponse = await fetch(
        "https://api.elevenlabs.io/v1/speech-to-text",
        {
          method: "POST",
          headers: {
            "xi-api-key": "sk_d03632e2c4f75c57c299a500a9d9f5054dd6e96a461c3a40",
          },
          body: formData,
        }
      );

      const responseText = await transcriptionResponse.text();
      console.log("ElevenLabs response:", responseText);

      if (!transcriptionResponse.ok) {
        setProcessingMessage(null);
        throw new Error(
          `Failed to transcribe speech: ${transcriptionResponse.statusText}, Details: ${responseText}`
        );
      }

      // Parse the JSON response
      const transcriptionResult = JSON.parse(responseText);
      const transcribedText = transcriptionResult.text;

      setProcessingMessage(null);

      if (!transcribedText) {
        Alert.alert("Error", "No speech detected. Please try again.");
        return;
      }

      // Add user message to the conversation
      const userMessage: ConversationMessage = {
        id: `user-${Date.now()}`,
        text: transcribedText,
        type: "user",
      };

      // Make sure to use the callback form to ensure we have the most recent messages
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      try {
        // Generate AI response
        setProcessingMessage("Generating response...");
        const aiResponse = await api.generateResponse(
          situationId,
          [...messages, userMessage], // Use current messages + new user message
          userMessage.text
        );

        setMessages((prev) => [...prev, aiResponse]);
        setProcessingMessage(null);

        // Automatically play the audio response after a short delay
        setTimeout(() => {
          handlePlayAudio(aiResponse);
        }, 500);
      } catch (err) {
        setProcessingMessage(null);
        Alert.alert("Error", "Failed to generate response. Please try again.", [
          { text: "OK" },
        ]);
        console.error("Error generating response:", err);
      }
    } catch (err) {
      setProcessingMessage(null);
      setIsRecording(false); // Ensure recording state is reset on error
      console.error("Failed to process speech", err);
      Alert.alert("Error", "Failed to process your speech. Please try again.");
    } finally {
      // Make absolutely sure recording state is cleaned up properly
      if (recording) {
        try {
          recording.stopAndUnloadAsync();
        } catch (e) {
          console.error("Error cleaning up recording:", e);
        }
      }
      setRecording(null);
      setIsRecording(false);
    }
  };

  // Handle recording button press
  const handleRecordingPress = () => {
    console.log("Recording button pressed");
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      if (!audioPermission) {
        Alert.alert(
          "Permission Required",
          "You need to grant microphone permission to record audio."
        );
        return;
      }

      // Make sure any previous recording is stopped and cleaned up
      if (recording) {
        try {
          await recording.stopAndUnloadAsync();
        } catch (e) {
          console.error("Error stopping previous recording:", e);
        }
        setRecording(null);
      }

      // Check if running in browser environment
      const isBrowser = Platform.OS === "web";

      // Configure recording options based on platform
      let recordingOptions;

      if (isBrowser) {
        // Use web-compatible settings
        recordingOptions = {
          isMeteringEnabled: true,
          android: {
            extension: ".m4a",
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
          },
          ios: {
            extension: ".m4a",
            outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
            audioQuality: Audio.IOSAudioQuality.MEDIUM,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {
            mimeType: "audio/webm",
            bitsPerSecond: 128000,
          },
        };
      } else {
        // Use default high quality for native devices
        recordingOptions = Audio.RecordingOptionsPresets.HIGH_QUALITY;
      }

      // Create a new recording with the appropriate options
      console.log("Starting recording with options:", recordingOptions);
      const { recording: newRecording } = await Audio.Recording.createAsync(
        recordingOptions
      );

      setRecording(newRecording);
      setIsRecording(true);
      setProcessingMessage("Listening...");
    } catch (err) {
      console.error("Failed to start recording", err);
      setIsRecording(false);
      setProcessingMessage(null);

      // Provide more specific error message for browser issues
      if (Platform.OS === "web") {
        Alert.alert(
          "Recording Error",
          "Your browser may not fully support audio recording. Try using Chrome or Safari for best results."
        );
      } else {
        Alert.alert("Error", "Failed to start recording. Please try again.");
      }
    }
  };

  // Play audio for a message
  const handlePlayAudio = async (message: ConversationMessage) => {
    if (playing) {
      // Stop any currently playing audio
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      setPlaying(false);
      setCurrentAudioId(null);

      // If tapping on the same message, just stop and don't restart
      if (currentAudioId === message.id) {
        return;
      }
    }

    try {
      // Set the UI to loading state
      setCurrentAudioId(message.id);
      setPlaying(true);

      // If there's no audio URL yet, generate one
      if (!message.audioUrl) {
        try {
          const audioUrl = await api.generateSpeech(message.text);

          // IMPORTANT FIX: Use the callback form to ensure we have the latest messages
          // and create a new copy of the message with the updated audio URL
          setMessages((prevMessages) =>
            prevMessages.map((m) =>
              m.id === message.id ? { ...m, audioUrl } : m
            )
          );

          // Play the audio
          await playAudio(audioUrl, message.id);
        } catch (err) {
          Alert.alert("Error", "Failed to generate audio. Please try again.", [
            { text: "OK" },
          ]);
          console.error("Error generating audio:", err);
          setPlaying(false);
          setCurrentAudioId(null);
        }
      } else {
        // Play existing audio
        await playAudio(message.audioUrl, message.id);
      }
    } catch (err) {
      console.error("Error playing audio:", err);
      setPlaying(false);
      setCurrentAudioId(null);
    }
  };

  // Helper function to play audio
  const playAudio = async (audioUrl: string, messageId: string) => {
    // If there's no audio URL, we can't play anything
    if (!audioUrl) {
      setPlaying(false);
      setCurrentAudioId(null);
      return;
    }

    try {
      // Load the sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );

      // Store the sound object so we can unload it later
      setSound(newSound);

      // Handle when the sound finishes playing
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlaying(false);
          setCurrentAudioId(null);
          newSound.unloadAsync();
          setSound(null);
        }
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      setPlaying(false);
      setCurrentAudioId(null);
    }
  };

  const handleRetry = () => {
    fetchConversation();
  };

  const renderMessageItem = (message: ConversationMessage) => {
    switch (message.type) {
      case "system":
        return (
          <View key={message.id} style={styles.systemMessageContainer}>
            <Text style={styles.systemMessageText}>{message.text}</Text>
          </View>
        );
      case "ai":
        return (
          <View key={message.id} style={styles.aiMessageContainer}>
            <View style={styles.messageContent}>
              <Text style={styles.messageText}>{message.text}</Text>
              <TouchableOpacity
                style={styles.audioButton}
                onPress={() => handlePlayAudio(message)}
                disabled={playing && currentAudioId !== message.id}
              >
                {playing && currentAudioId === message.id ? (
                  <Pause color="#E2E8F0" size={20} />
                ) : (
                  <Play color="#E2E8F0" size={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        );
      case "user":
        return (
          <View key={message.id} style={styles.userMessageContainer}>
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#0F172A", "#1E293B"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="#E2E8F0" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Practice Conversation</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4B9EF9" />
          <Text style={styles.loadingText}>Preparing conversation...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            ref={scrollViewRef}
            style={styles.conversationContainer}
            contentContainerStyle={styles.conversationContent}
          >
            {messages.map(renderMessageItem)}

            {/* Show processing message when needed */}
            {processingMessage && (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="small" color="#4B9EF9" />
                <Text style={styles.processingText}>{processingMessage}</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={[
                styles.recordButton,
                isRecording ? styles.recordingButton : null,
                playing || !!processingMessage ? styles.disabledButton : null,
              ]}
              onPress={handleRecordingPress}
              // disabled={playing || !!processingMessage} // Disable when audio is playing or processing
            >
              <Mic color="#FFFFFF" size={24} />
              <Text style={styles.recordButtonText}>
                {isRecording ? "Stop" : "Speak"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Inter-Bold",
    fontSize: 18,
    color: "white",
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#E2E8F0",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  errorText: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#F87171",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#4B9EF9",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "white",
  },
  conversationContainer: {
    flex: 1,
  },
  conversationContent: {
    padding: 16,
    paddingBottom: 24,
  },
  systemMessageContainer: {
    backgroundColor: "rgba(75, 85, 99, 0.5)",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    alignSelf: "center",
    maxWidth: "80%",
  },
  systemMessageText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#E2E8F0",
    textAlign: "center",
  },
  aiMessageContainer: {
    marginBottom: 16,
    alignSelf: "flex-start",
    maxWidth: "80%",
  },
  userMessageContainer: {
    backgroundColor: "#4B9EF9",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    alignSelf: "flex-end",
    maxWidth: "80%",
  },
  messageContent: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 12,
  },
  messageText: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#E2E8F0",
  },
  audioButton: {
    alignSelf: "flex-end",
    marginTop: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 6,
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  recordButton: {
    backgroundColor: "#4B9EF9",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  recordingButton: {
    backgroundColor: "#F87171",
  },
  recordButtonText: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "white",
    marginLeft: 8,
  },
  processingContainer: {
    backgroundColor: "rgba(75, 158, 249, 0.2)",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    alignSelf: "center",
    maxWidth: "90%",
    flexDirection: "row",
    alignItems: "center",
  },
  processingText: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#E2E8F0",
    marginLeft: 8,
  },
});
