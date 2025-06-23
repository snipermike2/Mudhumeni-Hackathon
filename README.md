# Mudhumeni AI - Smart Farming Assistant

An AI-powered farming assistant designed for Southern African smallholder farmers, with a focus on Zimbabwe. The application provides intelligent agricultural advice through a conversational AI interface powered by Llama 3.

## Features

### 🤖 Generative AI Chatbot
- **Llama 3 Integration**: Powered by Meta's Llama 3 model for natural, intelligent conversations
- **Agricultural Expertise**: Specialized knowledge in Southern African farming practices
- **Conversational Interface**: Natural language processing for intuitive farmer interactions
- **Follow-up Questions**: AI suggests relevant follow-up questions to continue the conversation
- **Confidence Scoring**: Each AI response includes a confidence level
- **Offline Fallback**: Local knowledge base when internet connectivity is poor

### 🌱 Smart Features
- **Crop Recommendations**: ML-powered crop selection based on soil data
- **Weather Integration**: Real-time weather data and farming insights
- **Multilingual Support**: English, Shona, and Ndebele languages
- **Feedback System**: Rate AI responses to improve recommendations
- **User Profiles**: Personalized farming profiles and history

### 📱 Mobile-First Design
- **Progressive Web App (PWA)**: Installable on mobile devices
- **Offline Capability**: Core features work without internet
- **Responsive Design**: Optimized for smartphones and tablets
- **Touch-Friendly Interface**: Designed for rural farmers

## Setup Instructions

### 1. Clone and Install
```bash
git clone <repository-url>
cd mudhumeni-ai
npm install
```

### 2. Configure AI API
1. Copy `.env.example` to `.env`
2. Get an API key from one of these providers:
   - **Together AI** (Recommended): https://api.together.xyz/
   - **OpenAI**: https://platform.openai.com/
   - **Anthropic**: https://console.anthropic.com/

3. Update your `.env` file:
```env
VITE_LLAMA_API_URL=https://api.together.xyz/v1/chat/completions
VITE_LLAMA_API_KEY=your_api_key_here
```

### 3. Run the Application
```bash
npm run dev
```

## AI Integration Details

### Llama 3 Configuration
The chatbot uses Meta's Llama 3 model with the following configuration:
- **Model**: `meta-llama/Llama-3-8b-chat-hf`
- **Max Tokens**: 512 (optimized for mobile data usage)
- **Temperature**: 0.7 (balanced creativity and accuracy)
- **Context Window**: Last 10 messages maintained for conversation continuity

### Specialized Agricultural Prompting
The AI is configured with specialized system prompts that include:
- Southern African farming expertise
- Zimbabwe-specific agricultural knowledge
- Smallholder farmer focus
- Local crop varieties and practices
- Seasonal farming calendars
- Pest and disease management for the region

### Fallback System
When the AI API is unavailable, the system falls back to:
- Local knowledge base responses
- Cached conversation patterns
- Offline-capable basic farming advice

## Usage Examples

### Starting a Conversation
The AI introduces itself and explains its capabilities:
- Crop selection and planting advice
- Pest and disease management
- Soil health and fertilization
- Weather-based farming decisions
- Market information and pricing
- Sustainable farming practices

### Sample Interactions
**User**: "When should I plant maize in Harare?"

**AI**: "For maize cultivation in Harare, the optimal planting time is between mid-October and early December, during the rainy season. Here's what you need to know:

🌱 **Timing**: Plant after the first good rains when soil moisture is adequate
📏 **Spacing**: 25cm between plants, 75cm between rows
🌾 **Depth**: 2-3cm deep for optimal germination
🌡️ **Soil**: Ensure soil temperature is above 16°C

Would you like specific variety recommendations for your farm size, or do you need advice on soil preparation?"

## Technical Architecture

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **PWA** capabilities with offline support

### AI Service Layer
- Modular chat service architecture
- Conversation history management
- Error handling and fallback responses
- Token optimization for mobile usage

### State Management
- React Context for user authentication
- Local storage for offline data
- Conversation history caching

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact the development team or create an issue in the repository.

---

**Mudhumeni AI** - Empowering Southern African farmers with intelligent agricultural assistance.