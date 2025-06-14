const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.TEXTRAZOR_API_KEY;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/analyze', async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Text is required' });
  }

  let keywords = [];
  let entities = [];
  let usedAPI = false;

  // Try TextRazor API if key is present
  if (API_KEY) {
    try {
      const response = await fetch('https://api.textrazor.com/', {
        method: 'POST',
        headers: {
          'x-textrazor-key': API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `text=${encodeURIComponent(text)}&extract=topics,entities,words`
      });

      if (response.ok) {
        const data = await response.json();
        if (data.response?.topics) {
          keywords = data.response.topics
            .filter(topic => topic.label && topic.score > 0.5)
            .map(topic => topic.label)
            .slice(0, 10);
        }
        if (data.response?.entities) {
          entities = data.response.entities
            .filter(entity => entity.entityId && entity.confidenceScore > 0.5)
            .map(entity => entity.entityId)
            .slice(0, 5);
        }
        usedAPI = true;
      }
    } catch (apiError) {
      console.warn('TextRazor API error, falling back to local:', apiError.message);
    }
  }

  // Fallback for empty or error
  if (keywords.length === 0) {
    keywords = extractBasicKeywords(text);
    usedAPI = false;
  }

  // Always use local calculation for these values
  const wordCount = text.trim().split(/\s+/).length;
  const sentenceCount = (text.match(/[^.!?]+[.!?]+/g) || []).length || 1;
  const avgWordsPerSentence = wordCount / sentenceCount;
  const syllables = getSyllableCount(text);
  const readability = Math.max(0, Math.min(100,
    206.835 - (1.015 * avgWordsPerSentence) - (84.6 * (syllables / wordCount))
  )).toFixed(1);

  const titleScore = Math.min(100,
    (wordCount >= 50 && wordCount <= 300 ? 50 : 30) +
    (keywords.length * 5)
  );

  const suggestions = generateSuggestions(text, keywords, wordCount, readability);
  const optimizedText = generateOptimizedText(text, keywords);

  res.json({
    readability: parseFloat(readability),
    title_score: titleScore,
    keywords,
    entities,
    word_count: wordCount,
    sentence_count: sentenceCount,
    suggestions,
    optimized_text: optimizedText,
    analysis_method: usedAPI ? 'TextRazor API' : 'Basic Analysis'
  });
});

// --------- Helpers ----------

function extractBasicKeywords(text) {
  const stopWords = new Set([
    'the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','are','was','were',
    'be','been','being','have','has','had','do','does','did','will','would','could','should','can','may','might',
    'must','shall','this','that','these','those','i','me','my','we','our','you','your','he','him','she','her',
    'it','its','they','them','their','which','as','so','if','not','more','also','very','there','than','then'
  ]);
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));
  const freq = {};
  words.forEach(word => freq[word] = (freq[word] || 0) + 1);
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([word]) => word);
}

function getSyllableCount(text) {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  let count = 0;
  for (let word of words) {
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    count += (matches ? matches.length : 1);
  }
  return count;
}

function generateSuggestions(text, keywords, wordCount, readability) {
  const suggestions = [];
  if (wordCount < 50) {
    suggestions.push("Consider expanding your content. Aim for at least 50-100 words for better SEO.");
  }
  if (readability < 30) {
    suggestions.push("Try using shorter sentences and simpler words to improve readability.");
  }
  if (keywords.length > 0) {
    suggestions.push(`Consider using these keywords: ${keywords.slice(0, 3).join(', ')}`);
  }
  if (wordCount > 500) {
    suggestions.push("Consider breaking up long content into smaller paragraphs for better readability.");
  }
  return suggestions;
}

function generateOptimizedText(text, keywords) {
  if (!keywords || keywords.length === 0) return text;

  const sentences = text.split(/([.!?]+)/);
  let modified = false;

  for (let i = 0; i < Math.min(keywords.length, Math.floor(sentences.length / 2)); i++) {
    const idx = i * 2;
    const keyword = keywords[i];
    const original = sentences[idx]?.trim();

    if (original && !original.toLowerCase().includes(keyword.toLowerCase())) {
      sentences[idx] = `${capitalize(keyword)} is essential. ${original}`;
      modified = true;
    }
  }

  if (!modified) {
    return text + "\n\n" + keywords.map(k => `${capitalize(k)} plays a crucial role.`).join(' ');
  }

  return sentences.join('');
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving frontend from: ${frontendPath}`);
  console.log(`🔑 TextRazor API: ${API_KEY ? 'Configured' : 'Not configured (using basic analysis)'}`);
});
