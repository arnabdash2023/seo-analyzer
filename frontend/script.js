// Global variables
let originalText = '';
let currentText = '';
let analysisData = null;

// DOM elements
const elements = {
    inputText: () => document.getElementById('inputText'),
    analyzeBtn: () => document.getElementById('analyzeBtn'),
    loading: () => document.getElementById('loading'),
    results: () => document.getElementById('results'),
    updatedTextSection: () => document.getElementById('updatedTextSection'),
    errorMessage: () => document.getElementById('errorMessage'),
    errorText: () => document.getElementById('errorText'),
    readabilityScore: () => document.getElementById('readabilityScore'),
    seoScore: () => document.getElementById('seoScore'),
    wordCount: () => document.getElementById('wordCount'),
    sentenceCount: () => document.getElementById('sentenceCount'),
    keywordsList: () => document.getElementById('keywordsList'),
    suggestionsList: () => document.getElementById('suggestionsList'),
    updatedText: () => document.getElementById('updatedText'),
    analysisMethod: () => document.getElementById('analysisMethod')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners
    elements.inputText().addEventListener('input', handleTextInput);
    elements.inputText().addEventListener('paste', handleTextPaste);
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Test server connection on load
    testServerConnection();
});

// Handle text input changes
function handleTextInput(event) {
    const text = event.target.value;
    if (text.length > 10000) {
        showError('Text is too long. Please limit to 10,000 characters.');
        event.target.value = text.substring(0, 10000);
    }
}

// Handle paste events
function handleTextPaste(event) {
    setTimeout(() => {
        const text = event.target.value;
        if (text.length > 10000) {
            showError('Pasted text is too long. Truncated to 10,000 characters.');
            event.target.value = text.substring(0, 10000);
        }
    }, 100);
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + Enter to analyze
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        analyzeText();
    }
    
    // Escape to clear error
    if (event.key === 'Escape') {
        hideError();
    }
}

// Test server connection
async function testServerConnection() {
    try {
        const response = await fetch('/health', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Server health check failed');
        }
        
        console.log('✅ Server connection established');
    } catch (error) {
        console.warn('⚠️ Server connection test failed:', error.message);
        showError('Unable to connect to the analysis server. Please ensure the server is running.');
    }
}

// Main analysis function
async function analyzeText() {
    const inputText = elements.inputText().value.trim();
    
    if (!inputText) {
        showError('Please enter some text to analyze.');
        elements.inputText().focus();
        return;
    }
    
    if (inputText.length < 10) {
        showError('Please enter at least 10 characters for meaningful analysis.');
        return;
    }
    
    // Store original text
    originalText = inputText;
    currentText = inputText;
    
    // Show loading state
    setLoadingState(true);
    hideError();
    hideResults();
    
    try {
        const response = await fetch('/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: inputText })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }
        
        analysisData = await response.json();
        
        // Update UI with results
        displayResults(analysisData);
        showResults();
        
    } catch (error) {
        console.error('Analysis error:', error);
        showError(`Analysis failed: ${error.message}`);
    } finally {
        setLoadingState(false);
    }
}

// Display analysis results
function displayResults(data) {
    // Update metrics
    elements.readabilityScore().textContent = data.readability || 0;
    elements.seoScore().textContent = data.title_score || 0;
    elements.wordCount().textContent = data.word_count || 0;
    elements.sentenceCount().textContent = data.sentence_count || 0;
    
    // Update readability label
    const readabilityLabel = getReadabilityLabel(data.readability);
    document.getElementById('readabilityLabel').textContent = readabilityLabel;
    
    // Display keywords
    displayKeywords(data.keywords || []);
    
    // Display suggestions
    displaySuggestions(data.suggestions || []);
    
    // Update analysis method
    if (elements.analysisMethod()) {
        elements.analysisMethod().textContent = data.analysis_method || 'Basic Analysis';
    }
    
    // Update optimized text
    currentText = data.optimized_text || inputText;
    updateTextPreview();

}

// Display keywords
function displayKeywords(keywords) {
    const container = elements.keywordsList();
    container.innerHTML = '';
    
    if (keywords.length === 0) {
        container.innerHTML = '<p class="no-data">No keywords detected. Try adding more descriptive content.</p>';
        return;
    }
    
    keywords.forEach((keyword, index) => {
        const keywordElement = document.createElement('div');
        keywordElement.className = 'keyword-tag';
        keywordElement.innerHTML = `
            <span>${keyword}</span>
            <button onclick="insertKeyword('${keyword}')" title="Insert keyword into text">
                <i class="fas fa-plus"></i>
            </button>
        `;
        container.appendChild(keywordElement);
    });
}

// Display suggestions
function displaySuggestions(suggestions) {
    const container = elements.suggestionsList();
    container.innerHTML = '';
    
    if (suggestions.length === 0) {
        container.innerHTML = '<p class="no-data">No specific suggestions. Your content looks good!</p>';
        return;
    }
    
    suggestions.forEach(suggestion => {
        const suggestionElement = document.createElement('div');
        suggestionElement.className = 'suggestion-item';
        suggestionElement.innerHTML = `
            <i class="fas fa-lightbulb"></i>
            <span>${suggestion}</span>
        `;
        container.appendChild(suggestionElement);
    });
}

// Insert keyword into text
function insertKeyword(keyword) {
    if (!currentText) {
        showError('No text available to modify.');
        return;
    }
    
    // Smart insertion logic
    const sentences = currentText.split(/([.!?]+)/);
    if (sentences.length > 1) {
        // Insert at the beginning of a random sentence
        const insertIndex = Math.floor(Math.random() * Math.floor(sentences.length / 2)) * 2;
        const sentence = sentences[insertIndex].trim();
        
        if (sentence && !sentence.toLowerCase().includes(keyword.toLowerCase())) {
            // Insert keyword naturally at the beginning of the sentence
            sentences[insertIndex] = ` ${keyword} is important in ${sentence.toLowerCase()}`;
            currentText = sentences.join('');
        }
    } else {
        // If no sentences, just append
        currentText += ` ${keyword}`;
    }
    
    updateTextPreview();
    showNotification(`Keyword "${keyword}" added to your text!`);
}

// Update text preview
function updateTextPreview() {
    const container = elements.updatedText();
    container.innerHTML = currentText;
    
    // Highlight keywords if available
    if (analysisData && analysisData.keywords) {
        highlightKeywords(container, analysisData.keywords);
    }
    
    elements.updatedTextSection().style.display = 'block';
}

// Highlight keywords in text
function highlightKeywords(container, keywords) {
    let html = container.innerHTML;
    
    keywords.forEach(keyword => {
        const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
        html = html.replace(regex, '<mark style="background-color: #667eea; color: white; padding: 2px 4px; border-radius: 3px;">$1</mark>');
    });
    
    container.innerHTML = html;
}

// Copy optimized text
async function copyOptimizedText() {
    if (!currentText) {
        showError('No optimized text to copy.');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(currentText);
        showNotification('Optimized text copied to clipboard!');
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = currentText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Text copied to clipboard!');
    }
}

// Reset text to original
function resetText() {
    if (!originalText) {
        showError('No original text to reset to.');
        return;
    }
    
    currentText = originalText;
    updateTextPreview();
    showNotification('Text reset to original version.');
}

// Clear all text and results
function clearText() {
    elements.inputText().value = '';
    originalText = '';
    currentText = '';
    analysisData = null;
    
    hideResults();
    hideError();
    elements.updatedTextSection().style.display = 'none';
    
    elements.inputText().focus();
}

// Get readability label
function getReadabilityLabel(score) {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
}

// UI State Management
function setLoadingState(isLoading) {
    const loading = elements.loading();
    const analyzeBtn = elements.analyzeBtn();
    
    if (isLoading) {
        loading.style.display = 'block';
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    } else {
        loading.style.display = 'none';
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fas fa-analytics"></i> Analyze Text';
    }
}

function showResults() {
    elements.results().style.display = 'block';
    elements.results().scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideResults() {
    elements.results().style.display = 'none';
}

function showError(message) {
    elements.errorText().textContent = message;
    elements.errorMessage().style.display = 'flex';
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    elements.errorMessage().style.display = 'none';
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
    `;
    notification.innerHTML = `
        <i class="fas fa-check-circle" style="margin-right: 10px;"></i>
        ${message}
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add notification animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .no-data {
        color: #7f8c8d;
        font-style: italic;
        text-align: center;
        padding: 20px;
    }
`;
document.head.appendChild(style);