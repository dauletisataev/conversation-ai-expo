import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { PodcastParticipant } from "../utils/openai";
import { PREDEFINED_VOICES } from "../utils/elevenlabs";
import { User, Check } from "lucide-react-native";

type Props = {
  selectedParticipants: PodcastParticipant[];
  onSelectParticipant: (participant: PodcastParticipant) => void;
  onRemoveParticipant: (participantId: string) => void;
  maxParticipants: number;
};

const PARTICIPANTS: PodcastParticipant[] = Object.entries(PREDEFINED_VOICES)
  .filter(([id]) => id !== "user")
  .map(([id, voice]) => ({
    id,
    name: voice.name,
    description: `Known for their unique perspective and insights.`,
    avatarUrl: `https://randomuser.me/api/portraits/${
      id.includes("michelle") || id.includes("oprah") ? "women" : "men"
    }/${Math.floor(Math.random() * 70) + 1}.jpg`,
  }));

// Add detailed descriptions for each participant
PARTICIPANTS.forEach((participant) => {
  switch (participant.id) {
    case "elon_musk":
      participant.description =
        "Tech entrepreneur known for Tesla, SpaceX, and innovative thinking.";
      break;
    case "joe_rogan":
      participant.description =
        "Podcast host known for long-form conversations and diverse topics.";
      break;
    case "bill_gates":
      participant.description =
        "Microsoft co-founder, philanthropist focused on global health and climate.";
      break;
    case "oprah_winfrey":
      participant.description =
        "Media executive, talk show host known for emotional intelligence and empathy.";
      break;
    case "michelle_obama":
      participant.description =
        "Former First Lady, advocate for education, health, and inclusion.";
      break;
    case "tim_cook":
      participant.description =
        "Apple CEO, tech executive focused on privacy and sustainability.";
      break;
  }
});

// Add user participant
const USER_PARTICIPANT: PodcastParticipant = {
  id: "user",
  name: "You",
  description: "Your voice and perspective in the conversation.",
  avatarUrl: "https://randomuser.me/api/portraits/lego/1.jpg",
};

export default function PodcastParticipantSelector({
  selectedParticipants,
  onSelectParticipant,
  onRemoveParticipant,
  maxParticipants,
}: Props) {
  // Create a list of all possible participants
  const allParticipants = [USER_PARTICIPANT, ...PARTICIPANTS];

  // Check if a participant is selected
  const isSelected = (participantId: string): boolean => {
    return selectedParticipants.some((p) => p.id === participantId);
  };

  // Check if we've reached the max number of participants
  const reachedMaxParticipants = selectedParticipants.length >= maxParticipants;

  // Render each participant item
  const renderParticipant = ({ item }: { item: PodcastParticipant }) => {
    const selected = isSelected(item.id);
    const disabled = reachedMaxParticipants && !selected;

    return (
      <TouchableOpacity
        style={[
          styles.participantCard,
          selected && styles.selectedCard,
          disabled && styles.disabledCard,
        ]}
        onPress={() => {
          if (selected) {
            onRemoveParticipant(item.id);
          } else if (!disabled) {
            onSelectParticipant(item);
          }
        }}
        disabled={disabled}
      >
        <View style={styles.avatarContainer}>
          {item.id === "user" ? (
            <View style={styles.userIconContainer}>
              <User size={24} color="#E2E8F0" />
            </View>
          ) : (
            <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
          )}
          {selected && (
            <View style={styles.checkmarkContainer}>
              <Check size={16} color="#FFFFFF" />
            </View>
          )}
        </View>
        <Text style={styles.participantName}>{item.name}</Text>
        <Text style={styles.participantDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Podcast Participants</Text>
      <Text style={styles.subtitle}>
        Choose up to {maxParticipants} participants for your podcast (including
        yourself).
      </Text>

      <FlatList
        data={allParticipants}
        renderItem={renderParticipant}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.selectionInfo}>
        <Text style={styles.selectionText}>
          {selectedParticipants.length} of {maxParticipants} selected
        </Text>
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
  columnWrapper: {
    justifyContent: "space-between",
  },
  listContent: {
    paddingBottom: 16,
  },
  participantCard: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  selectedCard: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  disabledCard: {
    opacity: 0.5,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkContainer: {
    position: "absolute",
    bottom: 0,
    right: -5,
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0F172A",
  },
  participantName: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "#E2E8F0",
    marginBottom: 4,
    textAlign: "center",
  },
  participantDescription: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
  },
  selectionInfo: {
    marginTop: 8,
    alignItems: "center",
  },
  selectionText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#94A3B8",
  },
});
