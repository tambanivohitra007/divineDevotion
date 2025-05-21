<template>
  <div class="devotion-display-content">
    <div class="main-devotion-text lh-lg" v-html="formattedDevotionText"></div>
    <template v-if="props.contentType === 'devotion' && props.devotion.verses && props.devotion.verses.length > 0">
      <hr class="my-4">
      <div class="verses-section">
        <h6 class="verses-section-title mb-3">
          <i class="bi bi-book-half me-2"></i>
          Bible Verses:
        </h6>
        <ul class="list-group list-group-flush">
          <li v-for="(verse, index) in props.devotion.verses" :key="index" class="list-group-item px-0 py-2">
            <a :href="getBibleGatewayLink(verse)"
               target="_blank"
               rel="noopener noreferrer"
               class="text-decoration-none verse-link list-item-verse-link"
               :data-verse-ref="verse"
               data-bs-toggle="tooltip"
               data-bs-placement="top"
               data-bs-custom-class="bible-verse-tooltip"
               :title="getTooltipTitle(verse)"
               @mouseover.once="fetchVerseText(verse)"
               @focus.once="fetchVerseText(verse)" 
            >
              <i class="bi bi-link-45deg me-1"></i>
              {{ verse }}
            </a>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch, nextTick, computed } from 'vue';

// Renamed Devotion to DisplayableContent and made verses optional
interface DisplayableContent {
  text: string;
  verses?: string[]; // Verses are optional
  topic?: string;
}

const props = defineProps<{
  devotion: DisplayableContent; // Prop name remains 'devotion' as passed from App.vue
  contentType: 'devotion' | 'faithIntegration';
}>();

const verseTooltipContents = ref<Record<string, string>>({});

declare var bootstrap: any;
const KJV_BIBLE_ID = 'en-kjv';

interface ParsedVerse {
  book: string;
  chapter: string;
  startVerse: string;
  endVerse?: string;
}

// Regex to find Bible verses in text. Handles books like "1 John", "Song of Solomon".
// Example refs: "John 3:16", "1 John 3:16-18", "Song of Solomon 2:1".
const bibleVerseGlobalRegex = /\\b(\\d*\\s*[A-Za-z]+(?:(?:\\s+)[A-Zael]+)*\\s+\\d+:\\d+(?:-\\d+)?)\\b/g;

const formattedDevotionText = computed(() => {
  const text = props.devotion.text;
  if (!text) return '';

  return text.replace(bibleVerseGlobalRegex, (matchedVerse) => {
    const parsed = parseVerseReference(matchedVerse);
    if (!parsed) {
      return matchedVerse; // If not a valid/parseable verse, return original text segment
    }
    // Ensure the link uses the exact matched string for display and data-verse-ref
    // and getTooltipTitle, as fetchVerseText will be called with this exact string.
    return `<a href="${getBibleGatewayLink(matchedVerse)}"
               target="_blank"
               rel="noopener noreferrer"
               class="text-decoration-none verse-link inline-verse-link"
               data-bs-toggle="tooltip"
               data-bs-placement="top"
               data-bs-custom-class="bible-verse-tooltip"
               title="${getTooltipTitle(matchedVerse)}"
               data-verse-ref="${matchedVerse}"
            >${matchedVerse}</a>`;
  });
});

const getBibleGatewayLink = (verse: string): string => {
  const parsed = parseVerseReference(verse);
  if (!parsed) {
    console.warn(`Could not generate Bible Gateway link for unparsable verse: ${verse}. Using placeholder link.`);
    return '#'; // Fallback for unparsable verses
  }
  // Bible Gateway URL format: https://www.biblegateway.com/passage/?search=John+3:16&version=KJV
  // The verse reference needs to be URL encoded.
  const encodedVerse = encodeURIComponent(verse);
  return `https://www.biblegateway.com/passage/?search=${encodedVerse}&version=KJV`;
};

const parseVerseReference = (verse: string): ParsedVerse | null => {
  const match = verse.match(/^(\\d*\\s*[a-zA-Z\\s]+)\\s*(\\d+):(\\d+)(?:-(\\d+))?$/);
  if (!match) {
    // Do not warn here for inline parsing, as regex might pick up partials.
    // The check in formattedDevotionText handles returning original text.
    return null;
  }
  const bookName = match[1].trim().toLowerCase().replace(/\\s+/g, '');
  const chapter = match[2];
  const startVerse = match[3];
  const endVerse = match[4];
  return { book: bookName, chapter, startVerse, endVerse };
};

const fetchVerseText = async (verseRef: string) => {
  if (verseTooltipContents.value[verseRef] && verseTooltipContents.value[verseRef] !== 'Loading...') {
    return;
  }
  if (verseTooltipContents.value[verseRef] === 'Loading...') return;

  verseTooltipContents.value[verseRef] = 'Loading...';
  updateTooltipContent(verseRef, 'Loading...');

  const parsed = parseVerseReference(verseRef);
  if (!parsed) {
    const errMsg = 'Invalid verse format.';
    verseTooltipContents.value[verseRef] = errMsg;
    updateTooltipContent(verseRef, errMsg);
    console.warn(`Could not parse verse reference for fetch: ${verseRef}`);
    return;
  }

  const { book, chapter, startVerse } = parsed;
  const apiUrl = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/${KJV_BIBLE_ID}/books/${book}/chapters/${chapter}/verses/${startVerse}.json`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      let errorMsg = `Error ${response.status}`;
      if (response.status === 404) {
        errorMsg = `Verse not found (${book} ${chapter}:${startVerse}).`;
      } else {
        try { const errorData = await response.json(); errorMsg = errorData.message || errorData.error || `API Error: ${response.status}`; } catch (e) { /* ignore */ }
      }
      throw new Error(errorMsg);
    }
    const data = await response.json();
    if (data && data.text) {
      const fetchedText = data.text.trim();
      verseTooltipContents.value[verseRef] = fetchedText;
      updateTooltipContent(verseRef, fetchedText);
    } else {
      const notFoundMsg = `Verse text not available for ${book} ${chapter}:${startVerse}.`;
      verseTooltipContents.value[verseRef] = notFoundMsg;
      updateTooltipContent(verseRef, notFoundMsg);
    }
  } catch (error: any) {
    console.error(`Error fetching verse "${verseRef}" (parsed as ${book} ${chapter}:${startVerse}):`, error);
    const errorLoadingMsg = error.message || 'Could not load verse.';
    verseTooltipContents.value[verseRef] = errorLoadingMsg;
    updateTooltipContent(verseRef, errorLoadingMsg);
  }
};

const getTooltipTitle = (verse: string): string => {
  return verseTooltipContents.value[verse] || 'Hover to load verse text (KJV)';
};

const initializeOrUpdateTooltipsAndListeners = async () => {
  await nextTick();
  const tooltipElements = document.querySelectorAll<HTMLElement>('a.verse-link[data-bs-toggle="tooltip"]');
  
  tooltipElements.forEach(el => {
    if (window.bootstrap) {
      const existingTooltip = window.bootstrap.Tooltip.getInstance(el);
      if (existingTooltip) {
        existingTooltip.dispose();
      }
      new window.bootstrap.Tooltip(el);
    } else {
      console.warn('Bootstrap object not found. Tooltips may not work.');
    }

    // Attach listeners for inline verse links (those not handled by Vue's @event bindings)
    if (el.classList.contains('inline-verse-link')) {
      const verseRef = el.dataset.verseRef;
      if (verseRef) {
        // Simple way to avoid multiple listeners if function is called again on same elements.
        // fetchVerseText itself has "once" logic based on content.
        if (!(el as any).__hasVerseListenersAttached) {
          const eventHandler = () => fetchVerseText(verseRef);
          el.addEventListener('mouseover', eventHandler);
          el.addEventListener('focus', eventHandler);
          (el as any).__hasVerseListenersAttached = true;
        }
      }
    }
  });
};

const updateTooltipContent = async (verseRef: string, newContent: string) => {
  await nextTick();
  // Query for all links (list items and inline) that match the specific verseRef
  document.querySelectorAll<HTMLElement>(`a.verse-link[data-verse-ref="${verseRef}"]`).forEach(el => {
    el.setAttribute('title', newContent); // Update the title attribute
    if (window.bootstrap) {
      const tooltipInstance = window.bootstrap.Tooltip.getInstance(el);
      if (tooltipInstance) {
        // If Bootstrap tooltip is initialized and possibly visible, tell it to update its content.
        tooltipInstance.setContent({ '.tooltip-inner': newContent });
      }
    }
  });
};

watch(() => props.devotion, async () => {
  // When devotion data changes (text or verses list), re-initialize tooltips and listeners.
  // verseTooltipContents.value = {}; // Optionally clear cache if all verses change.
  await initializeOrUpdateTooltipsAndListeners();
}, { deep: true, immediate: true }); // immediate: true ensures it runs on initial mount

</script>

<style scoped>
.devotion-display {
  border: none; 
}
.main-devotion-text { /* Was .card-text */
  white-space: pre-wrap;
  font-size: 1.1rem;
}
.list-group-item {
  background-color: transparent;
  border: none;
}
.list-group-item a,
:deep(.inline-verse-link) { /* Apply styles to inline links via :deep */
  transition: color 0.15s ease-in-out;
}
.list-group-item a:hover,
:deep(.inline-verse-link:hover) {
  text-decoration: underline;
}
</style>
