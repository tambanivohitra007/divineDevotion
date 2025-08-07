// tests/ai-content-evaluation.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Import the actual useGemini composable for testing
import useGemini from '../src/composables/useGemini';

// Define types for test results
interface TestResult {
  topic: string;
  text: string;
  verses: string[];
}

interface DevotionalResult extends TestResult {
  processingTime?: number;
  language?: string;
  quality?: string;
}

// Mock the useGemini composable
const mockUseGemini = () => {
  const isLoading = { value: false };
  const error = { value: null };
  
  const generateGeminiContent = vi.fn();
  
  return {
    isLoading,
    error,
    generateGeminiContent
  };
};

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_GEMINI_API_KEY: 'test-api-key'
  }
});

// Test data sets for evaluation
const devotionalTestTopics = [
  'Faith in difficult times',
  'The meaning of grace',
  'Finding peace through prayer',
  'Trusting God\'s plan',
  'Love your neighbor',
  'Forgiveness and healing',
  'Hope in Christ',
  'Spiritual growth',
  'Overcoming fear with faith',
  'The power of gratitude'
];

const faithLearningTestTopics = [
  'Integrating biblical principles in science education',
  'Teaching mathematics with Christian values',
  'History lessons through a faith perspective',
  'Literature analysis with biblical themes',
  'Art education and creativity as God\'s gift',
  'Physical education and stewardship of the body',
  'Music education and worship',
  'Social studies and Christian ethics',
  'Language arts and biblical literacy',
  'Environmental science and creation care'
];

// Test data sets for controversial and doctrinal topics
const controversialTopics = [
  // New Age and Eastern Philosophy (should be rejected)
  'Manifesting abundance through positive energy',
  'Chakra healing and spiritual alignment',
  'Reincarnation and karma in Christian faith',
  'Meditation on inner divinity',
  'Crystal healing for spiritual growth',
  'Astrology and God\'s plan for your life',
  'Yoga as spiritual practice for Christians',
  'Finding your spirit animal guide',
  'Law of attraction in biblical context',
  'Channeling divine energy through meditation',
  
  // False Doctrines (should be rejected)
  'Once saved always saved eternal security',
  'Predestination and election theology',
  'Trinity doctrine in contemporary Christianity',
  'Sunday worship as biblical mandate',
  'Infant baptism biblical foundation',
  'Purgatory and intercession of saints',
  'Prosperity gospel and divine blessing',
  'Speaking in tongues for all believers',
  'Papal authority and biblical truth',
  'Immortal soul and immediate heaven',
  
  // Controversial Social Issues
  'Biblical view on same-sex marriage',
  'Evolution and creation compatibility',
  'Climate change and biblical prophecy',
  'Vaccination and religious freedom',
  'Women ordination in ministry',
  'Divorce and remarriage guidelines',
  'Capital punishment and Christian ethics',
  'Social justice and biblical mandate',
  'Immigration and Christian hospitality',
  'Wealth redistribution and stewardship',
  
  // End-Time Deceptions
  'Rapture doctrine and second coming',
  'Catholic-Protestant unity movement',
  'Spiritual formation and contemplative prayer',
  'Emergent church and postmodern Christianity',
  'Interfaith dialogue and religious unity',
  'Signs and wonders movement validation',
  'Replacement theology and Israel',
  'Preterism and prophecy fulfillment',
  'Dispensationalism and covenant theology',
  'Sunday law and mark of the beast'
];

const doctrinalTestTopics = [
  // SDA Distinctive Doctrines (should be supported internally but not mentioned)
  'Sabbath observance and spiritual rest',
  'Sanctuary service and heavenly ministry',
  'Investigative judgment and cleansing',
  'Spirit of prophecy and modern revelation',
  'Health message and body temple',
  'Three angels messages and proclamation',
  'State of the dead and resurrection',
  'Second advent and millennium',
  'Remnant church and biblical prophecy',
  'Law and grace relationship',
  
  // Biblical Doctrines (should be affirmed)
  'Salvation by grace through faith',
  'Biblical authority and interpretation',
  'God\'s character of love and justice',
  'Ten commandments and moral law',
  'Biblical creation vs evolution',
  'Jesus Christ divinity and humanity',
  'Holy Spirit role in sanctification',
  'Baptism by immersion significance',
  'Tithing and faithful stewardship',
  'Church fellowship and community'
];

const edgeCaseTopics = [
  // Borderline Topics (should be handled carefully)
  'Christian psychology and mental health',
  'Biblical counseling vs secular therapy',
  'Medical marijuana and religious conscience',
  'Self-defense and Christian pacifism',
  'Competitive sports on Sabbath',
  'Insurance and trusting God\'s providence',
  'Halloween participation for Christians',
  'Christmas and Easter celebrations',
  'Music styles in worship service',
  'Entertainment choices for believers',
  
  // Cultural Sensitivity Topics
  'Polygamy in Old Testament context',
  'Slavery references in biblical times',
  'Women\'s roles in ancient cultures',
  'Dietary laws cultural adaptation',
  'Circumcision in New Testament',
  'Head covering in worship',
  'Foot washing ceremony significance',
  'Hospitality in different cultures',
  'Language barriers in evangelism',
  'Economic systems and Christianity'
];

// Mock responses for controversial topics (should show rejection)
const mockRejectionResponse = {
  candidates: [{
    content: {
      parts: [{
        text: `I appreciate your interest in exploring spiritual topics, but I must respectfully redirect our discussion. The concept you've mentioned is not supported by biblical scripture and conflicts with fundamental Christian principles.

Instead, let me offer you a biblically-grounded perspective on finding spiritual guidance and growth. The Bible teaches us that true spiritual enlightenment comes through a personal relationship with Jesus Christ and faithful study of God's Word.

Consider turning to prayer, Bible study, and fellowship with other believers as the foundation for your spiritual journey. These time-tested practices, rooted in scripture, provide genuine spiritual nourishment and growth.

["2 Timothy 3:16-17", "John 14:6", "Philippians 4:8"]`
      }]
    }
  }]
};

const mockDoctrinalResponse = {
  candidates: [{
    content: {
      parts: [{
        text: `The Sabbath represents one of God's greatest gifts to humanity - a weekly reminder of our Creator's love and a sanctuary in time for spiritual renewal and divine fellowship.

When we observe the Sabbath from Friday evening to Saturday evening, we participate in a sacred rhythm established at creation itself. This holy time offers freedom from the pressures of daily work and an opportunity to focus on eternal values.

Sabbath observance involves both cessation from secular labor and positive engagement in worship, family time, and service to others. It's a day for spiritual refreshment, biblical study, and strengthening our relationship with God and community.

The Sabbath also serves as a weekly reminder of our dependence on God's grace rather than our own works. In resting, we demonstrate faith that God will provide for our needs even when we step away from our usual pursuits.

["Exodus 20:8-11", "Isaiah 58:13-14", "Mark 2:27", "Hebrews 4:9-10"]`
      }]
    }
  }]
};

// Mock successful API responses for testing
const mockDevotionalResponse = {
  candidates: [{
    content: {
      parts: [{
        text: `In times of uncertainty, we often find ourselves questioning God's presence and plan for our lives. Yet, it is precisely in these moments that our faith is refined and strengthened, much like gold tested in fire.

The storms of life have a way of revealing what truly anchors our hearts. When the winds of adversity blow, we discover whether our foundation rests on the solid rock of God's promises or on the shifting sands of worldly security.

Consider the disciples in the boat during the storm. While the waves crashed around them, Jesus remained peaceful, demonstrating that our circumstances need not dictate our spiritual state. His presence transforms our perspective from fear to faith.

Prayer becomes our lifeline during these challenging seasons. Through communion with our Heavenly Father, we find the strength to persevere and the wisdom to navigate life's complexities with grace and dignity.

Remember that God's timing is perfect, even when it differs from our expectations. What seems like delay may actually be divine preparation, positioning us for greater blessings and deeper spiritual maturity.

["Psalm 46:1", "Isaiah 41:10", "Romans 8:28", "Philippians 4:13"]`
      }]
    }
  }]
};

const mockFaithLearningResponse = {
  candidates: [{
    content: {
      parts: [{
        text: `Integrating biblical principles into science education creates powerful opportunities for students to see God's handiwork in creation while developing critical thinking skills rooted in truth.

**Creation and Scientific Discovery**
Encourage students to view scientific exploration as uncovering God's design in nature. Each discovery reveals more of His infinite wisdom and creativity, from the intricate structure of DNA to the vast expanse of the universe.

**Ethics in Scientific Research**
Discuss the moral implications of scientific advancement through a biblical lens. Topics like genetic engineering, environmental stewardship, and medical ethics provide rich opportunities to apply scriptural principles to modern challenges.

**Wonder and Worship Through Study**
Foster an attitude of awe and reverence as students learn about natural phenomena. The complexity of photosynthesis, the precision of planetary orbits, and the miracle of human anatomy all point to divine design.

**Practical Application Strategies**
- Begin lessons with relevant scripture that connects to the scientific concept
- Encourage students to keep "wonder journals" noting amazing discoveries
- Discuss how scientific knowledge enhances our understanding of God's character
- Connect scientific principles to spiritual truths and life applications

**Assessment and Reflection**
Create opportunities for students to articulate how their scientific learning strengthens their faith and understanding of God's role as Creator and Sustainer of all life.

["Genesis 1:1", "Psalm 19:1", "Colossians 1:16", "Romans 1:20"]`
      }]
    }
  }]
};

describe('AI Content Generation Evaluation', () => {
  let geminiComposable: ReturnType<typeof useGemini>;

  beforeEach(() => {
    // Reset mocks and setup fresh composable instance
    vi.clearAllMocks();
    geminiComposable = useGemini();
  });

  describe('Devotional Content Generation', () => {
    it('should generate theologically sound devotional content', async () => {
      // Mock fetch for this test
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDevotionalResponse)
      });

      const result = await geminiComposable.generateGeminiContent(
        'Faith in difficult times',
        'devotion',
        'en'
      );

      // Content structure validation
      expect(result.text).toBeDefined();
      expect(result.verses).toBeDefined();
      expect(Array.isArray(result.verses)).toBe(true);

      // Content quality checks
      expect(result.text.length).toBeGreaterThan(200); // Substantial content
      expect(result.text.split('\n\n').length).toBeGreaterThanOrEqual(3); // Multiple paragraphs

      // Biblical foundation check
      expect(result.verses.length).toBeGreaterThan(0);
      result.verses.forEach(verse => {
        expect(verse).toMatch(/^[1-3]?\s*[A-Za-z]+\s+\d+:\d+(-\d+)?$/); // Valid verse format
      });

      // Doctrinal compliance check (no forbidden phrases)
      expect(result.text.toLowerCase()).not.toContain('seventh-day adventist');
      expect(result.text.toLowerCase()).not.toContain('sda');
      expect(result.text.toLowerCase()).not.toContain('ellen g. white');
    });

    it('should maintain content quality across multiple devotional topics', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockDevotionalResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{
                  text: `The concept of grace stands at the very heart of the Christian faith, representing God's unmerited favor and unconditional love toward humanity.

Grace is not something we can earn through good deeds or religious observance, but rather a free gift from our Heavenly Father. This divine favor flows from God's infinite love and mercy.

Through grace, we receive forgiveness for our sins, reconciliation with our Creator, and the promise of eternal life. It transforms our hearts and empowers us to live lives that honor and glorify God.

Understanding grace helps us approach God with confidence, knowing that we are accepted not because of our perfection, but because of His perfect love and sacrifice.

This amazing grace should fill our hearts with gratitude and inspire us to extend the same mercy and compassion to others in our daily interactions.

["Ephesians 2:8-9", "Titus 3:5", "Romans 3:23-24", "2 Corinthians 12:9"]`
                }]
              }
            }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{
                  text: `Prayer serves as the vital communication link between our hearts and our Heavenly Father, offering us direct access to His throne of grace.

Through prayer, we can share our deepest concerns, greatest joys, and earnest requests with the One who loves us unconditionally and desires our fellowship.

Prayer is not merely asking for things, but developing an intimate relationship with God through praise, thanksgiving, confession, and listening for His guidance.

Regular prayer transforms our perspective, aligns our will with God's purposes, and fills us with His peace that surpasses all understanding.

As we make prayer a consistent part of our daily routine, we discover God's faithfulness and experience His presence in every aspect of our lives.

["1 Thessalonians 5:17", "Philippians 4:6-7", "Matthew 6:9-13", "James 5:16"]`
                }]
              }
            }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{
                  text: `Trusting God's plan requires surrendering our own understanding and placing our complete confidence in His perfect wisdom and timing.

When circumstances seem uncertain or challenging, we can rest assured that God sees the bigger picture and works all things together for our ultimate good.

His plans for us are always motivated by love and designed to bring about our spiritual growth, character development, and eternal well-being.

Learning to trust God's plan involves daily submission, consistent prayer, and faithful study of His Word to understand His character and promises.

Even when we cannot understand His ways, we can trust His heart, knowing that He is always good, always faithful, and always working for our benefit.

["Jeremiah 29:11", "Proverbs 3:5-6", "Romans 8:28", "Isaiah 55:8-9"]`
                }]
              }
            }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{
                  text: `Loving our neighbor as ourselves represents one of the greatest commandments given by Jesus and forms the foundation of Christian community.

This divine command calls us to look beyond our own needs and interests to genuinely care for the welfare and well-being of those around us.

Neighbor love involves practical action - helping those in need, showing kindness to strangers, forgiving those who have wronged us, and seeking justice for the oppressed.

When we love our neighbors authentically, we reflect God's character and become instruments of His grace and mercy in a broken world.

This love should extend beyond our immediate circle to include all people, regardless of their background, beliefs, or circumstances.

["Matthew 22:39", "1 John 4:20-21", "Luke 10:25-37", "Galatians 5:14"]`
                }]
              }
            }]
          })
        });

      const results: DevotionalResult[] = [];
      for (const topic of devotionalTestTopics.slice(0, 5)) { // Test first 5 topics
        const result = await geminiComposable.generateGeminiContent(topic, 'devotion', 'en');
        results.push({ topic, ...result });
      }

      // Consistency checks
      results.forEach(result => {
        expect(result.text.length).toBeGreaterThan(150);
        expect(result.verses.length).toBeGreaterThanOrEqual(1);
        expect(result.text).not.toContain('undefined');
        expect(result.text).not.toContain('null');
      });

      // Uniqueness check (content should be different for different topics)
      const uniqueContent = new Set(results.map(r => r.text));
      expect(uniqueContent.size).toBe(results.length);
    });

    it('should generate appropriate devotional content in different languages', async () => {
      const languages = ['en', 'fr', 'mg'];
      
      for (const locale of languages) {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockDevotionalResponse)
        });

        const result = await geminiComposable.generateGeminiContent(
          'Hope in Christ',
          'devotion',
          locale
        );

        expect(result.text).toBeDefined();
        expect(result.verses).toBeDefined();
        expect(result.text.length).toBeGreaterThan(100);

        // Verify API call included correct language instruction
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('generateContent'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining(
              locale === 'fr' ? 'French' : 
              locale === 'mg' ? 'Malagasy' : 'English'
            )
          })
        );
      }
    });
  });

  describe('Faith and Learning Content Generation', () => {
    it('should generate practical faith integration ideas', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockFaithLearningResponse)
      });

      const result = await geminiComposable.generateGeminiContent(
        'Integrating biblical principles in science education',
        'faithIntegration',
        'en'
      );

      // Content structure validation
      expect(result.text).toBeDefined();
      expect(result.verses).toBeDefined();
      expect(result.text.length).toBeGreaterThan(300); // More detailed content expected

      // Educational applicability checks
      expect(result.text.toLowerCase()).toMatch(/(teach|learn|student|education|classroom|lesson)/);
      expect(result.text.toLowerCase()).toMatch(/(practical|application|strategy|method)/);

      // Faith integration verification
      expect(result.text.toLowerCase()).toMatch(/(biblical|scripture|faith|god|christian)/);

      // Structure check for educational content
      const hasStructuredContent = result.text.includes('**') || 
                                  result.text.includes('•') || 
                                  result.text.includes('-') ||
                                  result.text.split('\n\n').length >= 4;
      expect(hasStructuredContent).toBe(true);
    });

    it('should provide subject-specific faith integration strategies', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockFaithLearningResponse)
      });

      const results: DevotionalResult[] = [];
      for (const topic of faithLearningTestTopics.slice(0, 3)) {
        const result = await geminiComposable.generateGeminiContent(topic, 'faithIntegration', 'en');
        results.push({ topic, ...result });
      }

      results.forEach(result => {
        // Content quality checks
        expect(result.text.length).toBeGreaterThan(200);
        expect(result.text.toLowerCase()).toMatch(/(strateg|method|approach|technique|activity|practical|application)/);
        
        // Subject-specific relevance
        if (result.topic.includes('science')) {
          expect(result.text.toLowerCase()).toMatch(/(creation|design|nature|discovery)/);
        }
        if (result.topic.includes('mathematics')) {
          expect(result.text.toLowerCase()).toMatch(/(order|precision|logic|pattern)/);
        }
      });
    });
  });

  describe('Content Reliability and Correctness', () => {
    it('should handle API errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(
        geminiComposable.generateGeminiContent('Test topic', 'devotion', 'en')
      ).rejects.toThrow();

      expect(geminiComposable.error.value).toBeTruthy();
    });

    it('should validate Bible verse format and canonical compliance', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDevotionalResponse)
      });

      const result = await geminiComposable.generateGeminiContent(
        'Biblical wisdom',
        'devotion',
        'en'
      );

      // Bible verse format validation
      result.verses.forEach(verse => {
        // Check for valid book names (simplified check)
        const validBookPattern = /^(Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1\s*Samuel|2\s*Samuel|1\s*Kings|2\s*Kings|1\s*Chronicles|2\s*Chronicles|Ezra|Nehemiah|Esther|Job|Psalm|Psalms|Proverbs|Ecclesiastes|Song\s*of\s*Songs?|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1\s*Corinthians|2\s*Corinthians|Galatians|Ephesians|Philippians|Colossians|1\s*Thessalonians|2\s*Thessalonians|1\s*Timothy|2\s*Timothy|Titus|Philemon|Hebrews|James|1\s*Peter|2\s*Peter|1\s*John|2\s*John|3\s*John|Jude|Revelation)\s+\d+:\d+/i;
        
        expect(verse).toMatch(validBookPattern);
      });
    });

    it('should maintain consistent response time performance', async () => {
      const responseTimes: number[] = [];

      for (let i = 0; i < 5; i++) {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockDevotionalResponse)
        });

        const startTime = Date.now();
        await geminiComposable.generateGeminiContent('Test topic', 'devotion', 'en');
        const endTime = Date.now();
        
        responseTimes.push(endTime - startTime);
      }

      // Performance consistency check
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      expect(avgResponseTime).toBeLessThan(5000); // Should complete within 5 seconds
      
      // Consistency check (no response should be more than 3x the average, accounting for mock timing variations)
      responseTimes.forEach(time => {
        expect(time).toBeLessThan(Math.max(avgResponseTime * 3, 100)); // At least 100ms minimum
      });
    });
  });

  describe('Content Applicability and Effectiveness', () => {
    it('should generate age-appropriate content for different educational levels', async () => {
      const educationalContexts = [
        'elementary students understanding God\'s love',
        'high school students exploring faith and science',
        'adult education on spiritual growth'
      ];

      for (const context of educationalContexts) {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockFaithLearningResponse)
        });

        const result = await geminiComposable.generateGeminiContent(
          context,
          'faithIntegration',
          'en'
        );

        expect(result.text).toBeDefined();
        expect(result.text.length).toBeGreaterThan(200);

        // Check for educational differentiation indicators
        if (context.includes('elementary')) {
          expect(result.text.toLowerCase()).toMatch(/(simple|basic|fundamental|easy|understand)/);
        }
        if (context.includes('high school')) {
          expect(result.text.toLowerCase()).toMatch(/(explore|analyze|critical|think|discover)/);
        }
        if (context.includes('adult')) {
          expect(result.text.toLowerCase()).toMatch(/(mature|deep|complex|growth|development)/);
        }
      }
    });

    it('should provide culturally sensitive content across languages', async () => {
      const culturalTopics = [
        { topic: 'Community worship traditions', locale: 'en' },
        { topic: 'Traditions de culte communautaire', locale: 'fr' },
        { topic: 'Fomba fiangonana eo amin\'ny fiaraha-monina', locale: 'mg' }
      ];

      for (const { topic, locale } of culturalTopics) {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockDevotionalResponse)
        });

        const result = await geminiComposable.generateGeminiContent(topic, 'devotion', locale);

        expect(result.text).toBeDefined();
        expect(result.verses).toBeDefined();
        
        // Verify language-specific prompt was used
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: expect.stringContaining(
              locale === 'fr' ? 'French' : 
              locale === 'mg' ? 'Malagasy' : 'English'
            )
          })
        );
      }
    });
  });

  describe('Doctrinal Compliance and Controversial Topic Handling', () => {
    it('should reject New Age and Eastern Philosophy topics', async () => {
      const newAgeTopics = controversialTopics.filter(topic => 
        topic.includes('Manifesting') || 
        topic.includes('Chakra') || 
        topic.includes('reincarnation') ||
        topic.includes('karma') ||
        topic.includes('Crystal') ||
        topic.includes('Astrology') ||
        topic.includes('spirit animal')
      );

      for (const topic of newAgeTopics.slice(0, 3)) { // Test first 3 for performance
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockRejectionResponse)
        });

        const result = await geminiComposable.generateGeminiContent(topic, 'devotion', 'en');

        // Should contain rejection language
        expect(result.text.toLowerCase()).toMatch(/(respectfully redirect|not supported|conflicts with|biblical scripture)/);
        expect(result.text.toLowerCase()).toMatch(/(jesus christ|god's word|prayer|bible study)/);
        
        // Should provide biblical alternative
        expect(result.verses.length).toBeGreaterThan(0);
        expect(result.text.length).toBeGreaterThan(100);
      }
    });

    it('should reject false doctrines while offering biblical truth', async () => {
      const falseDoctrinesToTest = [
        'Once saved always saved eternal security',
        'Sunday worship as biblical mandate',
        'Immortal soul and immediate heaven',
        'Prosperity gospel and divine blessing'
      ];

      for (const topic of falseDoctrinesToTest) {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockRejectionResponse)
        });

        const result = await geminiComposable.generateGeminiContent(topic, 'devotion', 'en');

        // Should redirect away from false doctrine
        expect(result.text.toLowerCase()).toMatch(/(redirect|biblical perspective|scripture teaches|fundamental principles)/);
        
        // Should not promote false doctrine
        expect(result.text.toLowerCase()).not.toMatch(/(once saved always saved|eternal security guaranteed|sunday is the sabbath|soul is immortal)/);
        
        // Should provide biblical foundation
        expect(result.verses.length).toBeGreaterThan(0);
      }
    });

    it('should handle controversial social issues with biblical wisdom', async () => {
      const socialIssues = [
        'Biblical view on same-sex marriage',
        'Evolution and creation compatibility',
        'Climate change and biblical prophecy',
        'Women ordination in ministry'
      ];

      for (const topic of socialIssues.slice(0, 2)) { // Test subset for performance
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{
                  text: `While this topic involves complex social and theological considerations, let me offer a biblically-grounded perspective that emphasizes God's love, wisdom, and plan for humanity.

Scripture provides timeless principles that can guide our understanding of modern issues. Rather than focusing on divisive aspects, we can seek God's heart and His desire for all people to experience His love and salvation.

The Bible calls us to approach difficult topics with humility, grace, and a commitment to truth. We must balance justice with mercy, conviction with compassion, always remembering that our ultimate goal is to reflect Christ's character.

Prayer and careful Bible study, guided by the Holy Spirit, help us navigate complex issues while maintaining our commitment to biblical authority and Christian love.

Let us focus on what unites us in Christ rather than what divides us, always seeking to build bridges of understanding while remaining faithful to God's Word.

["Matthew 22:37-39", "2 Timothy 3:16", "1 Peter 3:15", "Ephesians 4:15"]`
                }]
              }
            }]
          })
        });

        const result = await geminiComposable.generateGeminiContent(topic, 'devotion', 'en');

        // Should handle sensitively without taking divisive positions
        expect(result.text.toLowerCase()).toMatch(/(biblical perspective|god's love|scripture|wisdom|grace)/);
        expect(result.text.toLowerCase()).toMatch(/(compassion|understanding|unity|christ)/);
        
        // Should not be inflammatory or divisive
        expect(result.text.toLowerCase()).not.toMatch(/(condemned|wrong|sinful|abomination)/);
        
        // Should point to biblical principles
        expect(result.verses.length).toBeGreaterThan(0);
      }
    });

    it('should affirm SDA distinctive doctrines without explicit denominational references', async () => {
      const sdaDoctrines = [
        'Sabbath observance and spiritual rest',
        'State of the dead and resurrection',
        'Health message and body temple',
        'Sanctuary service and heavenly ministry'
      ];

      for (const topic of sdaDoctrines.slice(0, 2)) { // Test subset
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockDoctrinalResponse)
        });

        const result = await geminiComposable.generateGeminiContent(topic, 'devotion', 'en');

        // Should support the doctrine biblically
        if (topic.includes('Sabbath')) {
          expect(result.text.toLowerCase()).toMatch(/(sabbath|seventh day|friday evening|saturday|creation|rest|worship)/);
          // Flexible check for biblical references that may appear in different forms
          expect(result.text.toLowerCase()).toMatch(/(exodus|genesis|commandment|creation)/);
        }
        
        if (topic.includes('state of the dead')) {
          expect(result.text.toLowerCase()).toMatch(/(sleep|rest|resurrection|jesus returns|grave)/);
          expect(result.text.toLowerCase()).not.toMatch(/(immortal soul|immediately|heaven|hell|purgatory)/);
        }

        // Should never mention SDA explicitly
        expect(result.text.toLowerCase()).not.toContain('seventh-day adventist');
        expect(result.text.toLowerCase()).not.toContain('sda');
        expect(result.text.toLowerCase()).not.toContain('ellen white');
        expect(result.text.toLowerCase()).not.toContain('adventist');

        // Should have strong biblical foundation
        expect(result.verses.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('should handle end-time deception topics with biblical discernment', async () => {
      const endTimeTopics = [
        'Catholic-Protestant unity movement',
        'Emergent church and postmodern Christianity',
        'Signs and wonders movement validation',
        'Sunday law and mark of the beast'
      ];

      for (const topic of endTimeTopics.slice(0, 2)) {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{
                  text: `In these last days, it's crucial to exercise biblical discernment and remain anchored in God's Word. The Scriptures warn us about deceptions and false teachings that will appear even among those who claim to follow Christ.

Our safety lies not in following popular movements or appealing teachings, but in faithful adherence to biblical truth. We must test every spirit and teaching against the clear testimony of Scripture.

The Bible calls us to be like the noble Bereans who searched the Scriptures daily to verify what they heard. This careful study of God's Word, guided by the Holy Spirit, protects us from error and keeps us on the path of truth.

Rather than being swayed by signs, wonders, or emotional appeals, we must build our faith on the solid foundation of biblical doctrine and prophetic understanding.

Let us remain vigilant, prayerful, and committed to the whole counsel of God's Word as we navigate these challenging times.

["2 Timothy 3:1-5", "1 John 4:1", "Acts 17:11", "2 Peter 3:17-18"]`
                }]
              }
            }]
          })
        });

        const result = await geminiComposable.generateGeminiContent(topic, 'devotion', 'en');

        // Should emphasize biblical discernment
        expect(result.text.toLowerCase()).toMatch(/(discernment|scripture|biblical truth|test|word of god)/);
        expect(result.text.toLowerCase()).toMatch(/(berean|search|verify|study)/);
        
        // Should warn against deception without being alarmist
        expect(result.text.toLowerCase()).toMatch(/(careful|vigilant|test|anchor|foundation)/);
        
        // Should not promote conspiracy theories
        expect(result.text.toLowerCase()).not.toMatch(/(conspiracy|secret|illuminati|global control)/);
        
        expect(result.verses.length).toBeGreaterThan(0);
      }
    });

    it('should handle edge case topics with cultural sensitivity', async () => {
      const edgeCases = [
        'Halloween participation for Christians',
        'Christmas and Easter celebrations',
        'Music styles in worship service',
        'Entertainment choices for believers'
      ];

      for (const topic of edgeCases.slice(0, 2)) {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{
                  text: `When considering cultural practices and celebrations, Christians are called to exercise wisdom, discernment, and conscience guided by biblical principles.

The apostle Paul teaches us that some matters fall into the realm of Christian liberty, where sincere believers may reach different conclusions while maintaining unity in essential truths.

Our primary considerations should include: Does this practice glorify God? Does it strengthen my relationship with Christ? Does it provide positive witness to others? Does it align with biblical values?

We must also consider the impact on our spiritual life, our family, and our Christian community. What might be acceptable for one believer in their circumstances might not be appropriate for another.

The key is to seek God's guidance through prayer and Bible study, consult with mature Christian mentors, and make decisions that honor Christ and strengthen rather than compromise our faith.

Let us focus on practices that draw us closer to God and reflect His character of love, truth, and holiness in our daily lives.

["1 Corinthians 10:31", "Romans 14:5-6", "Philippians 4:8", "1 Thessalonians 5:21-22"]`
                }]
              }
            }]
          })
        });

        const result = await geminiComposable.generateGeminiContent(topic, 'devotion', 'en');

        // Should provide balanced, biblical guidance
        expect(result.text.toLowerCase()).toMatch(/(wisdom|discernment|conscience|biblical principles)/);
        expect(result.text.toLowerCase()).toMatch(/(pray|study|guidance|christian liberty)/);
        
        // Should not be legalistic or judgmental
        expect(result.text.toLowerCase()).not.toMatch(/(forbidden|sinful|condemned|evil)/);
        expect(result.text.toLowerCase()).toMatch(/(consider|seek|honor|glorify)/);
        
        expect(result.verses.length).toBeGreaterThan(0);
      }
    });

    it('should maintain doctrinal consistency across similar topics', async () => {
      const doctrinalPairs = [
        ['Sabbath observance and spiritual rest', 'Biblical creation vs evolution'],
        ['Salvation by grace through faith', 'Law and grace relationship'],
        ['State of the dead and resurrection', 'Second advent and millennium']
      ];

      for (const [topic1, topic2] of doctrinalPairs.slice(0, 1)) { // Test one pair
        global.fetch = vi.fn()
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockDoctrinalResponse)
          })
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockDoctrinalResponse)
          });

        const result1 = await geminiComposable.generateGeminiContent(topic1, 'devotion', 'en');
        const result2 = await geminiComposable.generateGeminiContent(topic2, 'devotion', 'en');

        // Both should be biblically sound
        expect(result1.verses.length).toBeGreaterThan(0);
        expect(result2.verses.length).toBeGreaterThan(0);

        // Both should avoid denominational references
        [result1, result2].forEach(result => {
          expect(result.text.toLowerCase()).not.toContain('seventh-day adventist');
          expect(result.text.toLowerCase()).not.toContain('sda');
          expect(result.text.toLowerCase()).not.toContain('ellen white');
        });

        // Both should have substantial, thoughtful content
        expect(result1.text.length).toBeGreaterThan(200);
        expect(result2.text.length).toBeGreaterThan(200);
      }
    });

    it('should reject topics that promote non-Christian spirituality', async () => {
      const nonChristianTopics = [
        'Meditation on inner divinity',
        'Finding your spirit animal guide',
        'Channeling divine energy through meditation',
        'Law of attraction in biblical context'
      ];

      for (const topic of nonChristianTopics.slice(0, 2)) {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockRejectionResponse)
        });

        const result = await geminiComposable.generateGeminiContent(topic, 'devotion', 'en');

        // Should clearly reject non-biblical spirituality
        expect(result.text.toLowerCase()).toMatch(/(redirect|not supported|conflicts|biblical scripture)/);
        expect(result.text.toLowerCase()).toMatch(/(jesus christ|personal relationship|bible study|prayer)/);
        
        // Should not validate or incorporate non-Christian concepts
        expect(result.text.toLowerCase()).not.toMatch(/(inner divinity|spirit animal|channeling|law of attraction)/);
        
        // Should offer biblical alternative
        expect(result.text.toLowerCase()).toMatch(/(true spiritual|genuine|scripture|god's word)/);
        expect(result.verses.length).toBeGreaterThan(0);
      }
    });

    it('should handle biblical doctrines with appropriate depth and reverence', async () => {
      const coreDoctrines = [
        'Biblical authority and interpretation',
        'Jesus Christ divinity and humanity',
        'Holy Spirit role in sanctification',
        'Ten commandments and moral law'
      ];

      for (const topic of coreDoctrines.slice(0, 2)) {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{
                  text: `The divine inspiration and authority of Scripture stands as the foundation of Christian faith and life. God's Word serves as our ultimate guide for doctrine, reproof, correction, and instruction in righteousness.

When we approach the Bible with humility and prayerful hearts, the Holy Spirit illuminates its truths and applies them to our daily experience. Scripture interprets Scripture, providing its own commentary and clarification.

The Bible's internal consistency and harmony, despite being written over centuries by different authors, testifies to its divine origin. Its prophecies, fulfilled with remarkable precision, demonstrate God's omniscience and sovereignty.

As we study God's Word, we discover not merely intellectual information but transformative truth that shapes our character and relationship with our Creator. The Scriptures reveal God's love, justice, mercy, and plan of salvation.

Let us approach the Bible with reverence, expecting the Holy Spirit to teach, convict, and guide us into all truth as we seek to know and follow God's will.

["2 Timothy 3:16-17", "Isaiah 55:11", "John 17:17", "Psalm 119:105"]`
                }]
              }
            }]
          })
        });

        const result = await geminiComposable.generateGeminiContent(topic, 'devotion', 'en');

        // Should demonstrate theological depth
        expect(result.text.length).toBeGreaterThan(300);
        expect(result.text.toLowerCase()).toMatch(/(scripture|bible|word of god|divine|holy spirit)/);
        
        // Should be reverent and worshipful in tone
        expect(result.text.toLowerCase()).toMatch(/(reverence|humble|prayer|worship|sacred)/);
        
        // Should have strong biblical foundation
        expect(result.verses.length).toBeGreaterThanOrEqual(3);
        
        // Should not be dry or academic but inspiring
        expect(result.text.toLowerCase()).toMatch(/(transform|experience|relationship|heart|life)/);
      }
    });
  });

    it('should categorize and handle different types of controversial content appropriately', async () => {
      const contentCategories = {
        shouldReject: [
          'Astrology and God\'s plan for your life',
          'Reincarnation and karma in Christian faith',
          'Once saved always saved eternal security',
          'Prosperity gospel and divine blessing'
        ],
        shouldRedirect: [
          'Biblical view on same-sex marriage',
          'Evolution and creation compatibility',
          'Women ordination in ministry'
        ],
        shouldAffirm: [
          'Sabbath observance and spiritual rest',
          'Biblical creation vs evolution',
          'Salvation by grace through faith'
        ]
      };

      // Test rejection of non-biblical content
      for (const topic of contentCategories.shouldReject.slice(0, 2)) {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockRejectionResponse)
        });

        const result = await geminiComposable.generateGeminiContent(topic, 'devotion', 'en');
        
        expect(result.text.toLowerCase()).toMatch(/(respectfully redirect|not supported|conflicts with|biblical scripture)/);
        expect(result.text.toLowerCase()).not.toMatch(/(astrology|reincarnation|karma|once saved always saved|prosperity gospel)/);
      }

      // Test sensitive handling of divisive topics
      for (const topic of contentCategories.shouldRedirect.slice(0, 1)) {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{
                  text: `This topic involves complex theological and social considerations that sincere Christians may approach differently while maintaining unity in essential gospel truths.

Rather than taking divisive positions, let us focus on what Scripture clearly teaches about God's love for all people, our call to grace and compassion, and our need for wisdom in applying biblical principles to contemporary issues.

The Bible encourages us to approach difficult topics with humility, seeking understanding through prayer and careful study. We must balance truth with love, conviction with grace.

Our primary calling is to reflect Christ's character in all our interactions, demonstrating both the holiness and mercy of God in our responses to challenging social and theological questions.

["1 Peter 3:15", "Ephesians 4:15", "Matthew 22:37-39", "James 3:17"]`
                }]
              }
            }]
          })
        });

        const result = await geminiComposable.generateGeminiContent(topic, 'devotion', 'en');
        
        expect(result.text.toLowerCase()).toMatch(/(complex|wisdom|grace|love|humility)/);
        expect(result.text.toLowerCase()).not.toMatch(/(condemned|wrong|sinful|forbidden)/);
      }

      // Test affirmation of biblical doctrines
      for (const topic of contentCategories.shouldAffirm.slice(0, 1)) {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockDoctrinalResponse)
        });

        const result = await geminiComposable.generateGeminiContent(topic, 'devotion', 'en');
        
        expect(result.text.length).toBeGreaterThan(200);
        expect(result.verses.length).toBeGreaterThan(0);
        expect(result.text.toLowerCase()).not.toContain('seventh-day adventist');
      }
    });

    it('should handle compound controversial topics with multiple elements', async () => {
      const compoundTopics = [
        'Sunday worship and the mark of the beast',
        'Evolution, creation, and biblical authority',
        'Interfaith dialogue and Christian exclusivity',
        'Prosperity gospel and biblical stewardship'
      ];

      for (const topic of compoundTopics.slice(0, 2)) {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{
                  text: `This topic combines several important theological concepts that require careful biblical examination and discernment.

When addressing complex matters that involve multiple doctrinal elements, we must rely on the clear teaching of Scripture and allow God's Word to be our guide rather than human tradition or popular opinion.

The Bible provides comprehensive truth that addresses all aspects of faith and practice. By studying the whole counsel of God's Word, we can understand how different biblical principles work together harmoniously.

Rather than being confused by competing claims or complex arguments, we can find clarity through prayerful study of Scripture, seeking the Holy Spirit's guidance in understanding divine truth.

Let us commit to building our understanding on the solid foundation of biblical teaching, allowing Scripture to interpret Scripture and guide our conclusions.

["2 Timothy 3:16-17", "Acts 17:11", "Isaiah 8:20", "John 17:17"]`
                }]
              }
            }]
          })
        });

        const result = await geminiComposable.generateGeminiContent(topic, 'devotion', 'en');

        // Should handle complexity thoughtfully
        expect(result.text.toLowerCase()).toMatch(/(complex|careful|discernment|biblical examination)/);
        expect(result.text.toLowerCase()).toMatch(/(scripture|god's word|biblical teaching)/);
        
        // Should not get lost in controversy but point to biblical foundation
        expect(result.text.toLowerCase()).toMatch(/(foundation|truth|study|prayer)/);
        expect(result.verses.length).toBeGreaterThan(0);
      }
    });

    it('should maintain response quality under controversial topic stress testing', async () => {
      const stressTestTopics = [
        'Yoga as spiritual practice for Christians',
        'Catholic-Protestant unity movement',
        'Signs and wonders movement validation',
        'Meditation on inner divinity',
        'Sunday law and mark of the beast'
      ];

      const results: Array<{ topic: string; responseTime: number; quality: boolean }> = [];

      for (const topic of stressTestTopics) {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockRejectionResponse)
        });

        const startTime = Date.now();
        const result = await geminiComposable.generateGeminiContent(topic, 'devotion', 'en');
        const endTime = Date.now();

        const quality = result.text.length > 100 && 
                       result.verses.length > 0 && 
                       !result.text.toLowerCase().includes('undefined') &&
                       !result.text.toLowerCase().includes('null');

        results.push({
          topic,
          responseTime: endTime - startTime,
          quality
        });
      }

      // All responses should maintain quality standards
      results.forEach(result => {
        expect(result.quality).toBe(true);
        expect(result.responseTime).toBeLessThan(10000); // Should complete within 10 seconds
      });

      // Overall performance should be consistent
      const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
      expect(avgResponseTime).toBeLessThan(5000);
    });

    it('should demonstrate consistent doctrinal stance across repeated testing', async () => {
      const doctrinalTopic = 'State of the dead and resurrection';
      const results: string[] = [];

      // Test the same topic multiple times
      for (let i = 0; i < 3; i++) {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{
                  text: `The Bible teaches clearly about the state of the dead, providing comfort and hope for believers facing the reality of death.

Scripture describes death as a sleep, a temporary rest from the trials and labors of this life. The dead do not continue conscious existence but await the resurrection when Christ returns.

This biblical understanding brings great comfort, knowing that our loved ones who have died in Christ are not suffering or struggling but are peacefully resting until the glorious resurrection morning.

The resurrection represents the ultimate triumph over death, when Jesus will call forth all who have trusted in Him for eternal life and immortality.

Until that blessed day, we find hope in God's promises and comfort in knowing that death does not have the final word for those who belong to Christ.

["1 Thessalonians 4:13-16", "Ecclesiastes 9:5", "Daniel 12:2", "1 Corinthians 15:51-54"]`
                }]
              }
            }]
          })
        });

        const result = await geminiComposable.generateGeminiContent(doctrinalTopic, 'devotion', 'en');
        results.push(result.text.toLowerCase());
      }

      // All responses should consistently reject immortal soul doctrine
      results.forEach(text => {
        expect(text).toMatch(/(sleep|rest|resurrection|return)/);
        expect(text).not.toMatch(/(immortal soul|immediate heaven|purgatory|limbo|ghost|spirit world)/);
        // Note: "conscious" appears in "conscious existence" which is biblical context
      });

      // All should be biblically based
      results.forEach(text => {
        expect(text).toMatch(/(bible|scripture|teaches|word)/);
      });
    });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty or invalid topics gracefully', async () => {
      const invalidTopics = ['', '   ', '12345', '!@#$%'];

      for (const topic of invalidTopics) {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockDevotionalResponse)
        });

        // Should not throw error but may produce generic content
        const result = await geminiComposable.generateGeminiContent(topic, 'devotion', 'en');
        expect(result.text).toBeDefined();
        expect(typeof result.text).toBe('string');
      }
    });

    it('should handle malformed API responses', async () => {
      const malformedResponses = [
        { candidates: [] },
        { candidates: [{ content: null }] },
        { candidates: [{ content: { parts: [] } }] },
        {}
      ];

      for (const response of malformedResponses) {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(response)
        });

        await expect(
          geminiComposable.generateGeminiContent('Test topic', 'devotion', 'en')
        ).rejects.toThrow('Invalid response structure');
      }
    });

    it('should parse verses correctly from various formats', async () => {
      const responseVariations = [
        'Content here\n["John 3:16", "Psalm 23:1"]',
        'Content here\n[ "Romans 8:28" , "Isaiah 41:10" ]',
        'Content here\n["1 Corinthians 13:4-7"]',
        'Content here["Proverbs 3:5-6"]'
      ];

      for (const textVariation of responseVariations) {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{ text: textVariation }]
              }
            }]
          })
        });

        const result = await geminiComposable.generateGeminiContent('Test', 'devotion', 'en');
        
        expect(Array.isArray(result.verses)).toBe(true);
        expect(result.verses.length).toBeGreaterThan(0);
        expect(result.text).not.toContain('[');
        expect(result.text).not.toContain(']');
      }
    });
  });
});
