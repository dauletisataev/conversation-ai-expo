import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  TouchableOpacity,
} from "react-native";
import { User } from "lucide-react-native";
import { PodcastParticipant } from "../utils/openai";

type Props = {
  participant: PodcastParticipant;
  isActive: boolean;
  isSpeaking: boolean;
  onPressPlay?: () => void;
  onPressRespond?: () => void;
  isUserTurn?: boolean;
};

export default function PodcastParticipantProfile({
  participant,
  isActive,
  isSpeaking,
  onPressPlay,
  onPressRespond,
  isUserTurn,
}: Props) {
  const isUser = participant.id === "user";
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const userTurnAnim = useRef(new Animated.Value(0)).current;

  // Setup pulsing animation for the active speaker
  useEffect(() => {
    if (isSpeaking) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Rotation animation for the background ring
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      // Reset animations when not speaking
      pulseAnim.setValue(0);
      rotateAnim.setValue(0);
      Animated.timing(pulseAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isSpeaking, pulseAnim, rotateAnim]);

  // Setup animation for when it's the user's turn
  useEffect(() => {
    if (isUser && isUserTurn) {
      // More prominent animation for user's turn
      Animated.loop(
        Animated.sequence([
          Animated.timing(userTurnAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(userTurnAnim, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Reset animation when it's not user's turn
      userTurnAnim.setValue(0);
    }
  }, [isUser, isUserTurn, userTurnAnim]);

  // Calculate rotation for the animated ring
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Calculate opacity for the animated ring
  const ringOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  // User turn scale animation
  const userTurnScale = userTurnAnim.interpolate({
    inputRange: [0.6, 1],
    outputRange: [1, 1.1],
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={isActive && onPressPlay ? onPressPlay : undefined}
      disabled={!isActive || !onPressPlay}
    >
      {/* Animated background ring when speaking */}
      {isSpeaking && (
        <Animated.View
          style={[
            styles.animatedRing,
            {
              opacity: ringOpacity,
              transform: [{ rotate }],
              backgroundColor: isUser && isUserTurn ? "#F05252" : "#3B82F6",
            },
          ]}
        />
      )}

      {/* User turn highlight ring */}
      {isUser && isUserTurn && (
        <Animated.View
          style={[
            styles.userTurnRing,
            {
              transform: [{ scale: userTurnScale }],
            },
          ]}
        />
      )}

      {/* Avatar container */}
      <Animated.View
        style={[
          styles.avatarContainer,
          isActive && styles.activeAvatarContainer,
          isUser && isUserTurn && styles.userTurnAvatarContainer,
          isUser &&
            isUserTurn && {
              transform: [{ scale: userTurnScale }],
            },
        ]}
      >
        {isUser ? (
          <View
            style={[
              styles.userIconContainer,
              isUserTurn && styles.userIconContainerActive,
            ]}
          >
            <User size={24} color="#E2E8F0" />
          </View>
        ) : (
          <Image
            source={{ uri: participant.avatarUrl }}
            style={styles.avatar}
          />
        )}
      </Animated.View>

      {/* Name */}
      <Animated.Text style={[styles.name]}>{participant.name}</Animated.Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 12,
    position: "relative",
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  activeAvatarContainer: {
    borderColor: "#3B82F6",
  },
  userTurnAvatarContainer: {
    borderColor: "#F05252",
    borderWidth: 3,
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
  userIconContainerActive: {
    backgroundColor: "#F05252", // Red background when it's user's turn
  },
  name: {
    fontFamily: "Inter-Bold",
    fontSize: 14,
    color: "#E2E8F0",
    textAlign: "center",
  },
  userTurnName: {
    color: "#F05252",
  },
  animatedRing: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "#3B82F6",
    top: -5,
    left: 5,
    zIndex: -1,
  },
  userTurnRing: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#F05252",
    backgroundColor: "rgba(240, 82, 82, 0.15)",
    top: -9,
    left: 0,
    zIndex: -1,
  },
});
