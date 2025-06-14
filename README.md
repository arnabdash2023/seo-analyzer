# SEO Analyzer 🚀

A modern, responsive web application that analyzes text content for SEO optimization. Features real-time keyword extraction, readability scoring, and content optimization suggestions.

![SEO Analyzer Demo](/home/rocky/Pictures/Screenshots/Screenshot From 2025-06-14 15-15-33.png)
![Node.js](/home/rocky/Pictures/Screenshots/Screenshot From 2025-06-14 15-36-54.png)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### Core Functionality
- **Smart Text Analysis**: Analyzes content for SEO effectiveness
- **Keyword Extraction**: Identifies important keywords using TextRazor API or local algorithms
- **Readability Scoring**: Calculates Flesch Reading Ease scores
- **Content Optimization**: Provides actionable suggestions for improvement
- **Real-time Preview**: Shows optimized text with highlighted keywords

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean, gradient-based design with smooth animations
- **Dark Mode Support**: Automatic dark mode based on system preferences
- **Keyboard Shortcuts**: Ctrl/Cmd + Enter to analyze, Escape to clear errors
- **Copy to Clipboard**: One-click copying of optimized content

### Technical Features
- **Dual Analysis Modes**: TextRazor API integration with local fallback
- **Error Handling**: Comprehensive error management and user feedback
- **Performance Optimized**: Efficient text processing and UI updates
- **Security**: Input validation and content length limits
- **Accessibility**: ARIA labels and semantic HTML

## 🛠 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/seo-analyzer.git
   cd seo-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (Optional)
   ```bash
   cp .env.example .env
   # Edit .env and add your TextRazor API key
   ```

4. **Start the application**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000

# TextRazor API (Optional - for enhanced keyword extraction)
TEXTRAZOR_API_KEY=your_textrazor_api_key_here
```

### TextRazor API Setup (Optional)

For enhanced keyword extraction:

1. Sign up at [TextRazor](https://www.textrazor.com/)
2. Get your free API key (1,000 requests/month)
3. Add the key to your `.env` file
4. Restart the server

**Note**: The application works perfectly without the API key using local analysis algorithms.

## 🚀 Usage

### Basic Analysis
1. Enter or paste your text content into the textarea
2. Click "Analyze Text" or press Ctrl/Cmd + Enter
3. Review the analysis results:
   - **Readability Score**: Flesch Reading Ease rating
   - **SEO Score**: Overall content optimization rating
   - **Word Count**: Total words and sentences
   - **Keywords**: Extracted relevant keywords
   - **Suggestions**: Actionable improvement recommendations

### Advanced Features
- **Keyword Integration**: Click the "+" button next to keywords to add them to your content
- **Text Optimization**: View and copy the optimized version of your text
- **Reset Functionality**: Restore original text anytime
- **Responsive Feedback**: Real-time notifications for user actions

## 📁 Project Structure

```
seo-analyzer/
├── backend/
│   └── server.js          # Express.js server and API routes
├── frontend/
│   ├── index.html         # Main HTML structure
│   ├── style.css          # Responsive CSS styling
│   └── script.js          # Frontend JavaScript logic
├── package.json           # Dependencies and scripts
├── .gitignore            # Git ignore patterns
├── .env.example          # Environment variables template
└── README.md             # This file
```

## 🔧 API Endpoints

### `GET /`
Serves the main application interface

### `GET /health`
Returns server health status
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### `POST /analyze`
Analyzes text content for SEO optimization

**Request Body:**
```json
{
  "text": "Your content to analyze..."
}
```

**Response:**
```json
{
  "readability": 65.5,
  "title_score": 78,
  "keywords": ["keyword1", "keyword2"],
  "entities": ["entity1", "entity2"],
  "word_count": 150,
  "sentence_count": 8,
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "optimized_text": "Optimized version of your content...",
  "analysis_method": "TextRazor API"
}
```

## 🧪 Development

### Development Mode
```bash
npm run dev
```
Uses nodemon for automatic server restarts during development.

### Code Structure

**Backend (`server.js`)**
- Express.js server setup
- TextRazor API integration
- Local text analysis algorithms
- Error handling and validation

**Frontend**
- `index.html`: Semantic HTML structure with accessibility features
- `style.css`: Modern CSS with Grid, Flexbox, and animations
- `script.js`: Vanilla JavaScript with async/await and DOM manipulation

### Key Algorithms

**Readability Calculation**: Flesch Reading Ease formula
```javascript
readability = 206.835 - (1.015 × avgWordsPerSentence) - (84.6 × syllablesPerWord)
```

**Keyword Extraction**: TF-IDF-based approach with stop word filtering

**SEO Scoring**: Multi-factor analysis including word count, keyword density, and content structure

## 🌐 Browser Support

- Chrome/Chromium 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🎨 Customization

### Styling
Modify `style.css` to customize:
- Color schemes and gradients
- Typography and spacing
- Animation timing and effects
- Responsive breakpoints

### Analysis Parameters
Adjust in `server.js`:
- Readability thresholds
- Keyword extraction limits
- SEO scoring weights
- API timeout settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TextRazor](https://www.textrazor.com/) for advanced NLP capabilities
- [Font Awesome](https://fontawesome.com/) for beautiful icons
- [Express.js](https://expressjs.com/) for the robust backend framework

