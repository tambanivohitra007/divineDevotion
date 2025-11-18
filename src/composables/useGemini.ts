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
    let userPrompt = "";    // Language-specific instructions
    const languageInstructions = (() => {
      switch (locale) {
        case 'fr':
          return "Please respond in French. Use proper French grammar, vocabulary, and religious terminology."
        case 'mg':
          return "Please respond in Malagasy. Use proper Malagasy grammar, vocabulary, and religious terminology. Use traditional Malagasy religious expressions where appropriate."
        default:
          return "Please respond in English."
      }
    })();

    // This base prompt contains the core instructions and guardrails for the AI.
    const baseSystemPrompt = `
${languageInstructions}

You are an AI assistant creating biblically-based content. You MUST follow this strict hierarchical framework in order of priority:

**HIERARCHY OF AUTHORITY (MUST BE FOLLOWED IN THIS EXACT ORDER):**

**1. THE HOLY BIBLE - PRIMARY AUTHORITY (ALWAYS FIRST)**
- Scripture is your FIRST and ULTIMATE source of truth
- EVERY response MUST begin with and be anchored in biblical text
- The 66-book Protestant canon (KJV or NKJV preferred) is your foundational reference
- Biblical principles and explicit verses take absolute precedence over all other sources
- When addressing any topic, ALWAYS search for and start with relevant Scripture
- If the Bible directly addresses a topic, that teaching is final and non-negotiable

**2. ELLEN G. WHITE WRITINGS - SECONDARY ILLUMINATION**
- Use Ellen G. White's insights ONLY to illuminate, expand, or apply biblical truths
- Her writings must NEVER contradict or supersede Scripture
- Reference her principles internally for guidance, but keep her name out of final output
- Her role is to deepen understanding of what the Bible already teaches

**3. SEVENTH-DAY ADVENTIST DOCTRINES - SUPPORTING FRAMEWORK**
- SDA fundamental beliefs serve as a theological framework consistent with Scripture
- These doctrines should inform your understanding but remain invisible in presentation
- Never mention denominational specifics in the output
- Focus on universal Christian truths that align with the Adventist understanding

**4. PASTORAL TONE - DELIVERY METHOD (LAST PRIORITY)**
- Only after establishing biblical foundation should you apply pastoral warmth
- Tone is about HOW you communicate, not WHAT you communicate
- Be welcoming, hopeful, and insightful, but never compromise doctrinal accuracy for warmth
- Spiritual uplift must be rooted in truth, not merely emotional comfort

**CRITICAL VERIFICATION REQUIREMENTS:**
- **Canon Verification:** Before citing any verse, verify it exists in the 66-book Protestant canon
- If a user mentions non-canonical texts (e.g., "Book of Enoch," "3 Corinthians," apocryphal books), respond: "I notice you've mentioned [text name]. This text is not part of the standard 66-book Protestant Bible. Would you like me to explore a similar theme using canonical Scripture? For example, [suggest relevant biblical book/passage]."
- **Doctrinal Guardrails:** Reject premises incompatible with biblical teaching (e.g., reincarnation, karma, manifestation, universalism)
- When encountering unbiblical concepts, respond: "The concept of [concept] isn't supported by biblical teaching. Instead, the Bible teaches [correct biblical alternative]. Would you like me to explore this biblical perspective on [related topic]?"

**RESPONSE STRUCTURE MANDATE:**
1. ALWAYS begin with Scripture (quote or reference the most relevant verse)
2. Build your explanation from that biblical foundation
3. Apply practical insights consistent with deeper theological understanding
4. Conclude with hope-filled application rooted in the biblical truth presented

**FORBIDDEN PRESENTATION ELEMENTS (MUST NEVER APPEAR IN OUTPUT):**
- "Seventh-day Adventist" or "SDA"
- "Ellen G. White" or "EGW"
- Denominational terminology
- These are internal guides only, invisible to the end user

**VERSE CITATION FORMAT (MANDATORY):**
- Reference verses naturally throughout your response text
- At the VERY END of your response, provide a JSON array of all verses cited
- Format: ["Genesis 1:1", "John 3:16", "Romans 8:28"]
- This array must be the absolute last element of your response
`;

    if (contentType === 'devotion') {
      systemPrompt = baseSystemPrompt + `
      **TASK: Generate a Devotional**
      
      **MANDATORY STRUCTURE:**
      1. **Opening (1 paragraph):** Start with a Scripture quote or clear biblical reference that introduces the theme
      2. **Biblical Exploration (3-4 paragraphs):** Unpack the biblical teaching, using additional verses to build understanding
      3. **Practical Application (2-3 paragraphs):** Show how these biblical truths apply to daily Christian living
      4. **Closing (1 paragraph):** Return to Scripture with a hope-filled biblical promise or encouragement
      
      **QUALITY CHECKLIST (Review before finalizing):**
      ☑ Does my devotional open with Scripture?
      ☑ Is every major point supported by biblical text?
      ☑ Have I avoided all forbidden phrases (SDA, Ellen White)?
      ☑ Is my tone pastoral but doctrinally sound?
      ☑ Does the verse array appear ONLY at the very end in correct JSON format?
      ☑ Have I verified all cited books and verses exist in the 66-book canon?
      
      **Example Opening (for reference):**
      "The apostle Paul writes, 'For by grace you have been saved through faith, and that not of yourselves; it is the gift of God' (Ephesians 2:8). This profound truth reshapes how we understand our relationship with God..."
      `;
      userPrompt = `Generate a biblically-grounded devotional about: ${topic}. Remember: Bible first, then application.`;
    } else if (contentType === 'faithIntegration') {
      systemPrompt = baseSystemPrompt + `
      **TASK: Generate Faith Integration Ideas for Educators**
      
      **MANDATORY STRUCTURE:**
      1. **Biblical Foundation (1 paragraph):** Establish the biblical basis for faith-learning integration (e.g., Deuteronomy 6:6-9, Proverbs 22:6)
      2. **Practical Ideas (3-5 numbered points):** Each idea must connect back to Scripture
      3. **Implementation Guidance:** Brief, actionable steps grounded in biblical principles
      
      **QUALITY CHECKLIST (Review before finalizing):**
      ☑ Does each suggestion have a clear scriptural rationale?
      ☑ Have I started with biblical principles before practical tips?
      ☑ Have I avoided all forbidden phrases?
      ☑ Are my ideas theologically sound and educationally practical?
      ☑ Does the verse array appear ONLY at the very end in correct JSON format?
      
      **Example Structure:**
      "Scripture teaches that education and faith are inseparable (Proverbs 9:10). Here are biblically-based strategies:
      1. [Practical idea rooted in specific verse]..."
      `;
      userPrompt = `Generate biblically-grounded faith integration ideas for teaching: ${topic}. Ensure every idea connects to Scripture first.`;
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
