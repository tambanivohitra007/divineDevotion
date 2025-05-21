// src/composables/useOpenAI.ts
import { ref } from 'vue';

// Define the structure of the devotion response from OpenAI (this is an example)
interface OpenAIDevotionResponse {
  text: string;
  verses: string[];
}

export default function useOpenAI() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // API Key is now read from environment variables
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'; // Example for chat completions

  const generateOpenAIDevotion = async (topic: string): Promise<OpenAIDevotionResponse> => {
    isLoading.value = true;
    error.value = null;

    try {
      // console.log(`Simulating OpenAI API call for topic: ${topic}`);
      // console.warn('Remember to replace this with a real OpenAI API call and manage your API key securely.');

      // Simulate API call delay
      // await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulated response structure - adapt this to your actual API response
      // const simulatedResponse: OpenAIDevotionResponse = {
      //   text: `This is a spiritually uplifting devotional about "${topic}" based on Bible teachings, Ellen G. White's writings, and SDA beliefs. It aims to provide comfort and guidance. We encourage you to reflect on these words and find peace in your journey. May this devotion strengthen your faith and bring you closer to understanding divine love and purpose.`,
      //   verses: ['Jeremiah 29:11', 'Philippians 4:13', '1 Corinthians 10:31'],
      // };

      // In a real scenario, you would parse the actual response from OpenAI.
      // Example of a fetch call (you might need a library like axios for more complex scenarios):
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
              content: "You are an AI assistant programmed to generate devotionals. Your primary directive is to ensure all content is STRICTLY rooted in and aligned with: \n1. The Holy Bible. \n2. The complete published writings of Ellen G. White. \n3. The official doctrines and beliefs of the Seventh-day Adventist (SDA) Church. \n\nDO NOT incorporate any beliefs, interpretations, or doctrines from other religious denominations, philosophies, or external sources. If a concept or interpretation cannot be directly substantiated by the Bible, Ellen G. White's writings, or official SDA teachings, you MUST NOT include it. \n\nYour devotionals should be uplifting, provide spiritual insight, and be suitable for a Seventh-day Adventist audience. \n\nWhen providing Bible verses, format them as a simple array of strings, for example: [\"John 3:16\", \"Psalm 23:1\"]"
            },
            {
              role: "user",
              content: `Generate a devotional about: ${topic}. Please provide the devotional text and a list of relevant Bible verses.`
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
      // Assuming the API returns data in a structure like { choices: [{ message: { content: "..." } }] }
      // And you have a way to extract verses, perhaps by asking the AI to format them specifically.
      const content = data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Invalid response structure from OpenAI API');
      }
      // This part is highly dependent on how you instruct the AI to format the response.
      // You might need to parse the content string to separate the devotional text from the verses.
      // For example, if you ask the AI to list verses under a specific heading or format.
      
      // Basic parsing attempt:
      // This assumes the AI will provide text and then a list of verses in a parsable format.
      // You will likely need to refine this based on actual API responses.
      let parsedText = content;
      let parsedVerses: string[] = [];

      // Try to extract verses if they are in a JSON-like array string within the content
      const verseMatch = content.match(/\[\s*"([^"]*)"\s*(,\s*"([^"]*)"\s*)*\]/);
      if (verseMatch && verseMatch[0]) {
        try {
          parsedVerses = JSON.parse(verseMatch[0]);
          // Remove the verse string from the main text if successfully parsed
          parsedText = content.replace(verseMatch[0], "").trim();
        } catch (parseError) {
          console.error("Failed to parse verses from content:", parseError);
          // Fallback: Assume the whole content is text if verses can't be parsed.
          // Or, you could instruct the AI to put verses after a specific marker, e.g., "Verses:"
        }
      } else {
        // Fallback if no clear verse array is found - you might need to ask the AI
        // to explicitly label the verses section.
        // For now, we'll assume no verses if not in the expected format.
        console.warn("Could not find a clear Bible verse array in the response. The AI might need more specific formatting instructions.");
      }
      
      return { text: parsedText, verses: parsedVerses };
      // return simulatedResponse; // Return the simulated response

    } catch (e: any) {
      console.error('Error calling OpenAI API:', e);
      error.value = e.message || 'An unknown error occurred';
      // Return a default or error state devotion
      return {
        text: 'Sorry, I was unable to generate a devotion at this time. Please try again later.',
        verses: [],
      };
    } finally {
      isLoading.value = false;
    }
  };

  return {
    generateOpenAIDevotion,
    isLoading,
    error,
  };
}
