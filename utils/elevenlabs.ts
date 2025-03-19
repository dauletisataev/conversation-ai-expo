import { Audio } from "expo-av";
import type { PodcastParticipant, PodcastMessage } from "./openai";
import { ELEVENLABS_API_KEY } from "@env";

// These will be the voice IDs from ElevenLabs
// Each podcast participant should have a unique voice
export const PREDEFINED_VOICES: Record<string, { id: string; name: string }> = {
  elon_musk: { id: "pNInz6obpgDQGcFmaJgB", name: "Elon Musk" },
  joe_rogan: { id: "ODq5zmih8GrVes37Dizd", name: "Joe Rogan" },
  bill_gates: { id: "pNInz6obpgDQGcFmaJgB", name: "Bill Gates" },
  tim_cook: { id: "o7lPisNne0wNCpD9zCkY", name: "Tim Cook" },
  user: { id: "custom", name: "You" },
};

// Base URLs for ElevenLabs API
const BASE_URL = "https://api.elevenlabs.io/v1";
const API_KEY = ELEVENLABS_API_KEY;

/**
 * Convert text to speech using ElevenLabs
 * @param text The text to convert to speech
 * @param voiceId The ElevenLabs voice ID to use
 * @returns An Audio.Sound object
 */
export async function textToSpeech(
  text: string,
  voiceId: string
): Promise<Audio.Sound> {
  try {
    // Skip API call for the user's voice or any "custom" voice
    if (voiceId === "user" || voiceId === "custom") {
      throw new Error("Cannot convert custom or user text to speech");
    }

    // Get the predefined voice ID if it exists
    const voice = PREDEFINED_VOICES[voiceId];
    const elevenlabsVoiceId = voice ? voice.id : voiceId;

    const response = await fetch(
      `${BASE_URL}/text-to-speech/${elevenlabsVoiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            speed: 1.2,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
    }

    // Get audio data
    const audioData = await response.arrayBuffer();

    // Create a blob URL from the audio data
    const blob = new Blob([audioData], { type: "audio/mpeg" });
    const blobUrl = URL.createObjectURL(blob);

    // Load and play the audio
    const { sound } = await Audio.Sound.createAsync({ uri: blobUrl });
    return sound;
  } catch (error) {
    console.error("Error converting text to speech:", error);
    throw error;
  }
}

/**
 * Play audio for a message
 * @param message The message to play
 * @param participants The list of participants
 * @returns A promise that resolves when the audio finishes playing
 */
export async function playMessageAudio(
  message: PodcastMessage,
  participants: PodcastParticipant[]
): Promise<void> {
  try {
    // Find the participant matching the message role
    const participant = participants.find(
      (p) => p.name.toLowerCase() === message.role.toLowerCase()
    );

    if (!participant || participant.id === "user") {
      // Skip audio playback for user or unknown participants
      return;
    }

    // Convert message to speech using participant ID
    const sound = await textToSpeech(message.content, participant.id);

    // Play the audio
    await sound.playAsync();

    // Wait for audio to finish
    return new Promise((resolve) => {
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().then(() => resolve());
        }
      });
    });
  } catch (error) {
    console.error("Error playing message audio:", error);
  }
}

/**
 * Implement speech-to-text functionality using ElevenLabs API
 * @param audioUri The URI of the audio file to transcribe
 * @returns The transcribed text
 */
export async function speechToText(audioUri: string): Promise<string> {
  try {
    // Convert the audio file to a Blob
    const response = await fetch(audioUri);
    const audioBlob = await response.blob();

    // Create form data for the API request
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.m4a");
    formData.append("model_id", "scribe_v1");
    formData.append("language_code", "en");

    // Send to ElevenLabs API
    const transcriptionResponse = await fetch(`${BASE_URL}/speech-to-text`, {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      throw new Error(
        `ElevenLabs API error: ${transcriptionResponse.status} ${errorText}`
      );
    }

    // Parse the response
    const transcriptionResult = await transcriptionResponse.json();
    return transcriptionResult.text || "Sorry, I couldn't transcribe that.";
  } catch (error) {
    console.error("Error in speech to text:", error);
    throw error;
  }
}

export default {
  textToSpeech,
  playMessageAudio,
  speechToText,
  PREDEFINED_VOICES,
};
