import React, { useEffect, useRef } from "react";
import { View, StyleSheet, ScrollView, Text, Animated } from "react-native";
import { PodcastParticipant } from "../utils/openai";
import PodcastParticipantProfile from "./PodcastParticipantProfile";

type Props = {
  participants: PodcastParticipant[];
  currentSpeaker: string;
  onPressPlay: (participantId: string) => void;
  onUserRespond: () => void;
  isUserTurn: boolean;
  currentMessage: string;
};

export default function PodcastParticipantsView({
  participants,
  currentSpeaker,
  onPressPlay,
  onUserRespond,
  isUserTurn,
  currentMessage,
}: Props) {
  const userPromptAnim = useRef(new Animated.Value(0)).current;
  const messageOpacityAnim = useRef(new Animated.Value(0)).current;
  const userTurnPulseAnim = useRef(new Animated.Value(0)).current;

  // When current message changes, animate the message opacity
  useEffect(() => {
    if (currentMessage) {
      // Reset and then animate in
      messageOpacityAnim.setValue(0);
      Animated.timing(messageOpacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [currentMessage, messageOpacityAnim]);

  // When isUserTurn changes to true, animate the user prompt
  useEffect(() => {
    if (isUserTurn) {
      // Start pulsing animation for user turn
      Animated.loop(
        Animated.sequence([
          Animated.timing(userTurnPulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(userTurnPulseAnim, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Reset the animation when it's not user's turn
      userTurnPulseAnim.setValue(0);
    }
  }, [isUserTurn, userTurnPulseAnim]);

  // Find the active speaker participant object
  const activeSpeaker = participants.find(
    (p) => p.name.toLowerCase() === currentSpeaker.toLowerCase()
  );

  // Calculate the highlight color based on userTurnPulseAnim
  const highlightBackground = userTurnPulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      "rgba(240, 82, 82, 0.1)",
      "rgba(240, 82, 82, 0.2)",
      "rgba(240, 82, 82, 0.3)",
    ],
  });

  const highlightBorder = userTurnPulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      "rgba(240, 82, 82, 0.3)",
      "rgba(240, 82, 82, 0.5)",
      "rgba(240, 82, 82, 0.7)",
    ],
  });

  return (
    <View style={styles.container}>
      <View style={styles.profilesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {participants.map((participant) => {
            const isActive =
              participant.name.toLowerCase() === currentSpeaker.toLowerCase();
            const isSpeaking = isActive;

            return (
              <PodcastParticipantProfile
                key={participant.id}
                participant={participant}
                isActive={isActive}
                isSpeaking={isSpeaking}
                onPressPlay={
                  !participant.id.includes("user")
                    ? () => onPressPlay(participant.id)
                    : undefined
                }
                onPressRespond={undefined}
                isUserTurn={participant.id === "user" && isUserTurn}
              />
            );
          })}
        </ScrollView>
      </View>

      {/* Current message display */}
      {currentMessage && (
        <Animated.View
          style={[styles.messageContainer, { opacity: messageOpacityAnim }]}
        >
          {activeSpeaker && (
            <Text
              style={[
                styles.speakerName,
                isUserTurn && styles.userTurnSpeakerName,
              ]}
            >
              {activeSpeaker.name}
              {isUserTurn && " → You"}
            </Text>
          )}
          <Text style={styles.messageText}>{currentMessage}</Text>

          {isUserTurn && (
            <Animated.View
              style={[
                styles.userTurnIndicator,
                {
                  backgroundColor: highlightBackground,
                  borderColor: highlightBorder,
                },
              ]}
            >
              <Text style={styles.userTurnText}>
                Your turn to respond - opening response panel...
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 16,
  },
  profilesContainer: {
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
  messageContainer: {
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
    marginBottom: 16,
  },
  userTurnMessageContainer: {
    borderColor: "rgba(240, 82, 82, 0.5)",
    backgroundColor: "rgba(240, 82, 82, 0.1)",
  },
  speakerName: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "#3B82F6",
    marginBottom: 8,
  },
  userTurnSpeakerName: {
    color: "#F05252",
  },
  messageText: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#E2E8F0",
    lineHeight: 24,
  },
  userTurnIndicator: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(240, 82, 82, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(240, 82, 82, 0.4)",
  },
  userTurnText: {
    fontFamily: "Inter-Bold",
    fontSize: 14,
    color: "#F05252",
    textAlign: "center",
  },
});
