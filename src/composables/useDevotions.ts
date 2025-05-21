// src/composables/useDevotions.ts
import { ref, onMounted } from 'vue';

interface Devotion {
  text: string;
  verses: string[];
  topic?: string;
}

const SAVED_DEVOTIONS_KEY = 'savedDevotions';

export default function useDevotions() {
  const savedDevotions = ref<Devotion[]>([]);

  const loadDevotions = () => {
    const storedDevotions = localStorage.getItem(SAVED_DEVOTIONS_KEY);
    if (storedDevotions) {
      try {
        savedDevotions.value = JSON.parse(storedDevotions);
      } catch (e) {
        console.error("Failed to parse saved devotions from localStorage:", e);
        savedDevotions.value = []; // Reset if parsing fails
      }
    }
  };

  const saveDevotion = (devotion: Devotion) => {
    // Avoid saving duplicates if necessary, or decide how to handle them
    // For simplicity, this adds any new save, even if similar content exists
    const newSavedDevotions = [...savedDevotions.value, devotion];
    localStorage.setItem(SAVED_DEVOTIONS_KEY, JSON.stringify(newSavedDevotions));
    savedDevotions.value = newSavedDevotions;
  };

  const deleteDevotion = (index: number) => {
    const newSavedDevotions = savedDevotions.value.filter((_, i) => i !== index);
    localStorage.setItem(SAVED_DEVOTIONS_KEY, JSON.stringify(newSavedDevotions));
    savedDevotions.value = newSavedDevotions;
  };

  // Load saved devotions when the composable is first used
  onMounted(() => {
    loadDevotions();
  });

  return {
    savedDevotions,
    saveDevotion,
    loadDevotions,
    deleteDevotion,
  };
}
