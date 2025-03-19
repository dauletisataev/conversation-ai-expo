import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { PodcastMessage as PodcastMessageType } from "../utils/openai";
import { PodcastParticipant } from "../utils/openai";
import { User, Play } from "lucide-react-native";

type Props = {
  message: PodcastMessageType;
  participants: PodcastParticipant[];
  isCurrentUserTurn: boolean;
  onPressPlayAudio?: () => void;
  onUserRespond?: () => void;
};

export default function PodcastMessage({
  message,
  participants,
  isCurrentUserTurn,
  onPressPlayAudio,
  onUserRespond,
}: Props) {
  // Find the participant for the message
  const participant = participants.find(
    (p) => p.name.toLowerCase() === message.role.toLowerCase()
  );

  // System messages are not displayed
  if (message.role === "system") {
    return null;
  }

  // Check if this is a user message
  const isUser = participant?.id === "user";

  return (
    <View style={styles.messageContainer}>
      <View style={styles.avatarContainer}>
        {isUser ? (
          <View style={styles.userAvatarContainer}>
            <User size={20} color="#E2E8F0" />
          </View>
        ) : (
          <Image
            source={{ uri: participant?.avatarUrl }}
            style={styles.avatar}
          />
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.nameText}>
            {participant?.name || message.role}
          </Text>

          {!isUser && onPressPlayAudio && (
            <TouchableOpacity
              style={styles.playButton}
              onPress={onPressPlayAudio}
            >
              <Play size={14} color="#E2E8F0" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.messageText}>{message.content}</Text>
      </View>

      {isCurrentUserTurn && isUser && onUserRespond && (
        <TouchableOpacity style={styles.respondButton} onPress={onUserRespond}>
          <Text style={styles.respondButtonText}>Respond</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: "row",
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  nameText: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "#E2E8F0",
  },
  playButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  messageText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#E2E8F0",
    lineHeight: 20,
  },
  respondButton: {
    position: "absolute",
    bottom: -12,
    right: 24,
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  respondButtonText: {
    fontFamily: "Inter-Bold",
    fontSize: 12,
    color: "white",
  },
});
