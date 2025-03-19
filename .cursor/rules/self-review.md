### 1: Centralized API Services

##### Current Issue

The codebase lacks centralized API service management. API calls to OpenAI and ElevenLabs are scattered across components with duplicated patterns. Business logic is mixed with API communication code.

##### Problems

- Maintenance Burden: Changes to API request/response schemas require updates in multiple files
- Reduced Readability: Business logic is entangled with serialization/deserialization code
- Inconsistent Error Handling: Each component implements its own error handling for similar API calls

##### Solution

Create dedicated API service modules that:

- Centralize all external API communication
- Abstract implementation details behind clear interfaces
- Provide consistent error handling and retries
- Separate business logic from API communication concerns

##### Implementation Example

```typescript
// Centralized ElevenLabs API service
import { ELEVENLABS_API_KEY } from "@env";

export class ElevenLabsService {
  private apiKey = ELEVENLABS_API_KEY;

  async transcribeSpeech(audioBlob: Blob): Promise<string> {
    try {
      // Implementation details hidden from components
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");
      formData.append("model_id", "scribe_v1");

      const response = await fetch(
        "https://api.elevenlabs.io/v1/speech-to-text",
        {
          method: "POST",
          headers: { "xi-api-key": this.apiKey },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`);
      }

      const result = await response.json();
      return result.text;
    } catch (error) {
      console.error("ElevenLabs transcription error:", error);
      // pass to sentry tracing etc
      throw new Error("Speech transcription failed");
    }
  }
}
```

### 2: Enhance Reusability of Microphone Logic

##### Current Issue

The codebase contains three separate microphone implementations across different features, each with its own approach to permissions, recording, and error handling. This duplication creates inconsistency and maintenance challenges.

##### Problems

- **Code Duplication**: Similar microphone logic is reimplemented in multiple components
- **Inconsistent User Experience**: Different error handling and permission flows
- **Maintenance Overhead**: Bug fixes or improvements must be applied in multiple places
- **Feature Discrepancies**: Advanced features may only exist in some implementations

##### Solution

Create a reusable microphone hook and utilities that:

- Handle permissions consistently
- Manage recording lifecycle (start, stop, pause)
- Standardize error handling and feedback
- Abstract platform differences (web vs. native)

##### Implementation Example

```jsx
<Microphone onAudioRecorded={(audio) => someFunctionHandler(audio)} />
```

And this component can use such hook.

```typescript
import { useState, useEffect } from "react";
import { Audio } from "expo-av";
import { Platform } from "react-native";

export function useMicrophone() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permission, setPermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setPermission(status === "granted");
    })();

    // Cleanup recording on unmount
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  // Start recording function
  const startRecording = async () => {
    try {
      if (!permission) {
        setError("Microphone permission not granted");
        return false;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setError(null);
      return true;
    } catch (err) {
      setError("Failed to start recording");
      console.error(err);
      return false;
    }
  };

  return {
    isRecording,
    error,
    startRecording,
    stopRecording,
  };
}
```

## PodcastScreen implementation is sh\*t

- It tries to hold logic for each step of podcast feature, using `PodcastStage` state -> screens/steps need to be divided
- Tooo many service logic inside one UI file -> move service logic to service files.
- UI components should be easily readable and resemble a LEGO constructor
- The management of speaker turns are buggy because of the spagetti code -> Should be rewritten with clear structure

## Styles

- currently all are dumped in big files
- divide into smaller pieaces and try to hold near the components they are intended to apply
