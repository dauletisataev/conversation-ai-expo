import OpenAI from "openai";
import { OPENAI_API_KEY, ELEVENLABS_API_KEY } from "@env";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Note: In production, you'd want to use a backend service
});

// Cache for generated situations to prevent regeneration
let cachedSituations: Situation[] | null = null;

/**
 * Interface for a conversation situation
 */
export interface Situation {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  level: "beginner" | "intermediate" | "advanced";
}

/**
 * Interface for a conversation message
 */
export interface ConversationMessage {
  id: string;
  text: string;
  type: "system" | "ai" | "user";
  audioUrl?: string;
}

/**
 * Generate a list of conversation situations using OpenAI
 * @returns A promise that resolves to an array of situations
 */
export async function generateSituations(): Promise<Situation[]> {
  // If we already have cached situations, return them
  if (cachedSituations) {
    return cachedSituations;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that generates English conversation practice situations for language learners. Provide a list of 5 different scenarios that would be useful for practicing English conversation skills. Include a title, brief description, and difficulty level (beginner, intermediate, advanced) for each situation. return the response in json format. here is the format: {situations: [{id: string, title: string, description: string, level: string, imageUrl: string}]}",
        },
      ],
      response_format: { type: "json_object" },
    });

    const situations = JSON.parse(response.choices[0].message.content || "{}");
    const formattedSituations = situations.situations.map(
      (situation: any, index: number) => ({
        id: (index + 1).toString(),
        title: situation.title,
        description: situation.description,
        imageUrl: `https://randomuser.me/api/portraits/${
          index % 2 === 0 ? "women" : "men"
        }/${20 + index * 4}.jpg`,
        level: situation.level,
      })
    );

    // Cache the situations for future use
    cachedSituations = formattedSituations;

    return formattedSituations;
  } catch (error) {
    console.error("Error generating situations:", error);
    throw error;
  }
}

/**
 * Get a specific situation by ID without regenerating all situations
 * @param situationId The ID of the situation to get
 * @returns A promise that resolves to the requested situation
 */
export async function getSituation(situationId: string): Promise<Situation> {
  // Get the situations (either from cache or by generating them)
  const situations = await generateSituations();

  // Find the specific situation
  const situation = situations.find((s) => s.id === situationId);

  if (!situation) {
    throw new Error(`Situation with ID ${situationId} not found`);
  }

  return situation;
}

/**
 * Generate initial conversation messages for a specific situation
 * @param situationId The ID of the situation
 * @returns A promise that resolves to an array of conversation messages
 */
export async function generateInitialConversation(
  situationId: string
): Promise<ConversationMessage[]> {
  try {
    // Get the specific situation by ID (without regenerating all situations)
    const situation = await getSituation(situationId);

    // Generate an initial conversation for the situation
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content: `You are an assistant that helps generate English conversation practice for language learners. Generate an initial conversation for a "${situation.title}" scenario. The conversation should be appropriate for ${situation.level} level English learners. Return in JSON format with systemMessage (context explanation) and aiMessage (first message from conversation partner).`,
        },
      ],
      response_format: { type: "json_object" },
    });

    // Parse the response
    const conversation = JSON.parse(
      response.choices[0].message.content || "{}"
    );

    // Create conversation messages
    return [
      {
        id: "1",
        text:
          conversation.systemMessage ||
          `Welcome to the ${situation.title} simulation.`,
        type: "system",
      },
      {
        id: "2",
        text:
          conversation.aiMessage ||
          `Hello! Let's practice a ${situation.title} scenario.`,
        type: "ai",
        audioUrl: "", // Will be generated when needed
      },
    ];
  } catch (error) {
    console.error("Error generating conversation:", error);

    // Fallback to mock data if the API call fails
    const mockConversations: Record<string, ConversationMessage[]> = {
      "1": [
        {
          id: "1",
          text: "Welcome to the restaurant simulation. You're about to order dinner at a busy restaurant.",
          type: "system",
        },
        {
          id: "2",
          text: "Good evening! Welcome to our restaurant. My name is Emily and I'll be your server tonight. Would you like to see our specials?",
          type: "ai",
          audioUrl: "",
        },
      ],
    };

    return (
      mockConversations[situationId] || [
        {
          id: "1",
          text: "Welcome to the conversation practice. Let's start practicing!",
          type: "system",
        },
        {
          id: "2",
          text: "Hello! How are you today?",
          type: "ai",
          audioUrl: "",
        },
      ]
    );
  }
}

/**
 * Generate a response to a user message in a conversation
 * @param situationId The ID of the situation
 * @param conversation The current conversation history
 * @param userMessage The user's message
 * @returns A promise that resolves to a new AI response message
 */
export async function generateResponse(
  situationId: string,
  conversation: ConversationMessage[],
  userMessage: string
): Promise<ConversationMessage> {
  try {
    // Get the specific situation without regenerating all situations
    const situation = await getSituation(situationId);

    // Build the message history for context
    const messageHistory = conversation.map((msg) => {
      if (msg.type === "system") {
        return { role: "system" as const, content: msg.text };
      } else if (msg.type === "ai") {
        return { role: "assistant" as const, content: msg.text };
      } else {
        return { role: "user" as const, content: msg.text };
      }
    });

    // Add the current user message
    messageHistory.push({ role: "user" as const, content: userMessage });

    // Add a system message explaining the scenario and goal
    messageHistory.unshift({
      role: "system" as const,
      content: `You are a conversation partner in a "${situation.title}" scenario. The user is practicing English at a ${situation.level} level. Provide natural, helpful responses that encourage the conversation to continue. Keep responses concise (2-3 sentences) and appropriate for the context.`,
    });

    // Generate the AI response
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: messageHistory,
    });

    const aiResponseText = response.choices[0].message.content || "";

    return {
      id: `ai-${Date.now()}`,
      text: aiResponseText,
      type: "ai",
      audioUrl: "", // Will be generated when needed
    };
  } catch (error) {
    console.error("Error generating response:", error);

    // Fallback to a default response if the API call fails
    return {
      id: `ai-${Date.now()}`,
      text: "I understand. Could you tell me more about that?",
      type: "ai",
      audioUrl: "",
    };
  }
}

/**
 * Generate speech audio from text using ElevenLabs
 * @param text The text to convert to speech
 * @returns A promise that resolves to an audio URL
 */
export async function generateSpeech(text: string): Promise<string> {
  try {
    const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice

    // Make the API call to ElevenLabs
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to generate speech: ${response.statusText}`);
    }

    // Convert the response to a blob and create a URL
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    return audioUrl;
  } catch (error) {
    console.error("Error generating speech:", error);

    // For now, we'll return an empty string if there's an error
    // In a real app, you might want to show an error message to the user
    return "";
  }
}

export default {
  generateSituations,
  generateInitialConversation,
  generateResponse,
  generateSpeech,
};
