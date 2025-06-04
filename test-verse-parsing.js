// Simple test script to verify verse parsing logic
function parseVerseReference(verse) {
  const match = verse.match(/^(\d*\s*[a-zA-Z\s]+)\s*(\d+):(\d+)(?:-(\d+))?$/);
  if (!match) {
    return null;
  }
  
  let bookName = match[1].trim().toLowerCase().replace(/\s+/g, '');
  
  // Map common book name variations to the API format
  const bookNameMappings = {
    'psalm': 'psalms',
    'proverb': 'proverbs',
    'ecclesiastes': 'ecclesiastes',
    'songofsolomon': 'songofsolomon',
    'songs': 'songofsolomon', // Alternative name
    'song': 'songofsolomon',  // Alternative name
  };
  
  if (bookNameMappings[bookName]) {
    bookName = bookNameMappings[bookName];
  }
  
  const chapter = match[2];
  const startVerse = match[3];
  const endVerse = match[4];
  return { book: bookName, chapter, startVerse, endVerse };
}

// Test verses
const testVerses = [
  'John 3:16',
  '1 John 3:16',
  'Psalm 23:1',
  'Song of Solomon 2:1',
  'Matthew 5:3-12',
  'Romans 8:28',
  '2 Timothy 3:16',
  'Revelation 21:4'
];

console.log('Testing verse parsing:');
testVerses.forEach(verse => {
  const parsed = parseVerseReference(verse);
  console.log(`"${verse}" -> ${parsed ? JSON.stringify(parsed) : 'null'}`);
  if (parsed) {
    const apiUrl = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/en-kjv/books/${parsed.book}/chapters/${parsed.chapter}/verses/${parsed.startVerse}.json`;
    console.log(`API URL: ${apiUrl}`);
  }
  console.log('---');
});
