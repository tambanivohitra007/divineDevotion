<template>
  <div class="verse-debugger p-4 border rounded mb-4">
    <h5>Verse Parsing Debugger</h5>
    
    <div class="mb-3">
      <label for="testVerse" class="form-label">Test Verse Reference:</label>
      <input 
        id="testVerse"
        v-model="testVerse" 
        type="text" 
        class="form-control"
        placeholder="e.g., John 3:16, 1 John 3:16-18, Psalm 23:1"
      />
    </div>
    
    <div class="mb-3">
      <button @click="testParsing" class="btn btn-primary me-2">Test Parsing</button>
      <button @click="testWithSampleVerses" class="btn btn-secondary">Test Sample Verses</button>
    </div>
    
    <div v-if="results.length > 0" class="results">
      <h6>Results:</h6>
      <div v-for="(result, index) in results" :key="index" class="mb-2 p-2 border rounded">
        <strong>Input:</strong> {{ result.input }}<br>
        <strong>Parsed:</strong> {{ result.parsed ? JSON.stringify(result.parsed) : 'null' }}<br>
        <strong>Book API Name:</strong> {{ result.parsed?.book || 'N/A' }}<br>
        <strong>Bible Gateway Link:</strong> <a :href="result.bibleGatewayLink" target="_blank">{{ result.bibleGatewayLink }}</a><br>
        <strong>API URL:</strong> {{ result.apiUrl }}<br>
        <strong>API Result:</strong> {{ result.apiResult }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const testVerse = ref('John 3:16');
const results = ref<any[]>([]);

interface ParsedVerse {
  book: string;
  chapter: string;
  startVerse: string;
  endVerse?: string;
}

const parseVerseReference = (verse: string): ParsedVerse | null => {
  const match = verse.match(/^(\d*\s*[a-zA-Z\s]+)\s*(\d+):(\d+)(?:-(\d+))?$/);
  if (!match) {
    return null;
  }
  const bookName = match[1].trim().toLowerCase().replace(/\s+/g, '');
  const chapter = match[2];
  const startVerse = match[3];
  const endVerse = match[4];
  return { book: bookName, chapter, startVerse, endVerse };
};

const getBibleGatewayLink = (verse: string): string => {
  const encodedVerse = encodeURIComponent(verse);
  return `https://www.biblegateway.com/passage/?search=${encodedVerse}&version=KJV`;
};

const testApiCall = async (parsed: ParsedVerse): Promise<string> => {
  const { book, chapter, startVerse } = parsed;
  const apiUrl = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/en-kjv/books/${book}/chapters/${chapter}/verses/${startVerse}.json`;
  
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return `HTTP ${response.status}: ${response.statusText}`;
    }
    const data = await response.json();
    return data.text ? `Success: "${data.text.substring(0, 50)}..."` : 'No text found';
  } catch (error: any) {
    return `Error: ${error.message}`;
  }
};

const testParsing = async () => {
  if (!testVerse.value.trim()) return;
  
  const parsed = parseVerseReference(testVerse.value);
  const bibleGatewayLink = getBibleGatewayLink(testVerse.value);
  
  let apiUrl = 'N/A';
  let apiResult = 'N/A';
  
  if (parsed) {
    const { book, chapter, startVerse } = parsed;
    apiUrl = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/en-kjv/books/${book}/chapters/${chapter}/verses/${startVerse}.json`;
    apiResult = await testApiCall(parsed);
  }
  
  results.value.unshift({
    input: testVerse.value,
    parsed,
    bibleGatewayLink,
    apiUrl,
    apiResult
  });
};

const testWithSampleVerses = async () => {
  const sampleVerses = [
    'John 3:16',
    '1 John 3:16',
    'Psalm 23:1',
    'Song of Solomon 2:1',
    'Matthew 5:3-12',
    'Romans 8:28',
    '2 Timothy 3:16',
    'Revelation 21:4'
  ];
  
  for (const verse of sampleVerses) {
    testVerse.value = verse;
    await testParsing();
  }
};
</script>

<style scoped>
.verse-debugger {
  background-color: #f8f9fa;
}
.results {
  max-height: 400px;
  overflow-y: auto;
}
</style>
