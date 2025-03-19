import React, { useState } from "react";
import { TouchableOpacity, View, Text, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { styles } from "../styles";

interface MicrophoneButtonProps {
  onRecordingComplete: (text: string, audioUri: string | null) => void;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  elevenlabsApiKey: string;
  isCorrect: boolean | null;
  transcribedText: string;
  expectedText: string;
}

export const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  onRecordingComplete,
  isRecording,
  setIsRecording,
  elevenlabsApiKey,
  isCorrect,
  transcribedText,
  expectedText,
}) => {
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);

  // Helper function to normalize text for display and comparison
  const getNormalizedText = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[.,!?;:'"()\[\]{}]/g, "") // Remove punctuation
      .trim()
      .replace(/\s+/g, " "); // Normalize spaces
  };

  const startRecording = async () => {
    try {
      // Reset states when starting a new recording
      setError(null);
      setAudioUri(null);

      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        setError("Permission to access microphone was denied");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording", error);
      setError(`Failed to start recording. Please try again. ${error}`);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    setLoading(true);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) {
        throw new Error("Recording URI is null");
      }

      // Save the audio URI for playback
      setAudioUri(uri);

      // Process the audio with ElevenLabs
      await processAudioWithElevenLabs(uri);
    } catch (error) {
      console.error("Failed to stop recording", error);
      setError("Failed to process recording. Please try again.");
    } finally {
      setLoading(false);
      setRecording(null);
    }
  };

  const processAudioWithElevenLabs = async (audioUri: string) => {
    try {
      // Convert the audio file to a Blob
      const response = await fetch(audioUri);
      const blob = await response.blob();

      // Create form data to send to ElevenLabs
      const formData = new FormData();
      formData.append("file", blob, "recording.m4a");
      formData.append("model_id", "scribe_v1");
      formData.append("language_code", "en");

      // Send to ElevenLabs API
      const apiResponse = await fetch(
        "https://api.elevenlabs.io/v1/speech-to-text",
        {
          method: "POST",
          headers: {
            "xi-api-key": elevenlabsApiKey,
          },
          body: formData,
        }
      );

      if (!apiResponse.ok) {
        throw new Error(`ElevenLabs API error: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      const transcribedText = data.text;

      // Pass the transcribed text and audio URI back to parent component
      onRecordingComplete(transcribedText, audioUri);
    } catch (error) {
      console.error("Error processing audio with ElevenLabs:", error);
      setError("Error processing audio. Please try again.");
      onRecordingComplete("", null); // Pass empty string to indicate error
    }
  };

  const renderResultsFeedback = () => {
    if (!transcribedText && !error && !loading && !isRecording) {
      return null;
    }

    if (loading) {
      return (
        <View style={styles.transcriptionContainer}>
          <Text style={styles.processingText}>Processing your speech...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={[styles.transcriptionContainer, styles.errorContainer]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (transcribedText) {
      const normalizedTranscribed = getNormalizedText(transcribedText);
      const normalizedExpected = getNormalizedText(expectedText);

      return (
        <View
          style={[
            styles.transcriptionContainer,
            isCorrect !== null
              ? isCorrect
                ? styles.correctFeedback
                : styles.incorrectFeedback
              : null,
          ]}
        >
          <Text style={styles.transcriptionLabel}>You said:</Text>
          <Text
            style={[
              styles.transcriptionText,
              isCorrect !== null
                ? isCorrect
                  ? styles.correctFeedbackTitle
                  : styles.incorrectFeedbackTitle
                : null,
            ]}
          >
            "{transcribedText}"
          </Text>

          {isCorrect === false && (
            <>
              <Text style={styles.transcriptionLabel}>Expected:</Text>
              <Text style={styles.transcriptionText}>"{expectedText}"</Text>

              {expectedText !== normalizedExpected && (
                <Text style={styles.transcriptionNormalizedText}>
                  (Normalized: "{normalizedExpected}")
                </Text>
              )}
            </>
          )}
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.microphoneContainer}>
      {renderResultsFeedback()}

      <TouchableOpacity
        style={[
          styles.microphoneButton,
          isRecording ? styles.recordingButton : null,
          isCorrect === true ? styles.correctButton : null,
          isCorrect === false ? styles.incorrectButton : null,
        ]}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={loading || isCorrect === true}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="large" />
        ) : (
          <MaterialIcons
            name={
              isRecording
                ? "stop"
                : isCorrect === true
                ? "check"
                : isCorrect === false
                ? "close"
                : "mic"
            }
            size={32}
            color="#FFFFFF"
          />
        )}
      </TouchableOpacity>
      <Text style={styles.microphoneText}>
        {loading
          ? "Processing..."
          : isRecording
          ? "Tap to stop"
          : isCorrect === true
          ? "Great job!"
          : isCorrect === false
          ? "Try again"
          : "Tap to speak"}
      </Text>
    </View>
  );
};
