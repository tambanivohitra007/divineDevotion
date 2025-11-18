<template>
  <div id="app" class="perplexity-layout">
    <!-- Sidenav -->
    <nav id="sidenav" class="sidenav">
      <ul class="sidenav-items flexbox-col">
        <!-- Logo/Brand -->
        <li class="sidenav-logo flexbox-left">
          <a class="sidenav-item-inner flexbox">
            <div class="sidenav-logo-icon">
              <img src="/icons/logo.png" alt="Divine Devotion Logo" class="logo-image" />
            </div>
          </a>
        </li>

        <!-- Content Type Navigation -->
        <li class="sidenav-item flexbox-left">
          <a 
            class="sidenav-item-inner flexbox-left"
            :class="{ active: contentTypeSelection === 'devotion' }"
            @click="selectContentType('devotion')"
          >
            <div class="sidenav-item-inner-icon-wrapper flexbox">
              <i class="bi bi-stars"></i>
            </div>
            <span class="link-text">{{ $t('contentTypes.devotion') }}</span>
          </a>
        </li>

        <li class="sidenav-item flexbox-left">
          <a 
            class="sidenav-item-inner flexbox-left"
            :class="{ active: contentTypeSelection === 'faithIntegration' }"
            @click="selectContentType('faithIntegration')"
          >
            <div class="sidenav-item-inner-icon-wrapper flexbox">
              <i class="bi bi-lightbulb"></i>
            </div>
            <span class="link-text">{{ $t('contentTypes.faithAndLearning') }}</span>
          </a>
        </li>

        <li class="sidenav-item flexbox-left">
          <a 
            class="sidenav-item-inner flexbox-left"
            :class="{ active: contentTypeSelection === 'bibleCard' }"
            @click="selectContentType('bibleCard')"
          >
            <div class="sidenav-item-inner-icon-wrapper flexbox">
              <i class="bi bi-card-image"></i>
            </div>
            <span class="link-text">{{ $t('contentTypes.bibleCards') }}</span>
          </a>
        </li>

        <li class="sidenav-item flexbox-left">
          <a 
            class="sidenav-item-inner flexbox-left"
            :class="{ active: contentTypeSelection === 'bibleExegesis' }"
            @click="selectContentType('bibleExegesis')"
          >
            <div class="sidenav-item-inner-icon-wrapper flexbox">
              <i class="bi bi-book-half"></i>
            </div>
            <span class="link-text">{{ $t('contentTypes.bibleExegesis') }}</span>
          </a>
        </li>

        <!-- Action Buttons -->
        <li class="sidenav-item flexbox-left">
          <a 
            class="sidenav-item-inner flexbox-left"
            @click="openSavedContentDialog"
          >
            <div class="sidenav-item-inner-icon-wrapper flexbox">
              <i class="bi bi-collection"></i>
            </div>
            <span class="link-text">{{ $t('sidebar.saved') }}</span>
          </a>
        </li>

        <li class="sidenav-item flexbox-left">
          <a 
            class="sidenav-item-inner flexbox-left"
            @click="toggleTheme"
          >
            <div class="sidenav-item-inner-icon-wrapper flexbox">
              <i :class="isDarkMode ? 'bi bi-sun' : 'bi bi-moon'"></i>
            </div>
            <span class="link-text">{{ isDarkMode ? $t('navigation.lightMode') : $t('navigation.darkMode') }}</span>
          </a>
        </li>

        <li class="sidenav-item flexbox-left language-selector-item">
          <div class="sidenav-item-inner flexbox-left">
            <div class="sidenav-item-inner-icon-wrapper flexbox">
              <i class="bi bi-translate"></i>
            </div>
            <div class="link-text language-selector-wrapper">
              <LanguageSelector />
            </div>
          </div>
        </li>
      </ul>
    </nav>

    <!-- Main Content Area -->
    <main id="main" class="main-content flexbox-col">      

      <!-- Main Content Container -->
      <div class="content-container" ref="contentAreaRef" @scroll="handleContentScroll">
        <div class="content-wrapper">
          <!-- Loading State -->
          <div v-if="isLoading" class="content-card">
            <div class="loading-state">
              <div class="loading-spinner">
                <div class="spinner"></div>
              </div>
              <h3 class="loading-title">{{ $t('content.generating') }}</h3>
              <div class="loading-skeleton">
                <div class="skeleton-line skeleton-line-long"></div>
                <div class="skeleton-line skeleton-line-medium"></div>
                <div class="skeleton-line skeleton-line-short"></div>
                <div class="skeleton-line skeleton-line-long"></div>
              </div>
            </div>
          </div>
          
          <!-- Content Display -->
          <div v-else-if="currentContent.text && !generationError && !showBibleCardGenerator && !showBibleExegesis" class="content-card">
            <div class="generated-content">
            <!-- Content Header -->
            <div class="content-header">
              <div class="content-meta">
                <div class="content-type-icon">
                  <i :class="currentContent.type === 'devotion' ? 'bi bi-stars' : 'bi bi-lightbulb'"></i>
                </div>
                <div class="content-info">
                  <h2 class="content-title">
                    {{ currentContent.type === 'devotion' ? $t('content.yourDevotion') : $t('content.yourFaithIdea') }}
                  </h2>
                  <p class="content-subtitle" v-if="currentContent.topic">
                    {{ currentContent.topic }}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- First Verse Highlight -->
            <div v-if="currentContent.type === 'devotion' && currentContent.verses && currentContent.verses.length > 0" class="verse-highlight">
              <div class="verse-reference">
                <i class="bi bi-quote"></i>
                <span class="verse-ref-text">{{ currentContent.verses[0] }}</span>
              </div>
              <blockquote v-if="firstVerseText" class="verse-quote">
                {{ firstVerseText }}
              </blockquote>
            </div>
            
            <!-- Main Content -->
            <div class="content-body">
              <DevotionDisplay :devotion="formattedContentForDisplay" :content-type="currentContent.type || 'devotion'" />
            </div>
            
            <!-- Content Actions -->
            <div class="content-actions">
              <button class="action-button primary" @click="handleSaveCurrentContent">
                <i class="bi bi-bookmark"></i>
                <span>{{ currentContent.type === 'devotion' ? $t('actions.saveDevotion') : $t('actions.saveIdea') }}</span>
              </button>
              <button class="action-button secondary" @click="handleShareContent">
                <i class="bi bi-share"></i>
                <span>{{ $t('actions.share') }}</span>
              </button>
            </div>
            </div>
          </div>
          
          <!-- Specialized Components -->
          <div v-else-if="showBibleCardGenerator" class="content-card">
            <div class="specialized-content">
              <BibleCardGenerator />
            </div>
          </div>

          <div v-else-if="showBibleExegesis" class="content-card">
            <div class="specialized-content">
              <BibleExegesis />
            </div>
          </div>
          
          <!-- Welcome/Empty State -->
          <div v-else-if="!isLoading && !currentContent.text && !generationError && !showBibleCardGenerator && !showBibleExegesis" class="welcome-state">
            <div class="welcome-content">
              <div class="welcome-icon">
                <i class="bi bi-stars"></i>
              </div>
              <h2 class="welcome-title">{{ $t('welcome.title') }}</h2>
              <p class="welcome-subtitle">{{ $t('welcome.subtitle') }}</p>
              
              <!-- Quick Start Button -->
              <button class="quick-start-btn" @click="showPromptGallery = true">
                <i class="bi bi-lightbulb"></i>
                <span>{{ $t('welcome.browsePrompts') }}</span>
                <i class="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Notifications -->
      <div class="notifications">
        <div v-if="showSaveConfirmation" class="notification success">
          <i class="bi bi-check-circle"></i>
          <span>{{ $t('alerts.contentSaved') }}</span>
          <button @click="showSaveConfirmation = false" class="notification-close">
            <i class="bi bi-x"></i>
          </button>
        </div>
        
        <div v-if="showShareAlert" class="notification info">
          <i class="bi bi-info-circle"></i>
          <span>{{ shareAlertMessage }}</span>
          <button @click="showShareAlert = false" class="notification-close">
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>
    </main>

    <!-- Prompt Gallery Modal -->
    <div v-if="showPromptGallery" class="prompt-gallery-modal">
      <div class="prompt-gallery-overlay" @click="showPromptGallery = false"></div>
      <div class="prompt-gallery-panel">
        <div class="prompt-gallery-header">
          <h2 class="gallery-modal-title">{{ $t('promptGallery.title') }}</h2>
          <button class="gallery-close-btn" @click="showPromptGallery = false">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="prompt-gallery-content">
          <PromptGallery @prompt-selected="handlePromptSelection" />
        </div>
      </div>
    </div>

    <!-- Saved Content Dialog -->
    <SavedContentDialog 
      :show="showSavedContentDialog"
      :saved-content="savedContent"
      @close="showSavedContentDialog = false"
      @select-content="viewSavedContent"
      @delete-content="handleDeleteContent"
    />

    <!-- Search Input Area -->
    <div class="search-area" :class="{ 'search-hidden': !showBottomInput }">
      <div class="search-container">
        <form v-if="!showBibleCardGenerator && !showBibleExegesis" @submit.prevent="handleGenerateContent" class="search-form">
          <div class="search-input-wrapper">
            <div class="search-input-container">
              <textarea
                id="topicInput"
                class="search-input"
                rows="1"
                :placeholder="topicInputPlaceholder"
                v-model="topicInput"
                @input="autoResizeTextarea"
                @keydown="handleKeyDown"
                ref="textareaRef"
              ></textarea>
              <button
                type="submit"
                class="search-submit-btn"
                :disabled="isLoading || !topicInput.trim()"
              >
                <span v-if="isLoading" class="submit-loading">
                  <div class="submit-spinner"></div>
                </span>
                <span v-else class="submit-icon">
                  <i class="bi bi-arrow-up"></i>
                </span>
              </button>
            </div>
          </div>
          
          <div v-if="generationError" class="error-message">
            <i class="bi bi-exclamation-triangle"></i>
            <span>{{ generationError }}</span>
          </div>
        </form>
        
        <div class="search-footer">
          <p class="search-hint">{{ $t('welcome.instruction') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, watchEffect, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import DevotionDisplay from './components/DevotionDisplay.vue';
import BibleCardGenerator from './components/BibleCardGenerator.vue';
import BibleExegesis from './components/BibleExegesis.vue';
import PromptGallery from './components/PromptGallery.vue';
import LanguageSelector from './components/LanguageSelector.vue';
import SavedContentDialog from './components/SavedContentDialog.vue';
import useGemini from './composables/useGemini';
// Correctly import useContentStorage and StoredContent type
import useContentStorage, { type StoredContent } from './composables/useDevotions';

// Initialize i18n
const { t, locale } = useI18n();

const selectedContentType = ref<'devotion' | 'faithIntegration'>('devotion');
const showBibleCardGenerator = ref(false);
const showBibleExegesis = ref(false);
const showPromptGallery = ref(false);
const showSavedContentDialog = ref(false);
const topicInput = ref(''); // Renamed from devotionTopic

// Computed property for dropdown selection that combines selectedContentType and showBibleCardGenerator
const contentTypeSelection = computed({
  get: () => {
    if (showBibleCardGenerator.value) return 'bibleCard';
    if (showBibleExegesis.value) return 'bibleExegesis';
    return selectedContentType.value;
  },
  set: () => {
    // This will be handled by handleContentTypeChange method
  }
});

// Separate content storage for each type
const devotionContent = ref<StoredContent>({
  id: '',
  text: '',
  verses: [],
  topic: '',
  type: 'devotion',
});

const faithIntegrationContent = ref<StoredContent>({
  id: '',
  text: '',
  verses: [],
  topic: '',
  type: 'faithIntegration',
});

// Computed property for current content based on selected type
const currentContent = computed(() => {
  return selectedContentType.value === 'devotion' 
    ? devotionContent.value 
    : faithIntegrationContent.value;
});

const { generateGeminiContent, isLoading, error: generationError } = useGemini(); // Gemini function
const { savedContent, saveContent, deleteContent, loadContent } = useContentStorage(); // Updated import and usage

const showSaveConfirmation = ref(false);

const showShareAlert = ref(false);
const shareAlertMessage = ref('');

// Ref for the textarea
const textareaRef = ref<HTMLTextAreaElement>();

// Ref for the content area
const contentAreaRef = ref<HTMLElement>();

// Refs for content type menu
const contentTypeButtonRef = ref<HTMLButtonElement>();
const menuPanelRef = ref<HTMLDivElement>();

// Content type menu state
const showContentTypeMenu = ref(false);

// Fade effects state
const showTopFade = ref(false);
const showBottomFade = ref(false);

// Bottom input area auto-hide state
const showBottomInput = ref(true);
const scrollTimeout = ref<number | null>(null);

// Header auto-hide state
const showHeader = ref(true);
const headerScrollTimeout = ref<number | null>(null);

// Taskbar visibility state
const showTaskbar = ref(true);

// Mobile responsiveness
const isMobile = ref(false);
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

const firstVerseText = ref('');

// Initialize isDarkMode from localStorage or default to true (dark mode)
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme === 'dark';
  }
  return true; // Default to dark mode
};
const isDarkMode = ref(initializeTheme());

// Function to toggle theme
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
};

// Watch for changes in isDarkMode, update data-bs-theme attribute, and save to localStorage
watchEffect(() => {
  const theme = isDarkMode.value ? 'dark' : 'light';
  document.documentElement.setAttribute('data-bs-theme', theme);
  localStorage.setItem('theme', theme);
});

// Apply the theme when the component is mounted
// This ensures the theme is set correctly on initial load based on localStorage or default
onMounted(() => {
  loadContent(); // Ensure content is loaded on mount
  // Mobile check
  checkMobile(); // Call once to set initial state for isMobile
  window.addEventListener('resize', checkMobile);
    // Add click outside listener for menu
  document.addEventListener('click', closeMenuOnClickOutside);

  // Theme initialization
  const theme = isDarkMode.value ? 'dark' : 'light';
  document.documentElement.setAttribute('data-bs-theme', theme);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  document.removeEventListener('click', closeMenuOnClickOutside);
});

// Computed properties for dynamic UI text
const topicInputPlaceholder = computed(() => {
  if (showBibleCardGenerator.value) {
    return t('placeholders.bibleCardInfo');
  }
  return selectedContentType.value === 'devotion' 
    ? t('placeholders.devotionInput')
    : t('placeholders.faithInput');
});

// Fetch the text of the first verse when currentContent.verses changes
watch(() => (currentContent.value.type === 'devotion' && currentContent.value.verses && currentContent.value.verses[0]), async (verse) => {
  if (!verse) {
    firstVerseText.value = '';
    return;
  }  // Parse the verse reference
  const match = verse.match(/^(\d*\s*[a-zA-Z\s]+)\s*(\d+):(\d+)(?:-(\d+))?$/);
  if (!match) {
    firstVerseText.value = '';
    return;
  }
  
  let book = match[1].trim().toLowerCase().replace(/\s+/g, '');
  
  // Map common book name variations to the API format
  const bookNameMappings: Record<string, string> = {
    'psalm': 'psalms',
    'proverb': 'proverbs',
    'ecclesiastes': 'ecclesiastes',
    'songofsolomon': 'songofsolomon',
    'songs': 'songofsolomon',
    'song': 'songofsolomon',
  };
  
  if (bookNameMappings[book]) {
    book = bookNameMappings[book];
  }
  
  const chapter = match[2];
  const startVerse = match[3];
  const apiUrl = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/en-kjv/books/${book}/chapters/${chapter}/verses/${startVerse}.json`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      firstVerseText.value = '';
      return;
    }
    const data = await response.json();
    firstVerseText.value = data.text ? data.text.trim() : '';
  } catch {
    firstVerseText.value = '';
  }
}, { immediate: true });


// Removed getOriginalIndex function as it was unused

const handleGenerateContent = async () => {
  if (!topicInput.value.trim()) return;
  
  // Bible Card Generator doesn't use the same content generation flow
  if (showBibleCardGenerator.value) {
    return;
  }
  
  const newId = `content-${Date.now()}`; // Generate ID here
  const contentRef = selectedContentType.value === 'devotion' ? devotionContent : faithIntegrationContent;
  
  // Initialize with selected type and ID
  contentRef.value = { id: newId, text: '', verses: [], topic: '', type: selectedContentType.value };
  
  try {
    const result = await generateGeminiContent(topicInput.value, selectedContentType.value, locale.value);
    contentRef.value = { 
      id: newId, // Persist ID
      text: result.text, 
      verses: result.verses || [], 
      topic: topicInput.value, 
      type: selectedContentType.value 
    };
  } catch (err) {
    console.error('Error generating content in component:', err);
  }
};


const handleSaveCurrentContent = () => {
  if (currentContent.value.text) {
    if (!currentContent.value.id) {
      currentContent.value.id = `content-${Date.now()}`;
    }
    const isAlreadySaved = savedContent.value.some(
      (d) => d.id === currentContent.value.id || (d.text === currentContent.value.text && d.topic === currentContent.value.topic && d.type === currentContent.value.type)
    );
    if (!isAlreadySaved) {
      saveContent({ ...currentContent.value }); 
      showSaveConfirmation.value = true;
      setTimeout(() => {
        showSaveConfirmation.value = false;
      }, 3000);    } else {
      shareAlertMessage.value = t('messages.alreadySaved');
      showShareAlert.value = true;
       setTimeout(() => {
        showShareAlert.value = false;
      }, 3000);
    }
  }
};

const handleDeleteContent = (id?: string) => { 
  if (!id) return;

  const itemToDelete = savedContent.value.find(item => item.id === id);

  if (itemToDelete) {
    // Clear the appropriate content ref if it matches the deleted item
    if (itemToDelete.type === 'devotion' && devotionContent.value.id === itemToDelete.id) {
      devotionContent.value = { id: `content-${Date.now()}`, text: '', verses: [], topic: '', type: 'devotion' };
    } else if (itemToDelete.type === 'faithIntegration' && faithIntegrationContent.value.id === itemToDelete.id) {
      faithIntegrationContent.value = { id: `content-${Date.now()}`, text: '', verses: [], topic: '', type: 'faithIntegration' };
    }
  }
  deleteContent(id); 
};


const viewSavedContent = (content: StoredContent) => { // Renamed from viewSavedDevotion, updated type
  // Store content in the appropriate ref based on its type
  if (content.type === 'devotion') {
    devotionContent.value = { ...content };
    selectedContentType.value = 'devotion';
  } else if (content.type === 'faithIntegration') {
    faithIntegrationContent.value = { ...content };
    selectedContentType.value = 'faithIntegration';
  } else {
    // Default fallback
    devotionContent.value = { ...content };
    selectedContentType.value = 'devotion';
  }
};

const handleShareContent = async () => { // Renamed from handleShareDevotion
  if (!currentContent.value.text) return;
  const title = currentContent.value.topic 
    ? `${currentContent.value.type === 'devotion' ? t('content.shareTitle') : t('content.shareTitleIdea')}: ${currentContent.value.topic}` 
    : `${t('content.sharePrefix')} ${currentContent.value.type === 'devotion' ? t('content.sharePrefixDevotion') : t('content.sharePrefixIdea')}`;
  
  let shareText = currentContent.value.text;
  if (currentContent.value.type === 'devotion' && currentContent.value.verses && currentContent.value.verses.length > 0) {
    const versesText = currentContent.value.verses.join("\n");
    shareText += `\n\n${t('content.keyVerses')}\n${versesText}`;
  }

  if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        text: shareText,      });
      shareAlertMessage.value = t('messages.shareSuccess');
      showShareAlert.value = true;
      setTimeout(() => { showShareAlert.value = false; }, 3000);
    } catch (err) {
      if ((err as DOMException).name !== 'AbortError') {
        console.error('Error sharing, falling back to clipboard: ', err);
        await copyToClipboard(shareText, 'fallback'); 
      }
    }
  } else {
    await copyToClipboard(shareText, 'direct');
  }
};

// Helper function to copy text to clipboard
const copyToClipboard = async (text: string, context: 'fallback' | 'direct' = 'direct') => {    try {
    await navigator.clipboard.writeText(text);
    if (context === 'fallback') {
      shareAlertMessage.value = t('messages.shareFallback');
    } else {
      shareAlertMessage.value = t('messages.copySuccess');
    }
    showShareAlert.value = true;  } catch (err) {
    console.error('Failed to copy: ', err);
    shareAlertMessage.value = t('messages.copyFailed');
    showShareAlert.value = true; // Show error
  } finally {
    // Common timeout for the alert
    setTimeout(() => {
      showShareAlert.value = false;
    }, 3000);
  }
};

// Format content for display
const formattedContentForDisplay = computed(() => { // Renamed from formattedDevotionForDisplay
  if (!currentContent.value.text) return currentContent.value;
  
  let text = currentContent.value.text;
    // Enhanced text formatting for better readability
  text = formatContentText(text);

  return {
    ...currentContent.value,
    text,
    verses: currentContent.value.verses || [], // Ensure verses is an array
  };
});

// Simplified text formatting function - no complex formatting
const formatContentText = (text: string) => {
  if (!text) return '';
  
  // Clean up any existing malformed HTML fragments
  let cleanText = text
    .replace(/"text-emphasis">/g, '')
    .replace(/text-emphasis">/g, '')
    .replace(/"text-accent">/g, '')
    .replace(/text-accent">/g, '')
    .replace(/class="[^"]*">/g, '');
  
  // Split into paragraphs and wrap each in a simple paragraph tag
  const paragraphs = cleanText.split(/\n\s*\n/).filter(p => p.trim());
  
  const processedParagraphs = paragraphs.map(paragraph => {
    const trimmed = paragraph.trim();
    if (!trimmed) return '';
    
    // Replace line breaks with <br> tags within paragraphs
    const withBreaks = trimmed.replace(/\n/g, '<br>');
    
    return `<p class="devotion-paragraph">${withBreaks}</p>`;
  });
  
  // Join all paragraphs and clean up any empty ones
  let result = processedParagraphs.join('');
  result = result.replace(/<p class="devotion-paragraph">\s*<\/p>/g, '');
  
  return result;
};

// const truncateText = (text: string, length: number) => {
//   if (text.length <= length) {
//     return text;
//   }
//   return text.substring(0, length) + '...';
// };

const openSavedContentDialog = () => {
  showSavedContentDialog.value = true;
  showTaskbar.value = true;
};

// Computed properties for content type button
// const currentContentTypeIcon = computed(() => {
//   switch (contentTypeSelection.value) {
//     case 'devotion':
//       return 'bi bi-stars';
//     case 'faithIntegration':
//       return 'bi bi-lightbulb-fill';
//     case 'bibleCard':
//       return 'bi bi-card-image';
//     case 'bibleExegesis':
//       return 'bi bi-book-half';
//     default:
//       return 'bi bi-stars';
//   }
// });

// Content type menu methods
// const toggleContentTypeMenu = () => {
//   showContentTypeMenu.value = !showContentTypeMenu.value;
// };

// const closeContentTypeMenu = () => {
//   showContentTypeMenu.value = false;
// };

const selectContentType = (type: string) => {
  if (type === 'bibleCard') {
    showBibleCardGenerator.value = true;
    showBibleExegesis.value = false;
    selectedContentType.value = 'devotion'; // Default fallback
  } else if (type === 'bibleExegesis') {
    showBibleCardGenerator.value = false;
    showBibleExegesis.value = true;
    selectedContentType.value = 'devotion'; // Default fallback
  } else {
    showBibleCardGenerator.value = false;
    showBibleExegesis.value = false;
    selectedContentType.value = type as 'devotion' | 'faithIntegration';  }
  showContentTypeMenu.value = false;
};

// Close menu when clicking outside
const closeMenuOnClickOutside = (event: Event) => {
  if (showContentTypeMenu.value) {
    const target = event.target as Node;
    const button = contentTypeButtonRef.value;
    const menu = menuPanelRef.value;
    
    if (button && menu && !button.contains(target) && !menu.contains(target)) {
      showContentTypeMenu.value = false;
    }
  }
};

// Handle creating new content
// const handleCreateNew = () => {
//   // Clear content for the selected type and create fresh content
//   const newId = `content-${Date.now()}`;
//   const contentRef = selectedContentType.value === 'devotion' ? devotionContent : faithIntegrationContent;
  
//   contentRef.value = {
//     id: newId,
//     text: '',
//     verses: [],
//     topic: '',
//     type: selectedContentType.value,
//   };
  
//   // Clear the input field
//   topicInput.value = '';
//     // Close the content type menu if it's open
//   showContentTypeMenu.value = false;
//     // Focus on the input field for immediate typing
//   if (textareaRef.value && !showBibleCardGenerator.value && !showBibleExegesis.value) {
//     setTimeout(() => {
//       textareaRef.value?.focus();
//     }, 100);
//   }
// };

// Handle prompt selection from gallery
const handlePromptSelection = (text: string, type: 'devotion' | 'faithIntegration') => {
  // Set the content type first
  selectedContentType.value = type;
  showBibleCardGenerator.value = false;
  showBibleExegesis.value = false;
  
  // Set the prompt text in the input field
  topicInput.value = text;
  
  // Close prompt gallery modal
  showPromptGallery.value = false;
  
  // Focus on the input field and auto-resize
  if (textareaRef.value) {
    setTimeout(() => {
      textareaRef.value?.focus();
      autoResizeTextarea();
    }, 100);
  }
};

// Auto-resize textarea function for bottom input
const autoResizeTextarea = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = `${Math.min(textareaRef.value.scrollHeight, 200)}px`;
  }
};

// Handle keyboard events for textarea
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    if (event.ctrlKey) {
      // Ctrl+Enter: Allow new line (default behavior)
      return;
    } else {
      // Enter: Generate content
      event.preventDefault();
      if (!isLoading.value && topicInput.value.trim()) {
        handleGenerateContent();
      }
    }
  }
};

// Handle content area scroll for fade effects and auto-hide input
const handleContentScroll = () => {
  if (!contentAreaRef.value) return;
  
  const element = contentAreaRef.value;
  const scrollTop = element.scrollTop;
  const scrollHeight = element.scrollHeight;
  const clientHeight = element.clientHeight;
  const scrollBottom = scrollHeight - scrollTop - clientHeight;
  
  // Show top fade when scrolled down more than 50px
  showTopFade.value = scrollTop > 50;
  
  // Show bottom fade when there's more than 50px of content below
  showBottomFade.value = scrollBottom > 50;
    // Auto-hide bottom input area while scrolling
  // Hide input area when actively scrolling (if there's scrollable content)
  const hasScrollableContent = scrollHeight > clientHeight;
  if (hasScrollableContent && (scrollTop > 100 || scrollBottom > 100)) {
    showBottomInput.value = false;
    
    // Clear existing timeout
    if (scrollTimeout.value) {
      clearTimeout(scrollTimeout.value);
    }
    
    // Show input area again after scrolling stops (1.5 seconds of inactivity)
    scrollTimeout.value = setTimeout(() => {
      showBottomInput.value = true;
    }, 1500);
  } else if (!hasScrollableContent) {
    // Always show input area if content doesn't require scrolling
    showBottomInput.value = true;
  }

  // Auto-hide header while scrolling
  // Hide header when actively scrolling (if there's scrollable content)
  if (hasScrollableContent && scrollTop > 80) {
    showHeader.value = false;
    
    // Clear existing header timeout
    if (headerScrollTimeout.value) {
      clearTimeout(headerScrollTimeout.value);
    }
    
    // Show header again after scrolling stops (1.5 seconds of inactivity)
    headerScrollTimeout.value = setTimeout(() => {
      showHeader.value = true;
    }, 1500);
  } else if (!hasScrollableContent || scrollTop <= 80) {
    // Always show header if content doesn't require scrolling or near top
    showHeader.value = true;
  }
};

// Watch for changes in isDarkMode, update data-bs-theme attribute, and save to localStorage
watchEffect(() => {
  const theme = isDarkMode.value ? 'dark' : 'light';
  document.documentElement.setAttribute('data-bs-theme', theme);
  localStorage.setItem('theme', theme);
});

// Apply the theme when the component is mounted
// This ensures the theme is set correctly on initial load based on localStorage or default
onMounted(() => {
  // Mobile check
  checkMobile(); // Call once to set initial state for isMobile
  window.addEventListener('resize', checkMobile);

  // Theme initialization
  const theme = isDarkMode.value ? 'dark' : 'light';
  document.documentElement.setAttribute('data-bs-theme', theme);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<style>
/* Import Sidenav styles */
@import './styles/sidenav.css';
/* Import Perplexity-inspired design system */
@import './styles/perplexity.css';
/* Import existing styles for components that need them */
@import './styles/index.css';
</style>
