import { OpenAI } from "openai";
import { OPENAI_API_KEY } from "@env";

// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const OPENAI_MODEL = "gpt-4o-mini-2024-07-18";
const SYSTEM_PROMPT = `You are an assistant that creates engaging podcast conversations between the user and selected participants. 
The conversation should be natural, insightful, and informative, starting with participants introducing themselves briefly.

Create a conversation flow that follows this pattern:
1. BEGIN WITH A NATURAL INTRODUCTION: Start with short intros where participants briefly mention who they are.
2. VERY BRIEF EXCHANGES BETWEEN NON-USER PARTICIPANTS: Create at most 1-2 brief exchanges between the non-user participants only, where they naturally discuss the topic. The user should NOT be part of these initial exchanges.
3. QUESTION FOR THE USER: Quickly have one of the participants direct a thoughtful, open-ended question to the user that invites their perspective.

Each message should be concise and focused (1-2 sentences maximum).
Different participants should have different speaking styles matching their personalities.

DO NOT use narrator text or stage directions.
DO NOT include timestamps.
DO NOT include any prefixes like "Participant:" before messages.
DO NOT make participants agree too much - include respectful disagreements and diverse perspectives.
DO NOT write any messages on behalf of the user. The real user will respond when prompted.

Format each message as:
{"role": "participant_name", "content": "What they say"}

The system will handle each participant speaking in turn, so ONLY return conversation content in the proper JSON format for each message.`;

// Type definitions
export interface PodcastParticipant {
  id: string;
  name: string;
  description: string;
  avatarUrl: string;
}

export interface PodcastMessage {
  role: string;
  content: string;
}

const openaiService = {
  // Generate a podcast conversation between participants
  generatePodcastConversation: async (
    topic: string,
    participants: PodcastParticipant[],
    userName: string,
    options: {
      structuredFormat?: boolean;
      includeFinalQuestion?: boolean;
    } = {}
  ): Promise<PodcastMessage[]> => {
    try {
      // Prepare participant information
      const nonUserParticipants = participants.filter(
        (p) => p.name !== userName
      );
      const participantInfo = nonUserParticipants
        .map((p) => `- ${p.name}: ${p.description}`)
        .join("\n");

      let prompt = SYSTEM_PROMPT;

      // Add structured format instructions if requested
      if (options.structuredFormat) {
        prompt += `\n\nThe discussion should follow a structured pattern:
1. START WITH ONLY 1-2 BRIEF EXCHANGES between non-user participants only (${nonUserParticipants
          .map((p) => p.name)
          .join(", ")}). These should be very concise.
2. The discussion should touch on different aspects of the topic briefly, with minimal tangents.
3. QUICKLY move to having one participant ask "${userName}" a thoughtful question.`;
      }

      // Add final question instruction if requested
      if (options.includeFinalQuestion) {
        prompt += `\n\nENSURE THE FINAL MESSAGE is a clear, open-ended question directed to "${userName}". Make it obvious that it's ${userName}'s turn to respond. The question should be thought-provoking and clearly indicate that you're seeking their perspective.`;
      }

      // Generate conversation using OpenAI API
      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "user",
            content: `Create a podcast discussion on the topic: "${topic}".

The participants are:
${participantInfo}
And the user: ${userName}

Remember:
1. START with ONLY 1-2 brief exchanges between the participants (${nonUserParticipants
              .map((p) => p.name)
              .join(", ")}), NOT including ${userName}.
2. Quickly move to having one of the participants ask ${userName} a thoughtful question.
3. Keep each message very concise (1-2 sentences, 10-30 words maximum) to maintain a natural podcast flow.
4. Format each response as {"role": "participant_name", "content": "message"}.
5. Move to involving ${userName} with a question very quickly.`,
          },
        ],
        temperature: 1,
        max_tokens: 2048,
      });

      // Parse the response
      const messages: PodcastMessage[] = [
        {
          role: "system",
          content: `This is a podcast conversation on the topic: "${topic}" with participants: ${participants
            .map((p) => p.name)
            .join(", ")}`,
        },
      ];

      // Process the generated text
      const generatedText = response.choices[0].message.content || "";

      // Extract messages - handle both array and individual message formats
      try {
        // Try parsing as JSON array first
        if (generatedText.trim().startsWith("[")) {
          const parsedMessages = JSON.parse(generatedText);
          if (Array.isArray(parsedMessages)) {
            messages.push(...parsedMessages);
          }
        } else {
          // Extract individual JSON objects
          const messageRegex = /{(?:[^{}]|{[^{}]*})*}/g;
          const matches = generatedText.match(messageRegex);

          if (matches) {
            matches.forEach((match) => {
              try {
                const parsedMessage = JSON.parse(match);
                if (parsedMessage.role && parsedMessage.content) {
                  messages.push({
                    role: parsedMessage.role.toLowerCase(),
                    content: parsedMessage.content,
                  });
                }
              } catch (error) {
                console.warn("Failed to parse message:", match);
              }
            });
          }
        }
      } catch (error) {
        console.error("Error parsing generated messages:", error);
        // Fallback to regex extraction if JSON parsing fails
        const messageRegex = /{(?:[^{}]|{[^{}]*})*}/g;
        const matches = generatedText.match(messageRegex);

        if (matches) {
          matches.forEach((match) => {
            try {
              const parsedMessage = JSON.parse(match);
              if (parsedMessage.role && parsedMessage.content) {
                messages.push({
                  role: parsedMessage.role.toLowerCase(),
                  content: parsedMessage.content,
                });
              }
            } catch (error) {
              console.warn("Failed to parse message in fallback:", match);
            }
          });
        }
      }

      return messages;
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to generate podcast conversation");
    }
  },

  // Continue a podcast conversation based on user input
  continuePodcastConversation: async (
    previousMessages: PodcastMessage[],
    participants: PodcastParticipant[],
    userResponse: string,
    options: {
      structuredFormat?: boolean;
      includeFinalQuestion?: boolean;
    } = {}
  ): Promise<PodcastMessage[]> => {
    try {
      // Extract the user's name from the participants
      const userParticipant = participants.find((p) => p.id === "user");
      const userName = userParticipant?.name || "You";

      // Prepare the conversation history - convert to OpenAI format
      const history = previousMessages
        .filter((msg) => msg.role !== "system")
        .map((msg) => {
          if (msg.role === userName.toLowerCase()) {
            return {
              role: "user" as const,
              content: msg.content,
            };
          } else {
            return {
              role: "assistant" as const,
              content: `{"role": "${msg.role}", "content": "${msg.content
                .replace(/"/g, '\\"')
                .replace(/\n/g, "\\n")}"}`,
            };
          }
        });

      // Get non-user participants
      const nonUserParticipants = participants.filter(
        (p) => p.name !== userName
      );

      let prompt = SYSTEM_PROMPT;

      // Add structured format instructions if requested
      if (options.structuredFormat) {
        prompt += `\n\nThe continuation should follow this pattern:
1. ACKNOWLEDGE the user's response with relevant follow-up from one or more participants.
2. CONTINUE WITH ONLY 1-2 BRIEF EXCHANGES between the non-user participants (${nonUserParticipants
          .map((p) => p.name)
          .join(", ")}).
3. QUICKLY have one participant ask ${userName} another thoughtful question.`;
      }

      // Add final question instruction if requested
      if (options.includeFinalQuestion) {
        prompt += `\n\nENSURE THE FINAL MESSAGE is a clear, open-ended question directed to "${userName}". Make it obvious that it's ${userName}'s turn to respond again. The question should be thought-provoking and clearly indicate that you're seeking their perspective.`;
      }

      // Request continuation
      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content: prompt,
          },
          ...history,
          {
            role: "user",
            content: `Continue the conversation with the following pattern:
1. Have one of the participants respond directly to ${userName}'s last message with a relevant follow-up or comment.
2. Then have ONLY 1-2 BRIEF EXCHANGES between the participants (${nonUserParticipants
              .map((p) => p.name)
              .join(", ")}), NOT including ${userName}.
3. QUICKLY return to asking ${userName} another thoughtful question.
4. Keep each message very concise (1-2 sentences maximum, 10-30 words) to maintain a natural podcast flow.
5. Format each response as {"role": "participant_name", "content": "message"}.`,
          },
        ],
        temperature: 1,
        max_tokens: 2048,
      });

      // Process the response
      const generatedText = response.choices[0].message.content || "";

      // Extract messages
      const newMessages: PodcastMessage[] = [];
      try {
        // Try parsing as JSON array first
        if (generatedText.trim().startsWith("[")) {
          const parsedMessages = JSON.parse(generatedText);
          if (Array.isArray(parsedMessages)) {
            newMessages.push(...parsedMessages);
          }
        } else {
          // Extract individual JSON objects
          const messageRegex = /{(?:[^{}]|{[^{}]*})*}/g;
          const matches = generatedText.match(messageRegex);

          if (matches) {
            matches.forEach((match) => {
              try {
                const parsedMessage = JSON.parse(match);
                if (parsedMessage.role && parsedMessage.content) {
                  newMessages.push({
                    role: parsedMessage.role.toLowerCase(),
                    content: parsedMessage.content,
                  });
                }
              } catch (error) {
                console.warn("Failed to parse message:", match);
              }
            });
          }
        }
      } catch (error) {
        console.error("Error parsing generated messages:", error);
        // Fallback
        const messageRegex = /{(?:[^{}]|{[^{}]*})*}/g;
        const matches = generatedText.match(messageRegex);

        if (matches) {
          matches.forEach((match) => {
            try {
              const parsedMessage = JSON.parse(match);
              if (parsedMessage.role && parsedMessage.content) {
                newMessages.push({
                  role: parsedMessage.role.toLowerCase(),
                  content: parsedMessage.content,
                });
              }
            } catch (error) {
              console.warn("Failed to parse message in fallback:", match);
            }
          });
        }
      }

      // Return the updated conversation
      return newMessages;
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to continue podcast conversation");
    }
  },
};

export default openaiService;
