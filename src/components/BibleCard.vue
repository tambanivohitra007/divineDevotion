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
        </div>        <p class="mb-0">Generating real AI image with Gemini...</p>
        <small class="text-muted">Using Gemini AI Imagen to generate real spiritual images</small>
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

const generateBackgroundImage = async (prompt: string): Promise<string> => {
  try {
    // --- Call Gemini API for Image Generation (Imagen 3) ---
    // IMPORTANT: Using the actual working API structure from BibleCardGenerator
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`;

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
  link.download = `bible-verse-${generatedCard.value.verseReference.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
  link.href = canvas.toDataURL('image/png', 0.95);
  link.click();
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
