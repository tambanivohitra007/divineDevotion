<template>
  <div class="bible-card-demo">
    <h3>BibleCard Component Demo</h3>
    <p class="text-muted mb-4">Test the BibleCard component with sample verses</p>
    
    <div class="demo-verses">
      <div v-for="(demo, index) in demoVerses" :key="index" class="demo-verse-item mb-4">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <strong>{{ demo.verse }}</strong>
            <p class="text-muted mb-0">{{ demo.text }}</p>
          </div>
          <button 
            @click="toggleCard(demo.verse)" 
            class="btn btn-outline-primary btn-sm"
          >
            <i class="bi bi-image me-1"></i>
            {{ activeCard === demo.verse ? 'Hide' : 'Card' }}
          </button>
        </div>
        
        <BibleCard 
          v-if="activeCard === demo.verse"
          :verse="demo.verse"
          :verse-text="demo.text"
          @card-generated="onCardGenerated"
          @card-shared="onCardShared"
          class="mt-3"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BibleCard from './BibleCard.vue';

interface DemoVerse {
  verse: string;
  text: string;
}

const activeCard = ref<string | null>(null);

const demoVerses: DemoVerse[] = [
  {
    verse: "John 3:16",
    text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."
  },
  {
    verse: "Psalm 23:1",
    text: "The Lord is my shepherd; I shall not want."
  },
  {
    verse: "Philippians 4:13",
    text: "I can do all things through Christ which strengtheneth me."
  },
  {
    verse: "Isaiah 40:31",
    text: "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint."
  }
];

const toggleCard = (verse: string) => {
  if (activeCard.value === verse) {
    activeCard.value = null;
  } else {
    activeCard.value = verse;
  }
};

const onCardGenerated = (cardData: any) => {
  console.log('Demo: Card generated for verse', cardData);
};

const onCardShared = (success: boolean) => {
  console.log('Demo: Card shared', success ? 'successfully' : 'failed');
};
</script>

<style scoped>
.bible-card-demo {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: var(--glass-bg);
  border-radius: 15px;
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(10px);
}

.demo-verse-item {
  padding: 1rem;
  background: var(--surface-secondary);
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.demo-verse-item strong {
  color: var(--divine-primary);
}
</style>
