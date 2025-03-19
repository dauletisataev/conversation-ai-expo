import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Audio } from "expo-av";
import { MaterialIcons } from "@expo/vector-icons";
import { styles } from "../styles";

interface PronunciationPlaybackProps {
  word: string;
  elevenlabsApiKey: string;
}

export const PronunciationPlayback: React.FC<PronunciationPlaybackProps> = ({
  word,
  elevenlabsApiKey,
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

  const generateAndPlaySpeech = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Unload any existing sound
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      // Make request to ElevenLabs TTS API
      const response = await fetch(
        "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": elevenlabsApiKey,
          },
          body: JSON.stringify({
            text: word,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      // Get audio data as blob
      const audioBlob = await response.blob();

      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);

      reader.onloadend = async () => {
        try {
          const base64data = reader.result as string;
          // Remove the data URL prefix to get just the base64 string
          const base64Audio = base64data.split(",")[1];

          // Create and load the sound
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: `data:audio/mpeg;base64,${base64Audio}` },
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

      reader.onerror = () => {
        setError("Failed to process audio data. Please try again.");
        setIsLoading(false);
      };
    } catch (error) {
      console.error("Error generating speech:", error);
      setError("Failed to generate speech. Please try again.");
      setIsLoading(false);
    }
  };

  const togglePlayback = async () => {
    if (isPlaying && sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    } else {
      await generateAndPlaySpeech();
    }
  };

  return (
    <View style={styles.audioPlaybackWrapper}>
      <TouchableOpacity
        style={styles.audioPlaybackButton}
        onPress={togglePlayback}
        disabled={isLoading}
      >
        <MaterialIcons name="volume-up" size={18} color="#FFFFFF" />
        <Text style={styles.audioPlaybackText}>Correct</Text>
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
