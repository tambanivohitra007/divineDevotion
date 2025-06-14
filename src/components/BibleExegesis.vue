<template>
  <div class="bible-exegesis">
    <div class="container-fluid">
      <div class="row">
        <!-- Input Panel -->
        <div class="col-lg-5 col-md-6">
          <div class="card exegesis-panel">
            <div class="card-header">
              <h4 class="card-title mb-0">
                <i class="bi bi-book-half me-2"></i>
                {{ $t('bibleExegesis.title') }}
              </h4>
              <p class="card-subtitle text-muted mt-2 mb-0">
                {{ $t('bibleExegesis.subtitle') }}
              </p>
            </div>
            <div class="card-body">
              <!-- Passage Input Section -->
              <div class="mb-4">
                <label for="passageInput" class="form-label fw-semibold">
                  <i class="bi bi-quote me-1"></i>{{ $t('bibleExegesis.passageLabel') }}
                </label>
                <div class="input-group mb-2">
                  <input
                    id="passageReference"
                    v-model="passageReference"
                    type="text"
                    class="form-control"
                    :placeholder="$t('bibleExegesis.referencePlaceholder')"
                    @input="validateReference"
                  />
                  <button 
                    @click="fetchPassageText" 
                    class="btn btn-outline-primary"
                    :disabled="isFetchingText || !passageReference.trim()"
                    :title="$t('bibleExegesis.fetchText')"
                  >
                    <i v-if="isFetchingText" class="bi bi-arrow-repeat spinner"></i>
                    <i v-else class="bi bi-download"></i>
                  </button>
                </div>
                <textarea
                  id="passageInput"
                  v-model="passageText"
                  class="form-control"
                  rows="6"
                  :placeholder="$t('bibleExegesis.textPlaceholder')"
                ></textarea>
                <div v-if="referenceValidationMessage" class="form-text" :class="referenceValidationClass">
                  {{ referenceValidationMessage }}
                </div>
              </div>

              <!-- Analysis Type Selection -->
              <div class="mb-4">
                <label class="form-label fw-semibold">
                  <i class="bi bi-gear me-1"></i>{{ $t('bibleExegesis.analysisType') }}
                </label>
                <div class="analysis-type-options">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="exegesisCheck"
                      v-model="includeExegesis"
                    />
                    <label class="form-check-label" for="exegesisCheck">
                      <strong>{{ $t('bibleExegesis.exegesis') }}</strong>
                      <small class="text-muted d-block">{{ $t('bibleExegesis.exegesisDesc') }}</small>
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="hermeneuticsCheck"
                      v-model="includeHermeneutics"
                    />
                    <label class="form-check-label" for="hermeneuticsCheck">
                      <strong>{{ $t('bibleExegesis.hermeneutics') }}</strong>
                      <small class="text-muted d-block">{{ $t('bibleExegesis.hermeneuticsDesc') }}</small>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Focus Areas -->
              <div class="mb-4">                <label class="form-label fw-semibold">
                  <i class="bi bi-bullseye me-1"></i>{{ $t('bibleExegesis.focusAreasLabel') }}
                </label>
                <div class="focus-areas-grid">
                  <div 
                    v-for="area in focusAreaOptions" 
                    :key="area.key"
                    class="form-check"
                  >
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :id="area.key"
                      v-model="selectedFocusAreas"
                      :value="area.key"
                    />
                    <label class="form-check-label" :for="area.key">
                      {{ $t(`bibleExegesis.focusAreas.${area.key}`) }}
                    </label>
                  </div>
                </div>
              </div>

              <!-- Generate Button -->
              <div class="d-grid">
                <button
                  @click="generateAnalysis"
                  class="btn btn-primary btn-lg"
                  :disabled="isGenerating || !canGenerate"
                >
                  <span v-if="isGenerating">
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    {{ $t('bibleExegesis.generating') }}
                  </span>
                  <span v-else>
                    <i class="bi bi-search me-2"></i>
                    {{ $t('bibleExegesis.generateAnalysis') }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Analysis Display Panel -->
        <div class="col-lg-7 col-md-6">
          <div class="card analysis-display">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="bi bi-mortarboard me-2"></i>
                {{ $t('bibleExegesis.analysisResults') }}
              </h5>
            </div>
            <div class="card-body">
              <!-- Loading State -->
              <div v-if="isGenerating" class="text-center py-5">
                <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;"></div>
                <p class="lead">{{ $t('bibleExegesis.analyzingText') }}</p>
                <div class="placeholder-glow mt-4">
                  <span class="placeholder col-12 mb-2 py-2"></span>
                  <span class="placeholder col-9 mb-2 py-2"></span>
                  <span class="placeholder col-11 mb-2 py-2"></span>
                  <span class="placeholder col-8 py-2"></span>
                </div>
              </div>

              <!-- Analysis Results -->
              <div v-else-if="analysisResult" class="analysis-content">
                <!-- Passage Header -->
                <div class="passage-header mb-4">
                  <h6 class="text-primary mb-2">
                    <i class="bi bi-bookmark me-1"></i>
                    {{ passageReference }}
                  </h6>
                  <blockquote class="blockquote border-start border-primary ps-3">
                    <p class="mb-0 fst-italic">{{ passageText }}</p>
                  </blockquote>
                </div>

                <!-- Exegesis Section -->
                <div v-if="analysisResult.exegesis" class="analysis-section mb-4">
                  <h5 class="section-title">
                    <i class="bi bi-zoom-in me-2"></i>
                    {{ $t('bibleExegesis.exegesisTitle') }}
                  </h5>
                  <div class="section-content" v-html="analysisResult.exegesis"></div>
                </div>

                <!-- Hermeneutics Section -->
                <div v-if="analysisResult.hermeneutics" class="analysis-section mb-4">
                  <h5 class="section-title">
                    <i class="bi bi-compass me-2"></i>
                    {{ $t('bibleExegesis.hermeneuticsTitle') }}
                  </h5>
                  <div class="section-content" v-html="analysisResult.hermeneutics"></div>
                </div>

                <!-- Key Insights -->
                <div v-if="analysisResult.keyInsights && analysisResult.keyInsights.length > 0" class="analysis-section mb-4">
                  <h5 class="section-title">
                    <i class="bi bi-lightbulb me-2"></i>
                    {{ $t('bibleExegesis.keyInsights') }}
                  </h5>
                  <ul class="insights-list">
                    <li v-for="insight in analysisResult.keyInsights" :key="insight" class="insight-item">
                      {{ insight }}
                    </li>
                  </ul>
                </div>

                <!-- Action Buttons -->
                <div class="actions-toolbar text-center mt-4 pt-3 border-top">
                  <button class="btn btn-success btn-sm me-2" @click="saveAnalysis">
                    <i class="bi bi-bookmark-plus me-1"></i>
                    {{ $t('bibleExegesis.saveAnalysis') }}
                  </button>
                  <button class="btn btn-outline-info btn-sm me-2" @click="shareAnalysis">
                    <i class="bi bi-share me-1"></i>
                    {{ $t('bibleExegesis.shareAnalysis') }}
                  </button>
                  <button class="btn btn-outline-secondary btn-sm" @click="clearAnalysis">
                    <i class="bi bi-arrow-clockwise me-1"></i>
                    {{ $t('bibleExegesis.newAnalysis') }}
                  </button>
                </div>
              </div>

              <!-- Error State -->
              <div v-else-if="error" class="alert alert-danger">
                <h6 class="alert-heading">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  {{ $t('bibleExegesis.errorTitle') }}
                </h6>
                <p class="mb-0">{{ error }}</p>
              </div>

              <!-- Welcome State -->
              <div v-else class="text-center py-5">
                <i class="bi bi-book-half display-4 text-muted mb-3"></i>
                <h5 class="text-muted">{{ $t('bibleExegesis.welcomeTitle') }}</h5>
                <p class="text-muted">{{ $t('bibleExegesis.welcomeDesc') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Component state
const passageReference = ref('');
const passageText = ref('');
const includeExegesis = ref(true);
const includeHermeneutics = ref(true);
const selectedFocusAreas = ref<string[]>(['historical', 'literary', 'theological']);

// API state
const isGenerating = ref(false);
const isFetchingText = ref(false);
const error = ref<string | null>(null);
const analysisResult = ref<ExegesisResult | null>(null);

// Validation state
const referenceValidationMessage = ref('');
const referenceValidationClass = ref('');

// Types
interface ExegesisResult {
  exegesis?: string;
  hermeneutics?: string;
  keyInsights?: string[];
}

// Focus area options
const focusAreaOptions = [
  { key: 'historical' },
  { key: 'literary' },
  { key: 'theological' },
  { key: 'cultural' },
  { key: 'linguistic' },
  { key: 'canonical' }
];

// Computed properties
const canGenerate = computed(() => {
  return passageText.value.trim() && 
         (includeExegesis.value || includeHermeneutics.value) &&
         selectedFocusAreas.value.length > 0;
});

// Bible API functions
const validateReference = () => {
  if (!passageReference.value.trim()) {
    referenceValidationMessage.value = '';
    referenceValidationClass.value = '';
    return;
  }

  // Basic validation for Bible reference format
  const referencePattern = /^(\d*\s*[a-zA-Z\s]+)\s*(\d+):?(\d+)?(?:-(\d+))?$/;
  const isValid = referencePattern.test(passageReference.value.trim());
  
  if (isValid) {
    referenceValidationMessage.value = t('bibleExegesis.validReference');
    referenceValidationClass.value = 'text-success';
  } else {
    referenceValidationMessage.value = t('bibleExegesis.invalidReference');
    referenceValidationClass.value = 'text-danger';
  }
};

const fetchPassageText = async () => {
  if (!passageReference.value.trim()) return;
  
  isFetchingText.value = true;
  error.value = null;
  
  try {
    // Parse the reference
    const match = passageReference.value.trim().match(/^(\d*\s*[a-zA-Z\s]+)\s*(\d+):?(\d+)?(?:-(\d+))?$/);
    if (!match) {
      throw new Error(t('bibleExegesis.invalidReferenceFormat'));
    }
    
    let book = match[1].trim().toLowerCase().replace(/\s+/g, '');
    const chapter = match[2];
    const startVerse = match[3] || '1';
    const endVerse = match[4] || startVerse;
    
    // Map common book name variations
    const bookMappings: Record<string, string> = {
      'psalm': 'psalms',
      'proverb': 'proverbs',
      '1john': '1-john',
      '2john': '2-john',
      '3john': '3-john',
      '1peter': '1-peter',
      '2peter': '2-peter',
      '1timothy': '1-timothy',
      '2timothy': '2-timothy',
      '1corinthians': '1-corinthians',
      '2corinthians': '2-corinthians',
      '1thessalonians': '1-thessalonians',
      '2thessalonians': '2-thessalonians',
      '1kings': '1-kings',
      '2kings': '2-kings',
      '1chronicles': '1-chronicles',
      '2chronicles': '2-chronicles',
      '1samuel': '1-samuel',
      '2samuel': '2-samuel'
    };
    
    if (bookMappings[book]) {
      book = bookMappings[book];
    }
    
    // Fetch verses
    const verses = [];
    for (let v = parseInt(startVerse); v <= parseInt(endVerse); v++) {
      const apiUrl = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/en-kjv/books/${book}/chapters/${chapter}/verses/${v}.json`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(t('bibleExegesis.verseNotFound'));
        }
        throw new Error(t('bibleExegesis.fetchError'));
      }
      
      const data = await response.json();
      verses.push(data.text);
    }
    
    passageText.value = verses.join(' ');
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('bibleExegesis.unknownError');
  } finally {
    isFetchingText.value = false;
  }
};

// Analysis generation
const generateAnalysis = async () => {
  if (!canGenerate.value) return;
  
  isGenerating.value = true;
  error.value = null;
  
  try {
    const response = await generateExegesisContent();
    analysisResult.value = response;
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('bibleExegesis.analysisError');
  } finally {
    isGenerating.value = false;
  }
};

// Gemini API integration for exegesis
const generateExegesisContent = async (): Promise<ExegesisResult> => {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  
  if (!GEMINI_API_KEY) {
    throw new Error(t('bibleExegesis.apiKeyMissing'));
  }
  
  // Build the prompt based on selected options
  let prompt = `Please provide a scholarly analysis of the following Bible passage:\n\n`;
  prompt += `Reference: ${passageReference.value}\n`;
  prompt += `Text: "${passageText.value}"\n\n`;
  
  if (includeExegesis.value) {
    prompt += `EXEGESIS (Critical Interpretation of the Text Itself):\n`;
    prompt += `Provide detailed exegetical analysis focusing on:\n`;
    if (selectedFocusAreas.value.includes('linguistic')) {
      prompt += `- Original language insights (Hebrew/Greek word meanings, grammar)\n`;
    }
    if (selectedFocusAreas.value.includes('historical')) {
      prompt += `- Historical context and background\n`;
    }
    if (selectedFocusAreas.value.includes('literary')) {
      prompt += `- Literary structure, genre, and rhetorical devices\n`;
    }
    if (selectedFocusAreas.value.includes('cultural')) {
      prompt += `- Cultural and social context of the original audience\n`;
    }
    prompt += `\n`;
  }
  
  if (includeHermeneutics.value) {
    prompt += `HERMENEUTICS (Interpretive Principles Applied to Meaning):\n`;
    prompt += `Provide hermeneutical analysis including:\n`;
    if (selectedFocusAreas.value.includes('theological')) {
      prompt += `- Theological significance and doctrinal implications\n`;
    }
    if (selectedFocusAreas.value.includes('canonical')) {
      prompt += `- How this passage relates to the broader biblical narrative\n`;
    }
    prompt += `- Principles for contemporary application\n`;
    prompt += `- Cross-references to related passages\n\n`;
  }
  
  prompt += `Please provide 3-5 key insights that emerge from this analysis.\n\n`;
  prompt += `Format the response as clear, well-structured content suitable for Bible study. Use proper theological terminology while remaining accessible to educated readers.`;
  
  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2000,
    }
  };
  
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  if (!generatedText) {
    throw new Error(t('bibleExegesis.noContentGenerated'));
  }
  
  // Parse the generated content into sections
  return parseAnalysisResponse(generatedText);
};

const parseAnalysisResponse = (text: string): ExegesisResult => {
  const result: ExegesisResult = {};
  
  // Extract exegesis section
  const exegesisMatch = text.match(/EXEGESIS[^:]*:?\s*(.*?)(?=HERMENEUTICS|Key Insights|$)/is);
  if (exegesisMatch) {
    result.exegesis = formatAnalysisText(exegesisMatch[1].trim());
  }
  
  // Extract hermeneutics section
  const hermeneuticsMatch = text.match(/HERMENEUTICS[^:]*:?\s*(.*?)(?=Key Insights|$)/is);
  if (hermeneuticsMatch) {
    result.hermeneutics = formatAnalysisText(hermeneuticsMatch[1].trim());
  }
  
  // Extract key insights
  const insightsMatch = text.match(/Key Insights[^:]*:?\s*(.*?)$/is);
  if (insightsMatch) {
    const insightsText = insightsMatch[1].trim();
    result.keyInsights = insightsText
      .split(/\n\s*[-•*]\s*/)
      .filter(insight => insight.trim())
      .map(insight => insight.trim().replace(/^\d+\.\s*/, ''));
  }
  
  return result;
};

const formatAnalysisText = (text: string): string => {
  // Convert markdown-style formatting to HTML
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
    .replace(/<p><\/p>/g, '');
};

// Action handlers
const saveAnalysis = () => {
  // Implementation would integrate with the existing useDevotions composable
  // For now, just show a success message
  alert(t('bibleExegesis.analysisSaved'));
};

const shareAnalysis = async () => {
  if (!analysisResult.value) return;
  
  let shareText = `Bible Analysis: ${passageReference.value}\n\n`;
  shareText += `"${passageText.value}"\n\n`;
  
  if (analysisResult.value.exegesis) {
    shareText += `EXEGESIS:\n${analysisResult.value.exegesis.replace(/<[^>]*>/g, '')}\n\n`;
  }
  
  if (analysisResult.value.hermeneutics) {
    shareText += `HERMENEUTICS:\n${analysisResult.value.hermeneutics.replace(/<[^>]*>/g, '')}\n\n`;
  }
  
  if (analysisResult.value.keyInsights) {
    shareText += `KEY INSIGHTS:\n${analysisResult.value.keyInsights.map(insight => `• ${insight}`).join('\n')}`;
  }
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Bible Analysis: ${passageReference.value}`,
        text: shareText,
      });
    } catch (err) {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareText);
      alert(t('bibleExegesis.copiedToClipboard'));
    }
  } else {
    await navigator.clipboard.writeText(shareText);
    alert(t('bibleExegesis.copiedToClipboard'));
  }
};

const clearAnalysis = () => {
  analysisResult.value = null;
  error.value = null;
  passageReference.value = '';
  passageText.value = '';
};

onMounted(() => {
  // Component initialization
});
</script>

<style scoped>
.bible-exegesis {
  padding: 1rem;
}

.exegesis-panel,
.analysis-display {
  height: calc(100vh - 200px);
  min-height: 600px;
}

.card-body {
  overflow-y: auto;
}

.analysis-type-options .form-check {
  padding: 0.75rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;
}

.analysis-type-options .form-check:hover {
  background-color: var(--bs-light);
}

.focus-areas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
}

.focus-areas-grid .form-check {
  padding: 0.5rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.focus-areas-grid .form-check:hover {
  background-color: var(--bs-light);
}

.passage-header {
  background: linear-gradient(135deg, var(--bs-primary-bg-subtle), var(--bs-secondary-bg-subtle));
  padding: 1.5rem;
  border-radius: 0.5rem;
  border-left: 4px solid var(--bs-primary);
}

.analysis-section {
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.section-title {
  color: var(--bs-primary);
  border-bottom: 2px solid var(--bs-primary);
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.section-content {
  line-height: 1.7;
}

.insights-list {
  list-style: none;
  padding: 0;
}

.insight-item {
  background: var(--bs-light);
  border-left: 4px solid var(--bs-success);
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 0.25rem;
}

.insight-item:before {
  content: "💡";
  margin-right: 0.5rem;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.actions-toolbar {
  background: var(--bs-light);
  border-radius: 0.5rem;
  padding: 1rem;
}

/* Dark mode adjustments */
[data-bs-theme="dark"] .analysis-type-options .form-check:hover {
  background-color: var(--bs-dark);
}

[data-bs-theme="dark"] .focus-areas-grid .form-check:hover {
  background-color: var(--bs-dark);
}

[data-bs-theme="dark"] .insight-item {
  background: var(--bs-dark);
}

[data-bs-theme="dark"] .actions-toolbar {
  background: var(--bs-dark);
}
</style>
