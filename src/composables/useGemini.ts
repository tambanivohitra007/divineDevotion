// src/composables/useGemini.ts
import { ref } from 'vue';

// Define the structure of the content response from Gemini
interface GeminiContentResponse {
  text: string;
  verses: string[];
}

export default function useGemini() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  const generateGeminiContent = async (
    topic: string, 
    contentType: 'devotion' | 'faithIntegration',
    locale: string = 'en'
  ): Promise<GeminiContentResponse> => {
    isLoading.value = true;
    error.value = null;

    let systemPrompt = "";
    let userPrompt = "";

    // Language-specific instructions
    const languageInstructions = locale === 'fr' 
      ? "Please respond in French. Use proper French grammar, vocabulary, and religious terminology."
      : "Please respond in English.";

    // This base prompt contains the core instructions and guardrails for the AI.
    const baseSystemPrompt = `
${languageInstructions}

You are an AI assistant creating biblically-based content. Your internal knowledge base and guiding principles for generating all content are strictly rooted in and aligned with:
(1) The Holy Bible (66-book Protestant canon, preferably KJV or NKJV).
(2) The complete, published writings of Ellen G. White.
(3) The official doctrines and fundamental beliefs of the Seventh-day Adventist Church.

**Crucial Content & Language Guidelines:**
- **Audience-Facing Language:** Your final output MUST NOT contain the phrases "Seventh-day Adventist," "SDA," or "Ellen G. White." This is a strict presentation rule. The final output must be welcoming to a broad Christian audience.
- **Verification of Canon:** You MUST verify that any requested Bible verse or book exists within the standard 66-book Protestant canon. If a user references a non-canonical, apocryphal, or invented text (e.g., "3 Corinthians"), you must gently correct them and offer to proceed with a canonical text.
- **Doctrinal Purity:** You MUST reject any premise inconsistent with the guiding framework (e.g., reincarnation, new age concepts like "manifesting energy"). Politely state that the concept is not biblically supported and pivot to a related, biblically sound topic (e.g., pivot from reincarnation to the resurrection).
`;

    if (contentType === 'devotion') {
      systemPrompt = baseSystemPrompt + `
      **Task: Generate a Devotional**
      1.  Write a spiritually uplifting devotional (5-8 paragraphs) on the user's topic.
      2.  The tone should be insightful, hopeful, and suitable for a general Christian audience.

      **--- FINAL OUTPUT CHECKLIST (MUST FOLLOW) ---**
      1.  **No Forbidden Phrases:** Did I avoid mentioning "Seventh-day Adventist," "SDA," or "Ellen G. White"?
      2.  **Verse Formatting:** Is the very last part of my response a single, clean JSON array of all Bible verses I referenced? Example: ["John 3:16", "Psalm 23:1"]. I must not mention verses anywhere else.
      `;
      userPrompt = `Generate a devotional about: ${topic}.`;
    } else if (contentType === 'faithIntegration') {
      systemPrompt = baseSystemPrompt + `
      **Task: Generate Faith Integration Ideas**
      1.  Provide practical and insightful ideas for educators in a Christian context.
      2.  Present the ideas clearly and concisely.

      **--- FINAL OUTPUT CHECKLIST (MUST FOLLOW) ---**
      1.  **No Forbidden Phrases:** Did I avoid mentioning "Seventh-day Adventist," "SDA," or "Ellen G. White"?
      2.  **Verse Formatting:** If I referenced verses, is the very last part of my response a single, clean JSON array of those verses? Example: ["Proverbs 9:10"]. I must not mention verses anywhere else.
      `;
      userPrompt = `Generate ideas for integrating faith and learning into teaching for the topic: ${topic}.`;
    }

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              // The system and user prompts are combined here.
              text: `${systemPrompt}\n\nUser query: ${userPrompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Gemini API request failed');
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) {
        throw new Error('Invalid response structure from Gemini API');
      }
      
      let parsedText = content;
      let parsedVerses: string[] = [];

      // This regex is designed to find a JSON array of strings at the very end of the text.
      const verseMatch = content.match(/\[\s*"([^"]+)"(?:\s*,\s*"[^"]+")*\s*\]\s*$/);
      
      if (verseMatch && verseMatch[0]) {
        try {
          // Attempt to parse the matched string as JSON.
          parsedVerses = JSON.parse(verseMatch[0]);
          // Remove the parsed verses from the main text body.
          parsedText = content.substring(0, verseMatch.index).trim();
        } catch (parseError) {
          console.error("Failed to parse verses from content:", parseError);
          // If parsing fails, leave the text as is, and the warning will be logged.
        }
      } 
      
      if (parsedVerses.length === 0 && content.includes(":")) { // Simple check if verses might be present but unparsed
          console.warn("Could not find or parse a Bible verse array at the end of the response.");
      }
      
      return { text: parsedText, verses: parsedVerses };
    } catch (e: any) {
      console.error("Error generating content:", e);
      error.value = e.message || 'Failed to generate content.';
      // Rethrow the error to be handled by the calling component.
      throw e;
    } finally {
      isLoading.value = false;
    }
  };
  return {
    isLoading,
    error,
    generateGeminiContent,
  };
}
