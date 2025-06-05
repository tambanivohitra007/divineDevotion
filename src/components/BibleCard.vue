<!-- 
  BibleCard Component
  
  This component provides an interactive way to generate beautiful Bible verse cards
  with AI-generated backgrounds. Features include:
  
  - Click "Generate Card" to create a visually stunning verse card
  - Uses Gemini AI to generate contextual background prompts
  - Creates beautiful gradient backgrounds based on verse content
  - Supports download as PNG image
  - Shareable via native sharing or clipboard
  - Responsive design for mobile and desktop
  - Integrates seamlessly with DevotionDisplay
  
  Props:
  - verse: Bible verse reference (e.g., "John 3:16")
  - verseText: Optional pre-fetched verse text
  
  Events:
  - cardGenerated: Emitted when card is successfully created
  - cardShared: Emitted when card is shared (success/failure)
-->
<template>
  <div class="bible-card-container">
    <!-- Generate Card Button -->
    <button 
      v-if="!isGenerating && !generatedCard"
      @click="generateBibleCard" 
      class="btn btn-gradient-primary btn-sm generate-card-btn"
      :disabled="!verse"
      title="Generate beautiful Bible verse card"
    >
      <i class="bi bi-image me-2"></i>Generate Card
    </button>

    <!-- Loading State -->
    <div v-if="isGenerating" class="card-generation-loading">
      <div class="text-center py-4">
        <div class="spinner-border text-primary mb-3" style="width: 2rem; height: 2rem;" role="status">
          <span class="visually-hidden">Generating card...</span>
        </div>
        <p class="mb-0">Creating your beautiful Bible verse card...</p>
        <small class="text-muted">This may take a few moments</small>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="alert alert-warning" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      {{ error }}
      <button @click="generateBibleCard" class="btn btn-sm btn-outline-primary ms-2">
        Try Again
      </button>
    </div>

    <!-- Generated Bible Card -->
    <div v-if="generatedCard && !isGenerating" class="bible-card-display">
      <div class="bible-card" :style="{ backgroundImage: generatedCard.backgroundImage }">
        <div class="bible-card-overlay">
          <div class="bible-card-content">
            <blockquote class="bible-verse-text">
              "{{ generatedCard.verseText }}"
            </blockquote>
            <cite class="bible-verse-reference">
              {{ generatedCard.verseReference }}
            </cite>
          </div>
        </div>
      </div>
      
      <!-- Card Actions -->
      <div class="card-actions mt-3">
        <button @click="downloadCard" class="btn btn-outline-primary btn-sm me-2">
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface BibleCardData {
  verseText: string;
  verseReference: string;
  backgroundImage: string;
}

const props = defineProps<{
  verse: string;
  verseText?: string;
}>();

const emit = defineEmits<{
  cardGenerated: [card: BibleCardData];
  cardShared: [success: boolean];
}>();

const isGenerating = ref(false);
const error = ref<string | null>(null);
const generatedCard = ref<BibleCardData | null>(null);

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Enhanced prompts for generating beautiful, spiritual background images
const generateImagePrompt = (verseText: string, _verseRef: string) => {
  // Create contextual prompts based on verse content
  const verseContent = verseText.toLowerCase();
  
  let baseStyle = "photorealistic, cinematic lighting, golden hour, serene, peaceful, spiritual atmosphere";
  let sceneDescription = "";
  
  // Determine scene based on verse content
  if (verseContent.includes('peace') || verseContent.includes('rest')) {
    sceneDescription = "tranquil mountain lake at sunrise with soft mist, peaceful meadow with gentle breeze";
  } else if (verseContent.includes('light') || verseContent.includes('lamp')) {
    sceneDescription = "warm golden sunbeams breaking through clouds, lighthouse on a cliff at dawn";
  } else if (verseContent.includes('shepherd') || verseContent.includes('sheep')) {
    sceneDescription = "rolling green hills with sheep grazing, pastoral landscape at golden hour";
  } else if (verseContent.includes('water') || verseContent.includes('river')) {
    sceneDescription = "crystal clear stream flowing through a forest, calm lake reflecting sky";
  } else if (verseContent.includes('mountain') || verseContent.includes('strength')) {
    sceneDescription = "majestic mountain peaks with clouds, powerful waterfall in nature";
  } else if (verseContent.includes('love') || verseContent.includes('heart')) {
    sceneDescription = "beautiful garden with blooming flowers, peaceful sunset over fields";
  } else if (verseContent.includes('hope') || verseContent.includes('faith')) {
    sceneDescription = "sunrise breaking over horizon, rainbow after storm, new dawn";
  } else {
    sceneDescription = "serene natural landscape, peaceful countryside, gentle rolling hills";
  }
  
  return `Create a beautiful, inspirational background image for a Bible verse card. The image should feature: ${sceneDescription}. Style: ${baseStyle}, soft gradients, divine ambiance, no text or people, high quality, perfect for overlaying text, subtle depth of field, harmonious colors that evoke spirituality and peace. The composition should leave space for text overlay in the center.`;
};

const fetchVerseText = async (verseRef: string): Promise<string> => {
  try {
    const match = verseRef.match(/^(\d*\s*[a-zA-Z\s]+)\s*(\d+):(\d+)(?:-(\d+))?$/);
    if (!match) return '';
    
    const book = match[1].trim().toLowerCase().replace(/\s+/g, '');
    const chapter = match[2];
    const verse = match[3];
    
    const apiUrl = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/en-kjv/books/${book}/chapters/${chapter}/verses/${verse}.json`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) return '';
    
    const data = await response.json();
    return data.text ? data.text.trim() : '';
  } catch {
    return '';
  }
};

const generateBackgroundImage = async (prompt: string): Promise<string[]> => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:generateImage?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt, // Image description
        generationConfig: {
          numberOfImages: 1, // Generate a single background image
          aspectRatio: "16:9", // Adjust the background dimensions
          safetyFilterLevel: "medium", // Apply safety filtering
          personGeneration: "allow" // Enable realistic human rendering if needed
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate background image');
    }

    const data = await response.json();
    return data.generatedImages.map((image: any) => image.imageUrl);

  } catch (err) {
    console.error('Error generating background:', err);
    return []; // Return an empty array in case of failure
  }
};


const createGradientBackground = (prompt: string): string => {
  // Create beautiful gradients based on prompt content
  const promptLower = prompt.toLowerCase();
  
  let gradient = '';
  
  if (promptLower.includes('sunrise') || promptLower.includes('dawn')) {
    gradient = 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)';
  } else if (promptLower.includes('mountain') || promptLower.includes('peaks')) {
    gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  } else if (promptLower.includes('water') || promptLower.includes('lake')) {
    gradient = 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)';
  } else if (promptLower.includes('garden') || promptLower.includes('flowers')) {
    gradient = 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
  } else if (promptLower.includes('forest') || promptLower.includes('green')) {
    gradient = 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
  } else if (promptLower.includes('peace') || promptLower.includes('tranquil')) {
    gradient = 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)';
  } else {
    // Default divine gradient
    gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)';
  }
  
  return gradient;
};

const generateBibleCard = async () => {
  if (!props.verse) return;
  
  isGenerating.value = true;
  error.value = null;
  
  try {
    // Get verse text if not provided
    let verseText = props.verseText;
    if (!verseText) {
      verseText = await fetchVerseText(props.verse);
    }
    
    if (!verseText) {
      throw new Error('Unable to fetch verse text');
    }
    
    // Generate image prompt
    const imagePrompt = generateImagePrompt(verseText, props.verse);
    
    // Generate background
    const backgroundImage = await generateBackgroundImage(imagePrompt);
    
    // Create card data
    const cardData: BibleCardData = {
      verseText,
      verseReference: props.verse,
      backgroundImage
    };
    
    generatedCard.value = cardData;
    emit('cardGenerated', cardData);
    
  } catch (err) {
    console.error('Error generating Bible card:', err);
    error.value = err instanceof Error ? err.message : 'Failed to generate card';
  } finally {
    isGenerating.value = false;
  }
};

const regenerateCard = () => {
  generatedCard.value = null;
  generateBibleCard();
};

const downloadCard = async () => {
  if (!generatedCard.value) return;
  
  try {
    // Create canvas for download
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set card dimensions
    canvas.width = 800;
    canvas.height = 600;
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    const gradientStr = generatedCard.value.backgroundImage;
    
    // Parse gradient and apply
    if (gradientStr.includes('linear-gradient')) {
      // Simple gradient parsing - in production, use a proper gradient parser
      if (gradientStr.includes('#667eea')) {
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(0.5, '#764ba2');
        gradient.addColorStop(1, '#f093fb');
      } else if (gradientStr.includes('#74b9ff')) {
        gradient.addColorStop(0, '#74b9ff');
        gradient.addColorStop(1, '#0984e3');
      } else {
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
      }
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add text
    ctx.fillStyle = 'white';
    ctx.font = 'italic 32px Georgia, serif';
    ctx.textAlign = 'center';
    
    // Word wrap the verse text
    const words = generatedCard.value.verseText.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > canvas.width - 100 && currentLine !== '') {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine.trim());
    
    // Draw verse text
    const startY = (canvas.height - (lines.length * 40)) / 2;
    lines.forEach((line, index) => {
      ctx.fillText(`"${line}"`, canvas.width / 2, startY + (index * 40));
    });
    
    // Draw reference
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillText(generatedCard.value.verseReference, canvas.width / 2, startY + (lines.length * 40) + 60);
    
    // Download
    const link = document.createElement('a');
    link.download = `bible-verse-${generatedCard.value.verseReference.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
    link.href = canvas.toDataURL();
    link.click();
    
  } catch (err) {
    console.error('Error downloading card:', err);
  }
};

const shareCard = async () => {
  if (!generatedCard.value) return;
  
  const shareData = {
    title: `Bible Verse: ${generatedCard.value.verseReference}`,
    text: `"${generatedCard.value.verseText}" - ${generatedCard.value.verseReference}`,
  };
  
  try {
    if (navigator.share) {
      await navigator.share(shareData);
      emit('cardShared', true);
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(`${shareData.text}`);
      emit('cardShared', true);
    }
  } catch (err) {
    console.error('Error sharing card:', err);
    emit('cardShared', false);
  }
};
</script>

<style scoped>
.bible-card-container {
  margin: 1rem 0;
}

.generate-card-btn {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border: none;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.generate-card-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.card-generation-loading {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
}

.bible-card-display {
  margin-top: 1.5rem;
}

.bible-card {
  position: relative;
  width: 100%;
  max-width: 600px;
  height: 400px;
  margin: 0 auto;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.bible-card-overlay {
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

.bible-card-content {
  text-align: center;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.bible-verse-text {
  font-size: 1.5rem;
  font-style: italic;
  font-weight: 300;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-family: 'Georgia', serif;
}

.bible-verse-reference {
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Arial', sans-serif;
}

.card-actions {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.card-actions .btn {
  transition: all 0.3s ease;
}

.card-actions .btn:hover {
  transform: translateY(-2px);
}

/* Responsive design */
@media (max-width: 768px) {
  .bible-card {
    height: 300px;
    max-width: 100%;
  }
  
  .bible-verse-text {
    font-size: 1.2rem;
  }
  
  .bible-verse-reference {
    font-size: 1rem;
  }
  
  .card-actions {
    justify-content: center;
  }
  
  .card-actions .btn {
    flex: 1;
    min-width: 120px;
  }
}

/* Dark mode adjustments */
[data-bs-theme="dark"] .card-generation-loading {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

[data-bs-theme="dark"] .bible-card {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}
</style>
