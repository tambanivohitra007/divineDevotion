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

  const generateGeminiContent = async (topic: string, contentType: 'devotion' | 'faithIntegration'): Promise<GeminiContentResponse> => {
    isLoading.value = true;
    error.value = null;

    let systemPrompt = "";
    let userPrompt = "";

    if (contentType === 'devotion') {
      systemPrompt = "You are an AI assistant designed to generate devotionals. All content must be strictly rooted in and aligned with: (1) The Holy Bible (preferably using a translation consistent with SDA usage, such as KJV or NKJV), (2) The complete, published writings of Ellen G. White, and (3) The official doctrines and fundamental beliefs of the Seventh-day Adventist Church. You must not incorporate any beliefs, interpretations, or doctrines from other religious denominations, secular philosophies, or external theological sources. If a concept or interpretation cannot be directly supported by the Bible, Ellen G. White’s writings, or official SDA teachings, do not include it. The devotionals should be spiritually uplifting, biblically sound, and suitable for a Seventh-day Adventist audience, offering insight, hope, and encouragement rooted in present truth. Each devotional must be between 5 to 8 paragraphs long. When referencing Bible verses, present them as an array of strings in this format: [\"John 3:16\", \"Psalm 23:1\"].";
      userPrompt = `Generate a devotional about: ${topic}. Please provide the devotional text and a list of relevant Bible verses.`;
    } else if (contentType === 'faithIntegration') {
      systemPrompt = "You are an AI assistant designed to generate ideas for integrating faith and learning into teaching. All content must be strictly rooted in and aligned with: (1) The Holy Bible (preferably using a translation consistent with SDA usage, such as KJV or NKJV), (2) The complete, published writings of Ellen G. White, and (3) The official doctrines and fundamental beliefs of the Seventh-day Adventist Church. You must not incorporate any beliefs, interpretations, or doctrines from other religious denominations, secular philosophies, or external theological sources. If a concept or interpretation cannot be directly supported by the Bible, Ellen G. White’s writings, or official SDA teachings, do not include it. The ideas should be practical, insightful, and suitable for educators in a Seventh-day Adventist context, offering ways to connect subject matter with spiritual principles. Each set of ideas should be presented clearly. If relevant, you can include Bible verses that support the integration ideas, presented as an array of strings in this format: [\"John 3:16\", \"Psalm 23:1\"].";
      userPrompt = `Generate ideas for integrating faith and learning into teaching for the topic: ${topic}. Please provide the integration ideas and a list of relevant Bible verses, if applicable.`;
    }

    try {      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\n${userPrompt}`
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

      const verseMatch = content.match(/\[\s*"([^"]*)"\s*(,\s*"([^"]*)"\s*)*\]/);
      if (verseMatch && verseMatch[0]) {
        try {
          parsedVerses = JSON.parse(verseMatch[0]);
          parsedText = content.replace(verseMatch[0], "").trim();
        } catch (parseError) {
          console.error("Failed to parse verses from content:", parseError);
        }
      } else {
        console.warn("Could not find a clear Bible verse array in the response. The AI might need more specific formatting instructions or this content type may not include verses.");
      }
      
      return { text: parsedText, verses: parsedVerses };
    } catch (e: any) {
      console.error("Error generating content:", e);
      error.value = e.message || 'Failed to generate content.';
      // Return a structured error response or rethrow, depending on how App.vue handles it
      // For now, rethrowing to be caught by the caller in App.vue
      throw e; 
    } finally {
      isLoading.value = false;
    }
  };
  return {
    isLoading,
    error,
    generateGeminiContent, // Export the Gemini function
  };
}
