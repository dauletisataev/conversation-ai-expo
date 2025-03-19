import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Audio } from "expo-av";
import { MaterialIcons } from "@expo/vector-icons";
import { styles } from "../styles";

interface UserAudioPlaybackProps {
  audioUri: string | null;
}

export const UserAudioPlayback: React.FC<UserAudioPlaybackProps> = ({
  audioUri,
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clean up function to unload sound when component unmounts
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playRecordedAudio = async () => {
    if (!audioUri) {
      setError("No recorded audio available");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Unload any existing sound
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      // Create and load the sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      // Listen for playback status updates
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      setError("Failed to play audio. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayback = async () => {
    if (isPlaying && sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    } else {
      await playRecordedAudio();
    }
  };

  if (!audioUri) return null;

  return (
    <View style={styles.audioPlaybackWrapper}>
      <TouchableOpacity
        style={styles.audioPlaybackButton}
        onPress={togglePlayback}
        disabled={isLoading}
      >
        <MaterialIcons name="person" size={18} color="#FFFFFF" />
        <Text style={styles.audioPlaybackText}>You</Text>
        {isLoading ? (
          <ActivityIndicator
            color="#FFFFFF"
            size="small"
            style={styles.audioPlaybackIcon}
          />
        ) : (
          <MaterialIcons
            name={isPlaying ? "stop" : "play-arrow"}
            size={18}
            color="#FFFFFF"
            style={styles.audioPlaybackIcon}
          />
        )}
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};
