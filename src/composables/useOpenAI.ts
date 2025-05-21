// src/composables/useOpenAI.ts
import { ref } from 'vue';

// Define the structure of the content response from OpenAI
interface OpenAIContentResponse {
  text: string;
  verses: string[];
}

export default function useOpenAI() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

  const generateOpenAIContent = async (topic: string, contentType: 'devotion' | 'faithIntegration'): Promise<OpenAIContentResponse> => {
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

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-nano", // Or your preferred model
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: userPrompt
            }
          ],
          // Adjust parameters like max_tokens, temperature as needed
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'OpenAI API request failed');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Invalid response structure from OpenAI API');
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
    generateOpenAIContent, // Export the renamed function
  };
}
