import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

import PodcastTopicSelector from "../components/PodcastTopicSelector";
import PodcastParticipantSelector from "../components/PodcastParticipantSelector";
import PodcastResponseInput from "../components/PodcastResponseInput";
import PodcastParticipantsView from "../components/PodcastParticipantsView";

import {
  PodcastParticipant,
  PodcastMessage as PodcastMessageType,
} from "../utils/openai";
import openaiService from "../utils/openai";
import elevenlabsService from "../utils/elevenlabs";

// User participant definition
const USER_PARTICIPANT: PodcastParticipant = {
  id: "user",
  name: "You",
  description: "Your voice and perspective in the conversation.",
  avatarUrl: "https://randomuser.me/api/portraits/lego/1.jpg",
};

type PodcastScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Podcast"
>;

// Podcast setup stages
enum PodcastStage {
  SelectTopic,
  SelectParticipants,
  Loading,
  Conversation,
}

export default function PodcastScreen() {
  const navigation = useNavigation<PodcastScreenNavigationProp>();
  const [stage, setStage] = useState<PodcastStage>(PodcastStage.SelectTopic);
  const [topic, setTopic] = useState<string>("");
  // Initialize with user participant
  const [selectedParticipants, setSelectedParticipants] = useState<
    PodcastParticipant[]
  >([USER_PARTICIPANT]);
  const [messages, setMessages] = useState<PodcastMessageType[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [currentSpeaker, setCurrentSpeaker] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [showResponseInput, setShowResponseInput] = useState<boolean>(false);
  const [currentUserTurn, setCurrentUserTurn] = useState<boolean>(false);
  const [conversationSections, setConversationSections] = useState<
    PodcastMessageType[][]
  >([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);

  // This reference holds the last error for debugging
  const debuggingRef = useRef<{ lastError?: string }>({});

  const [fontsLoaded] = useFonts({
    "Inter-Regular": Inter_400Regular,
    "Inter-Bold": Inter_700Bold,
  });

  // Organize messages into sections when they change
  useEffect(() => {
    if (messages.length === 0) return;

    // Filter out system messages
    const nonSystemMessages = messages.filter((m) => m.role !== "system");

    // Initialize sections if not already done
    if (conversationSections.length === 0 && nonSystemMessages.length > 0) {
      // Split messages into sections based on user responses
      const sections: PodcastMessageType[][] = [];
      let currentSection: PodcastMessageType[] = [];
      let userMessage = false;

      nonSystemMessages.forEach((message, index) => {
        const isUserMessage =
          message.role.toLowerCase() === USER_PARTICIPANT.name.toLowerCase();

        // Track if we've seen a user message
        if (isUserMessage) {
          userMessage = true;

          // If we've accumulated messages, finish the current section
          if (currentSection.length > 0) {
            sections.push([...currentSection]);
            currentSection = [];
          }
        }

        // Add message to current section
        currentSection.push(message);

        // End section if this is the last message
        if (
          index === nonSystemMessages.length - 1 &&
          currentSection.length > 0
        ) {
          sections.push([...currentSection]);
        }
      });

      setConversationSections(sections);
      setCurrentSectionIndex(0);
    }

    // When messages are updated after user input, update sections
    else if (conversationSections.length > 0) {
      // Get all messages not in any section
      const allSectionMessages = conversationSections.flat();
      const newMessages = nonSystemMessages.filter(
        (msg) =>
          !allSectionMessages.some(
            (m) => m.role === msg.role && m.content === msg.content
          )
      );

      if (newMessages.length > 0) {
        // If there are new messages, add them as a new section
        setConversationSections((prev) => [...prev, newMessages]);
        setCurrentSectionIndex((prev) => prev + 1);
      }
    }
  }, [messages]);

  // Automatically show response input when it's the user's turn
  useEffect(() => {
    if (
      currentUserTurn &&
      !showResponseInput &&
      !isLoading &&
      !isPlayingAudio
    ) {
      // Short delay to ensure audio playback has completely finished
      const timer = setTimeout(() => {
        setShowResponseInput(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentUserTurn, showResponseInput, isLoading, isPlayingAudio]);

  // Helper function to check if it's the user's turn
  const checkIfUserTurn = (
    message: PodcastMessageType,
    messageIndex?: number,
    section?: PodcastMessageType[]
  ) => {
    const userParticipant = selectedParticipants.find((p) => p.id === "user");

    if (!userParticipant) return false;

    const isUserMessage = message.role === userParticipant.name.toLowerCase();

    // Don't make it the user's turn if this message is from the user
    if (isUserMessage) {
      setCurrentUserTurn(false);
      return false;
    }

    // Less strict checks for determining if it's the user's turn

    // 1. Check if this message is directed at the user
    const isDirectedAtUser =
      message.content.includes(userParticipant.name) ||
      message.content.toLowerCase().includes(" you") ||
      message.content.toLowerCase().includes("you ") ||
      message.content.toLowerCase().includes("your ");

    // 2. Check if this is a question or prompt for response
    const isQuestion =
      message.content.includes("?") ||
      message.content.toLowerCase().includes("what do you think") ||
      message.content.toLowerCase().includes("your thoughts") ||
      message.content.toLowerCase().includes("would you") ||
      message.content.toLowerCase().includes("could you") ||
      message.content.toLowerCase().includes("how about you") ||
      message.content.toLowerCase().includes("do you agree");

    // If it's just a single message or the last message in a section (more likely to expect a response)
    const isSingleOrLastMessage = Boolean(
      (section && section.length === 1) || // It's a single message section
        (messageIndex !== undefined &&
          section &&
          messageIndex === section.length - 1) // It's the last message in the section
    );

    // It's the user's turn if:
    // 1. The message is directed at them with a question (direct engagement)
    // 2. OR it's a single/last message AND (it's directed at the user OR it's a question)
    // This makes it more likely to catch cases where there's an implicit invitation to respond
    const isUserTurn =
      (!isUserMessage && isDirectedAtUser && isQuestion) || // Traditional check
      (isSingleOrLastMessage &&
        !isUserMessage &&
        (isDirectedAtUser || isQuestion)); // More lenient for single messages

    // For debugging
    console.log("Message:", message.content.substring(0, 30) + "...");
    console.log("Is user turn:", isUserTurn, {
      isDirectedAtUser,
      isQuestion,
      isSingleOrLastMessage,
    });

    setCurrentUserTurn(isUserTurn);
    return isUserTurn;
  };

  // Play audio for a single message and return a promise that resolves when audio finishes
  const playMessageAudio = async (
    message: PodcastMessageType
  ): Promise<void> => {
    if (message.role === USER_PARTICIPANT.name.toLowerCase()) return;

    setIsPlayingAudio(true);

    try {
      await elevenlabsService.playMessageAudio(message, selectedParticipants);
    } catch (error: any) {
      debuggingRef.current.lastError = error.message;
      console.error("Failed to play audio:", error);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  // New function to sequentially play a list of messages
  const playMessages = async (
    messages: PodcastMessageType[]
  ): Promise<void> => {
    // Reset current user turn and response input visibility
    setCurrentUserTurn(false);
    setShowResponseInput(false);

    // If no messages to play, exit early
    if (!messages.length) return;

    try {
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];

        // Skip system messages and user messages (they don't have audio)
        if (
          message.role === "system" ||
          message.role === USER_PARTICIPANT.name.toLowerCase()
        ) {
          continue;
        }

        // Update current message and speaker (this will activate the profile animation)
        setCurrentMessage(message.content);
        setCurrentSpeaker(message.role);

        // Play the audio
        await playMessageAudio(message);

        // Check if it's the user's turn based on this message and additional context
        const isLastMessage = i === messages.length - 1;

        if (isLastMessage) {
          // For the last message, we call checkIfUserTurn with additional context
          // about the section and message position to make the detection more accurate
          checkIfUserTurn(message, i, messages);

          // If it's a single message section, more aggressively check if it should be the user's turn
          if (messages.length === 1) {
            // Single message sections are very likely to be conversation starters/prompts
            // If this doesn't contain specific questions for the user, but ends the conversation
            // turn, we should still give the user a chance to respond.
            if (!currentUserTurn) {
              console.log(
                "Single message section, forcing user turn consideration"
              );
              // If not already determined to be the user's turn, do a more lenient check
              const potentialQuestion =
                message.content.length > 40 && // Reasonably substantial message
                !message.content.includes("Let me") && // Not just the AI thinking out loud
                !message.content.includes("I'll"); // Not just the AI announcing next steps

              if (potentialQuestion) {
                console.log("Setting user turn for single message response");
                setCurrentUserTurn(true);
              }
            }
          }
        }
      }
    } catch (error: any) {
      debuggingRef.current.lastError = error.message;
      console.error("Failed to play messages:", error);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  const handleSelectTopic = (selectedTopic: string) => {
    setTopic(selectedTopic);
    setStage(PodcastStage.SelectParticipants);
  };

  const handleSelectParticipant = (participant: PodcastParticipant) => {
    // Don't add participant if they're already selected
    if (selectedParticipants.some((p) => p.id === participant.id)) return;

    setSelectedParticipants((prev) => [...prev, participant]);
  };

  const handleRemoveParticipant = (participantId: string) => {
    // Don't allow removing the user participant
    if (participantId === "user") return;

    setSelectedParticipants((prev) =>
      prev.filter((p) => p.id !== participantId)
    );
  };

  const handlePlayParticipantAudio = async (participantId: string) => {
    if (isPlayingAudio) return;

    // Find the participant
    const participant = selectedParticipants.find(
      (p) => p.id === participantId
    );
    if (!participant) return;

    // Find the current message (should be from this participant)
    const message = { role: currentSpeaker, content: currentMessage };

    // Skip if not matching participant
    if (participant.name.toLowerCase() !== message.role.toLowerCase()) return;

    // Play just this message
    setCurrentSpeaker(message.role);
    await playMessageAudio(message);
  };

  const handleStartPodcast = async () => {
    if (selectedParticipants.length < 2) {
      alert("Please select at least 1 other participant besides yourself");
      return;
    }

    // Switch to loading state
    setStage(PodcastStage.Loading);

    // Reset state for a fresh start
    setConversationSections([]);
    debuggingRef.current = {};

    try {
      // Find the user participant
      const userParticipant = selectedParticipants.find((p) => p.id === "user");

      if (!userParticipant) {
        throw new Error("User participant is required");
      }

      // Generate the initial conversation with instructions to end with a question to the user
      const conversation = await openaiService.generatePodcastConversation(
        topic,
        selectedParticipants,
        userParticipant.name,
        {
          structuredFormat: true, // Indicate we want a structured conversation
          includeFinalQuestion: true, // End with a question to the user
        }
      );

      setMessages(conversation);
      setStage(PodcastStage.Conversation);

      // Play the initial conversation messages
      // Filter out system messages
      const nonSystemMessages = conversation.filter((m) => m.role !== "system");
      setTimeout(() => {
        playMessages(nonSystemMessages);
      }, 500);
    } catch (error: any) {
      debuggingRef.current.lastError = error.message;
      console.error("Failed to start podcast:", error);
      alert("Failed to start the podcast. Please try again.");
      // Go back to participants selection if there's an error
      setStage(PodcastStage.SelectParticipants);
    }
  };

  const handleUserResponse = () => {
    setShowResponseInput(true);
  };

  const handleSubmitResponse = async (response: string) => {
    setShowResponseInput(false);

    const userParticipant = selectedParticipants.find((p) => p.id === "user");
    if (!userParticipant) return;

    setIsLoading(true);

    try {
      // Add user's message to the conversation
      const userMessage: PodcastMessageType = {
        role: userParticipant.name.toLowerCase(),
        content: response,
      };

      // Update messages with user's response
      const messagesWithUserResponse = [...messages, userMessage];
      setMessages(messagesWithUserResponse);

      // Generate continuation that will include another exchange between participants
      // ending with a question to the user
      const newMessages = await openaiService.continuePodcastConversation(
        messagesWithUserResponse,
        selectedParticipants,
        response,
        {
          structuredFormat: true, // Indicate we want a structured conversation
          includeFinalQuestion: true, // End with a question to the user
        }
      );

      // Update the conversation with the new messages
      setMessages((currentList) => [...currentList, ...newMessages]);

      // Play the new messages
      setTimeout(() => {
        playMessages(newMessages);
      }, 500);
    } catch (error: any) {
      debuggingRef.current.lastError = error.message;
      console.error("Failed to continue conversation:", error);
      alert("Failed to continue the conversation. Please try again.");
    } finally {
      setIsLoading(false);
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

        <Text style={styles.headerTitle}>
          {stage === PodcastStage.SelectTopic && "Podcast Mode"}
          {stage === PodcastStage.SelectParticipants && "Select Participants"}
          {stage === PodcastStage.Loading && "Starting Podcast"}
          {stage === PodcastStage.Conversation && topic}
        </Text>

        <View style={styles.headerRight} />
      </View>

      {stage === PodcastStage.SelectTopic && (
        <PodcastTopicSelector onSelectTopic={handleSelectTopic} />
      )}

      {stage === PodcastStage.SelectParticipants && (
        <View style={styles.participantsContainer}>
          <PodcastParticipantSelector
            selectedParticipants={selectedParticipants}
            onSelectParticipant={handleSelectParticipant}
            onRemoveParticipant={handleRemoveParticipant}
            maxParticipants={3}
          />

          <TouchableOpacity
            style={[
              styles.startButton,
              selectedParticipants.length < 2 && styles.startButtonDisabled,
            ]}
            onPress={handleStartPodcast}
            disabled={selectedParticipants.length < 2}
          >
            <Text style={styles.startButtonText}>Start Podcast</Text>
          </TouchableOpacity>
        </View>
      )}

      {stage === PodcastStage.Loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Setting up your podcast...</Text>
          <Text style={styles.loadingSubText}>
            Preparing a conversation with{" "}
            {selectedParticipants.map((p) => p.name).join(", ")} about {topic}
          </Text>
        </View>
      )}

      {stage === PodcastStage.Conversation && (
        <View style={styles.conversationContainer}>
          <PodcastParticipantsView
            participants={selectedParticipants}
            currentSpeaker={currentSpeaker}
            onPressPlay={handlePlayParticipantAudio}
            onUserRespond={handleUserResponse}
            isUserTurn={currentUserTurn}
            currentMessage={currentMessage}
          />

          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color="#3B82F6" />
            </View>
          )}

          {isPlayingAudio && (
            <View style={styles.playingOverlay}>
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text style={styles.playingText}>Playing audio...</Text>
            </View>
          )}

          {!isPlayingAudio &&
            !isLoading &&
            !currentUserTurn &&
            conversationSections.length > 0 && (
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => {
                  // Get the current section messages
                  const currentSection =
                    conversationSections[currentSectionIndex];
                  if (currentSection?.length > 0) {
                    playMessages(currentSection);
                  }
                }}
              >
                <Text style={styles.continueButtonText}>
                  Continue Conversation
                </Text>
              </TouchableOpacity>
            )}
        </View>
      )}

      <Modal
        visible={showResponseInput}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <PodcastResponseInput
            onSubmitResponse={handleSubmitResponse}
            onCancel={() => setShowResponseInput(false)}
          />
        </View>
      </Modal>

      <StatusBar style="light" />
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
    padding: 8,
  },
  headerTitle: {
    fontFamily: "Inter-Bold",
    fontSize: 18,
    color: "#E2E8F0",
  },
  headerRight: {
    width: 40,
  },
  participantsContainer: {
    flex: 1,
    position: "relative",
  },
  startButton: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  startButtonDisabled: {
    backgroundColor: "rgba(59, 130, 246, 0.3)",
  },
  startButtonText: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "white",
  },
  conversationContainer: {
    flex: 1,
    position: "relative",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    fontFamily: "Inter-Bold",
    fontSize: 18,
    color: "#E2E8F0",
    marginTop: 16,
  },
  loadingSubText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 8,
    textAlign: "center",
  },
  loadingOverlay: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 20,
    padding: 10,
  },
  playingOverlay: {
    position: "absolute",
    bottom: 16,
    right: 16,
    flexDirection: "row",
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  playingText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#E2E8F0",
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  continueButton: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonText: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "white",
  },
});
