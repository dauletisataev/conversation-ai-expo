import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
} from "react-native";
import { Mic, Send, X, PlayCircle, Pause } from "lucide-react-native";
import { Audio } from "expo-av";
import { speechToText } from "../utils/elevenlabs";

type Props = {
  onSubmitResponse: (response: string) => void;
  onCancel: () => void;
};

export default function PodcastResponseInput({
  onSubmitResponse,
  onCancel,
}: Props) {
  const [response, setResponse] = useState("");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingAnimation = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Recording animation
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingAnimation, {
            toValue: 1.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(recordingAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start recording timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      // Reset animation when not recording
      recordingAnimation.setValue(1);

      // Clear recording timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, recordingAnimation]);

  // Cleanup sound when component unmounts
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Format seconds into mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      // Reset any previous error and recording
      setRecordingError(null);
      setRecordingUri(null);

      // Unload any existing sound
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        setRecordingError("Permission to access microphone is required!");
        return;
      }

      // Configure the recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await newRecording.startAsync();

      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      setRecordingError(`Failed to start recording: ${error}`);
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      // Stop recording
      setIsRecording(false);
      await recording.stopAndUnloadAsync();

      // Start transcribing
      setIsTranscribing(true);

      // Get the recording URI
      const uri = recording.getURI();
      if (!uri) {
        throw new Error("No recording URI found");
      }

      // Save the recording URI for playback
      setRecordingUri(uri);

      try {
        // Use the updated speechToText function with the audio URI
        const transcript = await speechToText(uri);

        // Update the response with the transcribed text
        if (transcript) {
          setResponse(transcript);
        } else {
          setRecordingError("No speech detected. Please try again.");
        }
      } catch (error: any) {
        setRecordingError(`Failed to transcribe: ${error.message}`);
        console.error("Failed to transcribe audio:", error);
      }
    } catch (error: any) {
      setRecordingError(`Recording error: ${error.message}`);
      console.error("Failed to stop recording:", error);
    } finally {
      setIsTranscribing(false);
      setRecording(null);
    }
  };

  const playRecording = async () => {
    if (!recordingUri) return;

    try {
      // If sound is already loaded, play it
      if (sound) {
        await sound.playFromPositionAsync(0);
      } else {
        // Load and play the recording
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: recordingUri },
          { shouldPlay: true }
        );

        setSound(newSound);

        // Set up playback status listener
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);

            // When playback finishes
            if (status.didJustFinish) {
              setIsPlaying(false);
            }
          }
        });
      }

      setIsPlaying(true);
    } catch (error) {
      console.error("Failed to play recording:", error);
      setRecordingError("Failed to play recording");
    }
  };

  const stopPlayback = async () => {
    if (!sound) return;

    try {
      await sound.stopAsync();
      setIsPlaying(false);
    } catch (error) {
      console.error("Failed to stop playback:", error);
    }
  };

  const handleSubmit = () => {
    if (response.trim()) {
      onSubmitResponse(response.trim());
      setResponse("");
      setRecordingUri(null);

      // Unload sound if exists
      if (sound) {
        sound.unloadAsync();
        setSound(null);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Response</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
          <X size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        value={response}
        onChangeText={setResponse}
        placeholder="Type your response here or use the microphone..."
        placeholderTextColor="#94A3B8"
        multiline
        autoFocus
      />

      {recordingError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{recordingError}</Text>
        </View>
      )}

      <View style={styles.buttonsContainer}>
        {isRecording ? (
          <Animated.View
            style={[
              styles.recordingButton,
              { transform: [{ scale: recordingAnimation }] },
            ]}
          >
            <TouchableOpacity
              style={styles.recordingButtonInner}
              onPress={stopRecording}
            >
              <View style={styles.recordingIndicator} />
            </TouchableOpacity>
          </Animated.View>
        ) : isTranscribing ? (
          <View style={styles.micButton}>
            <ActivityIndicator size="small" color="#FFFFFF" />
          </View>
        ) : recordingUri && !isPlaying ? (
          <TouchableOpacity style={styles.playButton} onPress={playRecording}>
            <PlayCircle size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ) : recordingUri && isPlaying ? (
          <TouchableOpacity style={styles.playButton} onPress={stopPlayback}>
            <Pause size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.micButton} onPress={startRecording}>
            <Mic size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.submitButton,
            !response.trim() && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!response.trim()}
        >
          <Send size={20} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      {isRecording && (
        <View style={styles.recordingStatusContainer}>
          <View style={styles.recordingStatusDot} />
          <Text style={styles.recordingText}>
            Recording {formatTime(recordingTime)}
          </Text>
        </View>
      )}

      {isTranscribing && (
        <Text style={styles.transcribingText}>Transcribing your speech...</Text>
      )}

      {recordingUri && !isRecording && !isTranscribing && (
        <Text style={styles.statusText}>
          {isPlaying
            ? "Playing your recording..."
            : "You can play back your recording or edit the text before sending."}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1E293B",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: "Inter-Bold",
    fontSize: 18,
    color: "#E2E8F0",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    color: "#E2E8F0",
    fontFamily: "Inter-Regular",
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(59, 130, 246, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(59, 130, 246, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  recordingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  recordingButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(239, 68, 68, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  recordingIndicator: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: "white",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginLeft: 16,
    flex: 1,
  },
  submitButtonDisabled: {
    backgroundColor: "rgba(59, 130, 246, 0.3)",
  },
  submitButtonText: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "white",
    marginLeft: 8,
  },
  errorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  errorText: {
    color: "#F05252",
    fontFamily: "Inter-Regular",
    fontSize: 14,
  },
  recordingStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  recordingStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F05252",
    marginRight: 8,
  },
  recordingText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#F05252",
  },
  transcribingText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#3B82F6",
    textAlign: "center",
    marginTop: 16,
  },
  statusText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 16,
  },
});
