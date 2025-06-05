<template>
  <div class="bible-card-generator">
    <div class="container-fluid">
      <div class="row">
        <!-- Input Panel -->
        <div class="col-lg-5 col-md-6">
          <div class="card generator-panel">
            <div class="card-header">
              <h4 class="card-title mb-0">
                <i class="bi bi-palette me-2"></i>
                Bible Verse Card Generator
              </h4>
            </div>
            <div class="card-body">
              <!-- Verse Input Section -->
              <div class="mb-4">
                <label for="verseInput" class="form-label fw-semibold">
                  <i class="bi bi-book me-1"></i>Bible Verse Reference
                </label>
                <div class="input-group">
                  <input
                    id="verseInput"
                    v-model="verseReference"
                    type="text"
                    class="form-control"
                    placeholder="e.g., John 3:16, Psalm 23:1, Romans 8:28"
                    @input="validateVerse"
                  />
                  <button 
                    @click="suggestVerse" 
                    class="btn btn-outline-secondary"
                    :disabled="isSuggestingVerse"
                    title="Get AI verse suggestions"
                  >
                    <i v-if="isSuggestingVerse" class="bi bi-arrow-repeat spinner"></i>
                    <i v-else class="bi bi-lightbulb"></i>
                  </button>
                </div>
                <div v-if="verseValidationMessage" class="form-text" :class="verseValidationClass">
                  {{ verseValidationMessage }}
                </div>
              </div>

              <!-- Verse Suggestions -->
              <div v-if="verseSuggestions.length > 0" class="mb-4">
                <label class="form-label fw-semibold">
                  <i class="bi bi-stars me-1"></i>Suggested Verses
                </label>
                <div class="verse-suggestions">
                  <button
                    v-for="suggestion in verseSuggestions"
                    :key="suggestion.reference"
                    @click="selectSuggestion(suggestion)"
                    class="btn btn-outline-primary btn-sm me-2 mb-2 suggestion-btn"
                  >
                    {{ suggestion.reference }}
                  </button>
                </div>
              </div>

              <!-- Style Description -->
              <div class="mb-4">
                <label for="styleInput" class="form-label fw-semibold">
                  <i class="bi bi-brush me-1"></i>Background Style Description
                </label>
                <textarea
                  id="styleInput"
                  v-model="styleDescription"
                  class="form-control"
                  rows="3"
                  placeholder="Describe your ideal background: serene landscape, golden sunrise, peaceful mountains, soft pastel colors, heavenly light, etc."
                ></textarea>
                <div class="form-text">
                  Be descriptive! Examples: "peaceful mountain lake at sunrise with soft mist", "heavenly light breaking through clouds", "serene garden with blooming flowers"
                </div>
              </div>

              <!-- Style Presets -->
              <div class="mb-4">
                <label class="form-label fw-semibold">
                  <i class="bi bi-grid me-1"></i>Style Presets
                </label>
                <div class="style-presets">
                  <button
                    v-for="preset in stylePresets"
                    :key="preset.name"
                    @click="applyPreset(preset)"
                    class="btn btn-outline-info btn-sm me-2 mb-2"
                    :class="{ active: styleDescription === preset.description }"
                  >
                    {{ preset.name }}
                  </button>
                </div>
                <button @click="refineStyle" class="btn btn-link btn-sm p-0" :disabled="isRefiningStyle">
                  <i v-if="isRefiningStyle" class="bi bi-arrow-repeat spinner me-1"></i>
                  <i v-else class="bi bi-magic me-1"></i>
                  AI Style Enhancement
                </button>
              </div>

              <!-- Custom Background Upload -->
              <div class="mb-4">
                <label class="form-label fw-semibold">
                  <i class="bi bi-image me-1"></i>Custom Background (Optional)
                </label>
                <input
                  type="file"
                  class="form-control"
                  accept="image/*"
                  @change="handleCustomBackground"
                  ref="fileInput"
                />
                <div class="form-text">
                  Upload your own background image instead of AI generation
                </div>
                <div v-if="customBackground" class="mt-2">
                  <img :src="customBackground" alt="Custom background preview" class="custom-bg-preview" />
                  <button @click="removeCustomBackground" class="btn btn-sm btn-outline-danger ms-2">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>

              <!-- Aspect Ratio Selection -->
              <div class="mb-4">
                <label class="form-label fw-semibold">
                  <i class="bi bi-aspect-ratio me-1"></i>Card Aspect Ratio
                </label>
                <div class="aspect-ratio-buttons">
                  <button
                    v-for="ratio in aspectRatios"
                    :key="ratio.name"
                    @click="selectedAspectRatio = ratio"
                    class="btn btn-outline-secondary btn-sm me-2 mb-2"
                    :class="{ active: selectedAspectRatio.name === ratio.name }"
                  >
                    {{ ratio.name }}
                    <small class="d-block">{{ ratio.dimensions }}</small>
                  </button>
                </div>
              </div>

              <!-- Generation Button -->
              <div class="d-grid">
                <button
                  @click="generateCard"
                  class="btn btn-gradient-primary btn-lg"
                  :disabled="!canGenerate || isGenerating"
                >
                  <i v-if="isGenerating" class="bi bi-arrow-repeat spinner me-2"></i>
                  <i v-else class="bi bi-magic me-2"></i>
                  {{ isGenerating ? 'Generating...' : 'Generate Bible Card' }}
                </button>
              </div>

              <!-- Error Display -->
              <div v-if="error" class="alert alert-danger mt-3" role="alert">
                <i class="bi bi-exclamation-triangle me-2"></i>
                {{ error }}
              </div>
            </div>
          </div>
        </div>

        <!-- Preview Panel -->
        <div class="col-lg-7 col-md-6">
          <div class="card preview-panel">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">
                <i class="bi bi-eye me-2"></i>Preview
              </h5>
              <div v-if="generatedCard" class="card-actions">
                <button @click="downloadCard" class="btn btn-default btn-sm me-2">
                  <i class="bi bi-download me-1"></i>Download
                </button>
                <button @click="shareCard" class="btn btn-outline-secondary btn-sm me-2">
                  <i class="bi bi-share me-1"></i>Share
                </button>
                <button @click="regenerateCard" class="btn btn-outline-info btn-sm">
                  <i class="bi bi-arrow-clockwise me-1"></i>Regenerate
                </button>
              </div>
            </div>
            <div class="card-body">              <!-- Loading State -->
              <div v-if="isGenerating" class="text-center py-5">
                <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;" role="status">
                  <span class="visually-hidden">Generating...</span>
                </div>
                <h6>Creating Your Bible Card with AI</h6>
                <div class="generation-status mb-3">
                  <div v-if="generationProgress <= 20" class="text-muted">
                    <i class="bi bi-search me-1"></i>Validating verse reference...
                  </div>
                  <div v-else-if="generationProgress <= 40" class="text-muted">
                    <i class="bi bi-book me-1"></i>Fetching verse text...
                  </div>
                  <div v-else-if="generationProgress <= 60" class="text-muted">
                    <i class="bi bi-magic me-1"></i>Generating AI image prompt...
                  </div>                  <div v-else-if="generationProgress <= 70" class="text-muted">
                    <i class="bi bi-image me-1"></i>Generating real AI image with Gemini...
                  </div>
                  <div v-else-if="generationProgress <= 90" class="text-muted">
                    <i class="bi bi-image me-1"></i>Finalizing card design...
                  </div>
                  <div v-else class="text-success">
                    <i class="bi bi-check-circle me-1"></i>Card ready!
                  </div>
                </div>
                <div class="progress">
                  <div class="progress-bar progress-bar-striped progress-bar-animated" 
                       :style="{ width: generationProgress + '%' }"></div>
                </div>                <small class="text-muted mt-2 d-block">
                  Using Gemini AI Imagen to generate real spiritual images
                </small>
              </div>              <!-- Generated Card Display -->
              <div v-else-if="generatedCard" class="generated-card-container">
                <div 
                  class="bible-card-preview" 
                  :style="{ 
                    aspectRatio: selectedAspectRatio.ratio,
                    backgroundImage: generatedCard.backgroundImage,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }"
                >
                  <div class="card-overlay">
                    <div class="card-content">
                      <blockquote class="verse-text">
                        "{{ generatedCard.verseText }}"
                      </blockquote>
                      <cite class="verse-reference">
                        {{ generatedCard.verseReference }}
                      </cite>
                    </div>
                  </div>
                </div>
                
                <!-- AI Generation Info -->
                <div v-if="!customBackground && lastGeneratedImagePrompt" class="mt-3">
                  <div class="ai-prompt-info">
                    <button 
                      class="btn btn-link btn-sm p-0 text-muted"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#aiPromptCollapse"
                      aria-expanded="false"
                      aria-controls="aiPromptCollapse"
                    >
                      <i class="bi bi-robot me-1"></i>
                      View AI-Generated Image Description
                      <i class="bi bi-chevron-down ms-1"></i>
                    </button>
                    <div class="collapse mt-2" id="aiPromptCollapse">
                      <div class="card card-body bg-light">
                        <small class="text-muted mb-1">
                          <i class="bi bi-magic me-1"></i>Gemini AI created this image description:
                        </small>
                        <p class="mb-0 small fst-italic">{{ lastGeneratedImagePrompt }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Placeholder State -->
              <div v-else class="placeholder-state text-center py-5">
                <i class="bi bi-image display-1 text-muted mb-3"></i>
                <h5 class="text-muted">Your Bible Card Will Appear Here</h5>
                <p class="text-muted">Enter a verse reference and style description to get started</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface BibleCardData {
  verseText: string;
  verseReference: string;
  backgroundImage: string;
}

interface VerseSuggestion {
  reference: string;
  theme: string;
}

interface StylePreset {
  name: string;
  description: string;
}

interface AspectRatio {
  name: string;
  ratio: string;
  dimensions: string;
  width: number;
  height: number;
}

const verseReference = ref('');
const styleDescription = ref('');
const customBackground = ref<string | null>(null);
const isGenerating = ref(false);
const isSuggestingVerse = ref(false);
const isRefiningStyle = ref(false);
const error = ref<string | null>(null);
const generatedCard = ref<BibleCardData | null>(null);
const verseSuggestions = ref<VerseSuggestion[]>([]);
const verseValidationMessage = ref('');
const generationProgress = ref(0);
const fileInput = ref<HTMLInputElement | null>(null);
const lastGeneratedImagePrompt = ref<string | null>(null);

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Book name mapping for API compatibility
const bookNameMap: Record<string, string> = {
  'psalm': 'psalms',
  'songofsolomon': 'songofsolomon',
  'songofsongsofsolomon': 'songofsolomon'
};

const stylePresets: StylePreset[] = [
  { name: 'Serene Dawn', description: 'peaceful sunrise over calm waters with soft golden light and gentle mist' },
  { name: 'Mountain Peace', description: 'majestic mountains with flowing streams and soft morning light' },
  { name: 'Heavenly Light', description: 'divine rays of light breaking through clouds with ethereal glow' },
  { name: 'Garden Paradise', description: 'beautiful garden with blooming flowers and gentle sunlight' },
  { name: 'Ocean Tranquility', description: 'calm ocean waves with peaceful sunset and soft colors' },
  { name: 'Forest Sanctuary', description: 'peaceful forest path with dappled sunlight through trees' },
  { name: 'Desert Oasis', description: 'serene desert landscape with palm trees and clear water' },
  { name: 'Starry Night', description: 'peaceful night sky with gentle stars and soft moonlight' }
];

const aspectRatios: AspectRatio[] = [
  { name: 'Landscape', ratio: '16/9', dimensions: '16:9', width: 1600, height: 900 },
  { name: 'Square', ratio: '1/1', dimensions: '1:1', width: 1080, height: 1080 },
  { name: 'Portrait', ratio: '9/16', dimensions: '9:16', width: 1080, height: 1920 },
  { name: 'Classic', ratio: '4/3', dimensions: '4:3', width: 1200, height: 900 },
  { name: 'Wide', ratio: '21/9', dimensions: '21:9', width: 2560, height: 1097 }
];

const selectedAspectRatio = ref<AspectRatio>(aspectRatios[0]);

const canGenerate = computed(() => {
  return verseReference.value.trim() && (styleDescription.value.trim() || customBackground.value);
});

const verseValidationClass = computed(() => {
  if (!verseValidationMessage.value) return '';
  return verseValidationMessage.value.includes('Valid') ? 'text-success' : 'text-warning';
});

// Book name mapping helper
const mapBookName = (book: string): string => {
  const normalizedBook = book.toLowerCase().replace(/\s+/g, '');
  return bookNameMap[normalizedBook] || normalizedBook;
};

// Validate verse reference
const validateVerse = () => {
  const verse = verseReference.value.trim();
  if (!verse) {
    verseValidationMessage.value = '';
    return;
  }
  
  const match = verse.match(/^(\d*\s*[a-zA-Z\s]+)\s*(\d+):(\d+)(?:-(\d+))?$/);
  if (match) {
    verseValidationMessage.value = 'Valid verse reference format';
  } else {
    verseValidationMessage.value = 'Please use format: Book Chapter:Verse (e.g., John 3:16)';
  }
};

// Fetch verse text with book name mapping
const fetchVerseText = async (verseRef: string): Promise<string> => {
  try {
    const match = verseRef.match(/^(\d*\s*[a-zA-Z\s]+)\s*(\d+):(\d+)(?:-(\d+))?$/);
    if (!match) return '';
    
    const bookName = match[1].trim();
    const mappedBook = mapBookName(bookName);
    const chapter = match[2];
    const verse = match[3];
    
    const apiUrl = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/en-kjv/books/${mappedBook}/chapters/${chapter}/verses/${verse}.json`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) return '';
    
    const data = await response.json();
    return data.text ? data.text.trim() : '';
  } catch {
    return '';
  }
};

// Suggest verses using Gemini
const suggestVerse = async () => {
  if (!GEMINI_API_KEY) {
    error.value = 'Gemini API key not configured';
    return;
  }

  isSuggestingVerse.value = true;
  error.value = null;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Suggest 6 popular and meaningful Bible verses with their themes. Format your response as JSON array with objects containing "reference" and "theme" fields. For example: [{"reference": "John 3:16", "theme": "God's Love"}, {"reference": "Psalm 23:1", "theme": "Trust and Guidance"}]. Include verses about hope, love, strength, peace, faith, and comfort.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
        }
      }),
    });

    if (!response.ok) throw new Error('Failed to get verse suggestions');

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (content) {
      try {
        const suggestions = JSON.parse(content);
        if (Array.isArray(suggestions)) {
          verseSuggestions.value = suggestions;
        }
      } catch {
        // Fallback suggestions
        verseSuggestions.value = [
          { reference: 'John 3:16', theme: 'God\'s Love' },
          { reference: 'Psalm 23:1', theme: 'Trust' },
          { reference: 'Romans 8:28', theme: 'God\'s Plan' },
          { reference: 'Philippians 4:13', theme: 'Strength' },
          { reference: 'Jeremiah 29:11', theme: 'Hope' },
          { reference: 'Matthew 11:28', theme: 'Rest' }
        ];
      }
    }
  } catch (err) {
    console.error('Error getting verse suggestions:', err);
    error.value = 'Failed to get verse suggestions';
  } finally {
    isSuggestingVerse.value = false;
  }
};

// Select a suggested verse
const selectSuggestion = (suggestion: VerseSuggestion) => {
  verseReference.value = suggestion.reference;
  validateVerse();
  verseSuggestions.value = [];
};

// Apply style preset
const applyPreset = (preset: StylePreset) => {
  styleDescription.value = preset.description;
};

// Refine style description with AI
const refineStyle = async () => {
  if (!GEMINI_API_KEY || !styleDescription.value.trim()) return;

  isRefiningStyle.value = true;
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Enhance this background description for a Bible verse card to be more detailed and visually descriptive: "${styleDescription.value}". Make it cinematic and spiritually inspiring while keeping it concise (max 100 words). Focus on lighting, colors, atmosphere, and peaceful spiritual elements.`
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
        }
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const enhanced = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (enhanced) {
        styleDescription.value = enhanced.trim();
      }
    }
  } catch (err) {
    console.error('Error refining style:', err);
  } finally {
    isRefiningStyle.value = false;
  }
};

// Handle custom background upload
const handleCustomBackground = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      customBackground.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

// Remove custom background
const removeCustomBackground = () => {
  customBackground.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// Generate detailed image prompt using Gemini AI
const generateImagePrompt = async (verseText: string, verseRef: string, styleDescription: string): Promise<string> => {
  try {
    const prompt = `Based on this Bible verse: "${verseText}" (${verseRef}) and style description: "${styleDescription}", create a detailed, beautiful image description that would be perfect for a spiritual Bible verse card background. The image should be photorealistic, peaceful, and spiritually inspiring. Include specific details about lighting, colors, composition, and mood. Focus on natural scenes that reflect the verse's meaning and create a serene atmosphere suitable for prayer and reflection.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt, // Text description for the image
        generationConfig: {
          numberOfImages: 4, // Generate up to 4 images
          aspectRatio: "16:9", // Adjust the image ratio
          safetyFilterLevel: "medium", // Content filtering level
          personGeneration: "allow" // Enable realistic human generation
        }
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const imagePrompt = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (imagePrompt) {
        return imagePrompt.trim();
      }
    }
    
    // Fallback to default prompt if API fails
    return `Beautiful ${styleDescription} scene with peaceful lighting, spiritual atmosphere, perfect for Bible verse card background`;
  } catch (err) {
    console.error('Error generating image prompt:', err);
    return `Beautiful ${styleDescription} scene with peaceful lighting, spiritual atmosphere, perfect for Bible verse card background`;
  }
};

// Generate background image using AI (Real Gemini Imagen API implementation)
const generateBackgroundImage = async (prompt: string): Promise<string> => {
  try {
    // --- Call Gemini API for Image Generation (Imagen 3) ---
    // IMPORTANT: Replace with your actual API key and endpoint setup
    // This is a conceptual representation. You'll need to handle API key security.
    const apiKey = GEMINI_API_KEY; // In a real app, DO NOT embed API key here. Use a backend proxy or secure environment variable.
                           // Canvas will inject the key if it's empty.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

    const payload = {
        instances: [{ "prompt": prompt }],
        parameters: { "sampleCount": 1 }
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json();

    if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
        const imageUrl = `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
        console.log('Successfully generated image with Gemini Imagen API');
        return `url(${imageUrl})`;
    } else {
        console.error('Unexpected API response structure:', result);
        throw new Error('Failed to get image from API response. No predictions found or missing image data.');
    }

  } catch (error) {
    console.error('Error generating image:', error);
    // Fallback to gradient background on error
    console.log('Falling back to gradient background due to API error');
    return createStyledBackground(prompt);
  }
};

// Create sophisticated gradient background based on AI prompt analysis
const createStyledBackground = (description: string): string => {
  const desc = description.toLowerCase();
  
  // Enhanced gradient selection based on AI-generated descriptions
  if (desc.includes('sunrise') || desc.includes('dawn') || desc.includes('golden') || desc.includes('warm light')) {
    return 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 30%, #ffd89b 60%, #f093fb 100%)';
  } else if (desc.includes('mountain') || desc.includes('peaks') || desc.includes('majestic') || desc.includes('rocky')) {
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 40%, #a8edea 70%, #d3cce3 100%)';
  } else if (desc.includes('ocean') || desc.includes('water') || desc.includes('sea') || desc.includes('blue') || desc.includes('tranquil')) {
    return 'linear-gradient(135deg, #74b9ff 0%, #0984e3 30%, #00cec9 60%, #55a3ff 100%)';
  } else if (desc.includes('garden') || desc.includes('flower') || desc.includes('green') || desc.includes('paradise') || desc.includes('meadow')) {
    return 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 40%, #c3f0ca 60%, #ffd3a5 100%)';
  } else if (desc.includes('heavenly') || desc.includes('divine') || desc.includes('light') || desc.includes('ethereal') || desc.includes('spiritual')) {
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 20%, #f093fb 40%, #f5576c 60%, #4facfe 80%, #00f2fe 100%)';
  } else if (desc.includes('forest') || desc.includes('sanctuary') || desc.includes('peaceful') || desc.includes('trees')) {
    return 'linear-gradient(135deg, #134e5e 0%, #71b280 40%, #a8e6cf 70%, #c3f0ca 100%)';
  } else if (desc.includes('desert') || desc.includes('oasis') || desc.includes('warm') || desc.includes('sand')) {
    return 'linear-gradient(135deg, #f093fb 0%, #f5576c 30%, #ffd89b 60%, #ff8a80 100%)';
  } else if (desc.includes('night') || desc.includes('star') || desc.includes('moon') || desc.includes('dark')) {
    return 'linear-gradient(135deg, #2c3e50 0%, #3498db 30%, #9b59b6 60%, #667eea 100%)';
  } else if (desc.includes('cloud') || desc.includes('sky') || desc.includes('heavens')) {
    return 'linear-gradient(135deg, #74b9ff 0%, #667eea 40%, #764ba2 70%, #f093fb 100%)';
  } else if (desc.includes('fire') || desc.includes('flame') || desc.includes('burning')) {
    return 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 30%, #ffcc02 60%, #ff8a65 100%)';
  } else {
    // Default divine gradient with more colors
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 60%, #4facfe 100%)';
  }
};

// Generate the Bible card
const generateCard = async () => {
  if (!canGenerate.value) return;

  isGenerating.value = true;
  error.value = null;
  generationProgress.value = 0;

  try {
    // Progress: Validating input
    generationProgress.value = 20;
    
    // Get verse text
    const verseText = await fetchVerseText(verseReference.value);
    if (!verseText) {
      throw new Error('Unable to fetch verse text. Please check the verse reference.');
    }
    
    generationProgress.value = 40;
      // Generate or use background
    let backgroundImage: string;
    if (customBackground.value) {
      backgroundImage = `url(${customBackground.value})`;
      lastGeneratedImagePrompt.value = null; // Clear prompt for custom backgrounds
    } else {
      // Generate AI-powered image prompt and background
      generationProgress.value = 60;
      const imagePrompt = await generateImagePrompt(verseText, verseReference.value, styleDescription.value);
      lastGeneratedImagePrompt.value = imagePrompt; // Store the generated prompt
      generationProgress.value = 70;
      backgroundImage = await generateBackgroundImage(imagePrompt);
    }
    
    generationProgress.value = 90;
    
    // Create card data
    const cardData: BibleCardData = {
      verseText,
      verseReference: verseReference.value,
      backgroundImage
    };
    
    generationProgress.value = 100;
    
    generatedCard.value = cardData;
    
  } catch (err) {
    console.error('Error generating card:', err);
    error.value = err instanceof Error ? err.message : 'Failed to generate card';
  } finally {
    isGenerating.value = false;
    generationProgress.value = 0;
  }
};

// Regenerate the current card
const regenerateCard = () => {
  if (generatedCard.value) {
    generateCard();
  }
};

// Download card as image
const downloadCard = async () => {
  if (!generatedCard.value) return;
  
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set dimensions based on selected aspect ratio
    canvas.width = selectedAspectRatio.value.width;
    canvas.height = selectedAspectRatio.value.height;
      // Create background
    if (customBackground.value) {
      // Draw custom background image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawTextOnCanvas(ctx, canvas);
        downloadCanvasAsImage(canvas);
      };
      img.src = customBackground.value;
    } else {
      // Check if we have an AI-generated image or gradient
      const bgImage = generatedCard.value.backgroundImage;
      
      if (bgImage.startsWith('url(data:image/')) {
        // Extract the data URL from the CSS url() format
        const dataUrl = bgImage.match(/url\((.*?)\)/)?.[1];
        if (dataUrl) {
          // Draw AI-generated background image
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            // Draw image to fill canvas while maintaining aspect ratio
            const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
            const x = (canvas.width - img.width * scale) / 2;
            const y = (canvas.height - img.height * scale) / 2;
            
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            drawTextOnCanvas(ctx, canvas);
            downloadCanvasAsImage(canvas);
          };
          img.onerror = () => {
            // Fallback to gradient if image fails to load
            console.warn('Failed to load AI image for download, using gradient fallback');
            drawGradientBackground(ctx, canvas, bgImage);
            drawTextOnCanvas(ctx, canvas);
            downloadCanvasAsImage(canvas);
          };
          img.src = dataUrl;
        } else {
          // Fallback to gradient
          drawGradientBackground(ctx, canvas, bgImage);
          drawTextOnCanvas(ctx, canvas);
          downloadCanvasAsImage(canvas);
        }
      } else {
        // Draw gradient background (legacy)
        drawGradientBackground(ctx, canvas, bgImage);
        drawTextOnCanvas(ctx, canvas);
        downloadCanvasAsImage(canvas);
      }
    }
    
  } catch (err) {
    console.error('Error downloading card:', err);
    error.value = 'Failed to download card';
  }
};

// Helper function to draw gradient background
const drawGradientBackground = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, bgImage: string) => {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  
  // Parse gradient colors from CSS gradient
  if (bgImage.includes('#667eea')) {
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(0.5, '#764ba2');
    gradient.addColorStop(1, '#f093fb');
  } else if (bgImage.includes('#74b9ff')) {
    gradient.addColorStop(0, '#74b9ff');
    gradient.addColorStop(1, '#0984e3');
  } else if (bgImage.includes('#ff9a9e')) {
    gradient.addColorStop(0, '#ff9a9e');
    gradient.addColorStop(0.3, '#fad0c4');
    gradient.addColorStop(0.6, '#ffd89b');
    gradient.addColorStop(1, '#f093fb');
  } else {
    // Default gradient
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
  }
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

// Helper function to draw text on canvas
const drawTextOnCanvas = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
  if (!generatedCard.value) return;
  
  // Add overlay
  const overlayGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  overlayGradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
  overlayGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
  overlayGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
  ctx.fillStyle = overlayGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Text settings
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  // Calculate font sizes based on canvas size
  const baseFontSize = Math.min(canvas.width, canvas.height) / 20;
  const verseFontSize = baseFontSize;
  const refFontSize = baseFontSize * 0.7;
  
  // Draw verse text
  ctx.font = `italic ${verseFontSize}px Georgia, serif`;
  
  const verseText = `"${generatedCard.value.verseText}"`;
  const words = verseText.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  const maxWidth = canvas.width * 0.8;
  
  for (const word of words) {
    const testLine = currentLine + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine !== '') {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine.trim());
  
  // Center the text vertically
  const lineHeight = verseFontSize * 1.4;
  const totalTextHeight = lines.length * lineHeight + refFontSize + 40;
  const startY = (canvas.height - totalTextHeight) / 2;
  
  // Draw verse lines
  lines.forEach((line, index) => {
    ctx.fillText(line, canvas.width / 2, startY + (index * lineHeight));
  });
  
  // Draw reference
  ctx.font = `bold ${refFontSize}px Arial, sans-serif`;
  ctx.fillText(
    generatedCard.value.verseReference, 
    canvas.width / 2, 
    startY + (lines.length * lineHeight) + 60
  );
};

// Helper function to download canvas as image
const downloadCanvasAsImage = (canvas: HTMLCanvasElement) => {
  if (!generatedCard.value) return;
  
  const link = document.createElement('a');
  link.download = `bible-verse-${generatedCard.value.verseReference.replace(/[^a-zA-Z0-9]/g, '-')}-${selectedAspectRatio.value.name.toLowerCase()}.png`;
  link.href = canvas.toDataURL('image/png', 0.95);
  link.click();
};

// Share card
const shareCard = async () => {
  if (!generatedCard.value) return;
  
  const shareData = {
    title: `Bible Verse: ${generatedCard.value.verseReference}`,
    text: `"${generatedCard.value.verseText}" - ${generatedCard.value.verseReference}`,
  };
  
  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(`${shareData.text}`);
      // Could show a toast notification here
    }
  } catch (err) {
    console.error('Error sharing card:', err);
  }
};

// Initialize with validation
watch(verseReference, validateVerse);
</script>

<style scoped>
.bible-card-generator {
  padding: 2rem 0;
}

.generator-panel,
.preview-panel {
  height: fit-content;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 15px;
}

.card-header {
  background: linear-gradient(135deg, var(--bs-primary), var(--bs-secondary));
  color: white;
  border-radius: 15px 15px 0 0 !important;
}

.btn-gradient-primary {
  background: linear-gradient(135deg, var(--bs-primary), var(--bs-secondary));
  border: none;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-gradient-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  color: white;
}

.btn-gradient-primary:disabled {
  opacity: 0.6;
  transform: none;
}

.verse-suggestions,
.style-presets,
.aspect-ratio-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.suggestion-btn,
.style-presets .btn,
.aspect-ratio-buttons .btn {
  transition: all 0.3s ease;
}

.suggestion-btn:hover,
.style-presets .btn:hover,
.aspect-ratio-buttons .btn:hover {
  transform: translateY(-2px);
}

.style-presets .btn.active,
.aspect-ratio-buttons .btn.active {
  background: var(--bs-primary);
  color: white;
  border-color: var(--bs-primary);
}

.custom-bg-preview {
  width: 100px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid var(--bs-border-color);
}

.bible-card-preview {
  width: 100%;
  min-height: 300px;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(0, 0, 0, 0.3) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.card-content {
  text-align: center;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.verse-text {
  font-size: 1.5rem;
  font-style: italic;
  font-weight: 300;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-family: 'Georgia', serif;
}

.verse-reference {
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Arial', sans-serif;
}

.placeholder-state {
  padding: 4rem 2rem;
}

.progress {
  height: 8px;
  border-radius: 4px;
}

.generation-status {
  font-size: 0.95rem;
  font-weight: 500;
}

.generation-status i {
  width: 16px;
  text-align: center;
}

.ai-prompt-info {
  border-top: 1px solid var(--bs-border-color);
  padding-top: 1rem;
}

.ai-prompt-info .btn-link {
  text-decoration: none;
  font-size: 0.85rem;
}

.ai-prompt-info .btn-link:hover {
  text-decoration: underline;
}

.ai-prompt-info .card {
  border: 1px solid var(--bs-border-color);
  border-radius: 8px;
  background: rgba(248, 249, 250, 0.8);
}

.ai-prompt-info .card-body {
  padding: 1rem;
}

@media (max-width: 768px) {
  .verse-text {
    font-size: 1.2rem;
  }
  
  .verse-reference {
    font-size: 1rem;
  }
  
  .bible-card-preview {
    min-height: 250px;
  }
  
  .card-overlay {
    padding: 1.5rem;
  }
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.card-actions .btn {
  transition: all 0.3s ease;
}

.card-actions .btn:hover {
  transform: translateY(-2px);
}

/* Responsive design */
@media (max-width: 768px) {
  .bible-card-generator {
    padding: 1rem 0;
  }
  
  .verse-text {
    font-size: 1.2rem;
  }
  
  .verse-reference {
    font-size: 1rem;
  }
  
  .card-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .card-actions .btn {
    width: 100%;
  }
}

/* Dark mode adjustments */
[data-bs-theme="dark"] .generator-panel,
[data-bs-theme="dark"] .preview-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

[data-bs-theme="dark"] .bible-card-preview {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}
</style>
