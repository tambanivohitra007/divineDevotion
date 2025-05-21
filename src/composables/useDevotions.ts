// src/composables/useDevotions.ts
import { ref, onMounted } from 'vue';

// Renamed from Devotion to StoredContent and added a type field
export interface StoredContent {
  text: string;
  verses: string[];
  topic?: string;
  type: 'devotion' | 'faithIntegration'; // Added content type
  id?: string; // Optional: for unique identification, e.g., timestamp or UUID
}

const SAVED_CONTENT_KEY = 'savedContent'; // Renamed key

export default function useContentStorage() { // Renamed composable
  const savedContent = ref<StoredContent[]>([]); // Renamed ref

  const loadContent = () => { // Renamed function
    const storedContent = localStorage.getItem(SAVED_CONTENT_KEY);
    if (storedContent) {
      try {
        savedContent.value = JSON.parse(storedContent);
      } catch (e) {
        console.error("Failed to parse saved content from localStorage:", e);
        savedContent.value = []; // Reset if parsing fails
      }
    }
  };

  const saveContent = (contentItem: StoredContent) => { // Renamed function
    // Add a unique ID if not present (e.g., timestamp)
    if (!contentItem.id) {
      contentItem.id = `content-${Date.now()}`;
    }
    const newSavedContent = [...savedContent.value, contentItem];
    localStorage.setItem(SAVED_CONTENT_KEY, JSON.stringify(newSavedContent));
    savedContent.value = newSavedContent;
  };

  const deleteContent = (id: string) => { // Updated to delete by ID
    const newSavedContent = savedContent.value.filter(item => item.id !== id);
    localStorage.setItem(SAVED_CONTENT_KEY, JSON.stringify(newSavedContent));
    savedContent.value = newSavedContent;
  };

  // Load saved content when the composable is first used
  onMounted(() => {
    loadContent();
  });

  return {
    savedContent, // Export renamed ref
    saveContent,    // Export renamed function
    loadContent,    // Export renamed function
    deleteContent,  // Export renamed function
  };
}
