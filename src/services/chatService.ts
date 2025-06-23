// src/services/chatService.ts
// Fixed version for React environment

import { ChatResponse, TeachingContext } from '../types';

const ZIMBABWE_AGRICULTURAL_EXPERT = `You are Mudhumeni AI, the leading agricultural advisor for Zimbabwe. You are an expert in Zimbabwe's farming conditions, climate, soils, crops, and agricultural practices.

ZIMBABWE EXPERTISE:
- Climate: Subtropical highland climate with distinct wet season (November-March) and dry season (April-October)
- Altitude zones: Highveld (>1200m), Middleveld (600-1200m), Lowveld (<600m)
- Rainfall: 400-2000mm annually, varies by region
- Temperature: 13-22°C average, varies by altitude and season

MAJOR CROPS IN ZIMBABWE:
- Cereals: Maize (main staple), wheat, barley, sorghum, millet, rice
- Cash crops: Tobacco (flue-cured, burley), cotton, soybeans, sunflower, groundnuts
- Horticulture: Tomatoes, onions, potatoes, sweet potatoes, carrots, cabbage, spinach
- Tree crops: Citrus, avocados, mangoes, bananas, coffee, tea
- Root crops: Cassava, sweet potatoes
- Legumes: Beans (sugar beans, kidney beans), cowpeas, bambara nuts

SOIL TYPES:
- Granite-derived soils (65% of country) - generally sandy, low fertility
- Basalt-derived soils - clay, high fertility, mainly in Mashonaland Central/East
- Alluvial soils - fertile, along rivers
- Kalahari sands - deep sandy soils, low fertility

COMMON CHALLENGES:
- Pests: Fall armyworm, stalk borer, cutworm, aphids, bollworm, red spider mite
- Diseases: Maize streak virus, grey leaf spot, rust diseases, blight, mosaic viruses
- Climate: Drought, erratic rainfall, heat stress
- Soil: Low fertility, erosion, acidification

FERTILIZERS COMMONLY USED:
- Compound D (7:14:7) - for cereals at planting
- Compound C (8:14:6) - alternative basal fertilizer
- Ammonium Nitrate (34.5% N) - top dressing for cereals
- Single Super Phosphate (10.5% P) - phosphorus source
- MAP (12:52:0) - high phosphorus starter
- Lime - for acid soils
- Organic: Cattle manure, chicken manure, compost

ZIMBABWE AGRICULTURAL REGIONS:
- Region I: >1000mm rainfall, suitable for forestry, tea, coffee
- Region II: 700-1000mm, intensive farming, maize, tobacco, cotton
- Region III: 500-700mm, semi-intensive farming, drought-resistant crops
- Region IV: 450-650mm, semi-extensive farming, livestock
- Region V: <450mm, extensive farming, drought-resistant crops

RESPONSE REQUIREMENTS:
1. Always provide Zimbabwe-specific advice
2. Consider current month and season
3. Mention specific varieties suited for Zimbabwe
4. Include practical timing for Zimbabwe conditions
5. Reference local suppliers/extension services when relevant
6. Consider altitude and regional differences
7. Use both traditional and modern farming knowledge
8. Provide actionable, step-by-step guidance
9. Include cost considerations for small-scale farmers
10. Mention organic and sustainable options

Always be specific, practical, and educational. Consider the farmer's experience level and provide explanations for your recommendations.`;

// Helper function to get current season info
function getCurrentSeasonInfo(): { month: string; season: string; farmingActivity: string } {
  const now = new Date();
  const month = now.toLocaleString('default', { month: 'long' });
  const monthNum = now.getMonth() + 1; // 1-12

  let season: string;
  let farmingActivity: string;

  if (monthNum >= 11 || monthNum <= 3) {
    season = 'wet season (rainy season)';
    if (monthNum === 11 || monthNum === 12) {
      farmingActivity = 'main planting season for summer crops';
    } else {
      farmingActivity = 'crop growing and management season';
    }
  } else if (monthNum >= 4 && monthNum <= 6) {
    season = 'early dry season (harvest time)';
    farmingActivity = 'harvesting and post-harvest activities';
  } else {
    season = 'dry season';
    farmingActivity = 'land preparation and winter crop planting';
  }

  return { month, season, farmingActivity };
}

class ZimbabweAIFarmingService {
  private apiKey: string;
  private baseURL = 'https://api.groq.com/openai/v1/chat/completions';
  
  constructor() {
    // Access environment variable safely in React
    this.apiKey = import.meta.env?.REACT_APP_GROQ_API_KEY || 
                  (window as any).__ENV__?.REACT_APP_GROQ_API_KEY || 
                  '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';
    
    if (!this.apiKey || this.apiKey === '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') {
      console.log('🔑 Using embedded API key for demo');
    } else {
      console.log('✅ Groq API key loaded from environment');
    }
  }

  async getAIResponse(userMessage: string, context: TeachingContext): Promise<ChatResponse> {
    if (!this.apiKey) {
      throw new Error('Groq API key not configured. Please check your .env file.');
    }

    const seasonInfo = getCurrentSeasonInfo();
    
    try {
      console.log('🤖 Calling Groq AI for farming advice...');
      
      const systemPrompt = `${ZIMBABWE_AGRICULTURAL_EXPERT}

CURRENT CONTEXT:
- Current month: ${seasonInfo.month}
- Current season: ${seasonInfo.season}
- Current farming activity: ${seasonInfo.farmingActivity}
- User experience level: ${context.userExperienceLevel}
- Previous topics discussed: ${context.topicsDiscussed.join(', ') || 'None'}
- Number of previous questions: ${context.questionCount}

Provide specific, actionable advice for Zimbabwe farming conditions. Consider the current season and timing in your response.`;

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192', // Fast and capable model
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: `Farmer's question: ${userMessage}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Groq API error:', response.status, errorText);
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('Empty response from Groq AI');
      }

      console.log('✅ Groq AI response received successfully');
      return this.processAIResponse(aiResponse, userMessage, context, seasonInfo);

    } catch (error) {
      console.error('🔥 Error calling Groq AI:', error);
      throw error;
    }
  }

  private processAIResponse(
    aiResponse: string, 
    originalQuestion: string, 
    context: TeachingContext,
    seasonInfo: { month: string; season: string; farmingActivity: string }
  ): ChatResponse {
    
    // Calculate confidence based on response quality and specificity
    let confidence = 0.75; // Base confidence
    const lowerResponse = aiResponse.toLowerCase();
    
    // Boost confidence for Zimbabwe-specific content
    if (lowerResponse.includes('zimbabwe')) confidence += 0.1;
    if (lowerResponse.includes('harare') || lowerResponse.includes('bulawayo') || lowerResponse.includes('mutare')) confidence += 0.05;
    if (lowerResponse.includes('highveld') || lowerResponse.includes('lowveld') || lowerResponse.includes('middleveld')) confidence += 0.05;
    
    // Boost for seasonal awareness
    if (lowerResponse.includes(seasonInfo.month.toLowerCase()) || lowerResponse.includes('season')) confidence += 0.1;
    
    // Boost for specific agricultural content
    if (lowerResponse.includes('plant') && lowerResponse.includes('harvest')) confidence += 0.1;
    if (lowerResponse.includes('fertilizer') || lowerResponse.includes('manure')) confidence += 0.05;
    if (lowerResponse.includes('variety') || lowerResponse.includes('cultivar')) confidence += 0.05;
    if (lowerResponse.includes('spacing') && lowerResponse.includes('depth')) confidence += 0.05;
    if (lowerResponse.includes('pest') || lowerResponse.includes('disease')) confidence += 0.05;
    
    // Boost for detailed, comprehensive responses
    if (aiResponse.length > 400) confidence += 0.05;
    if (aiResponse.length > 600) confidence += 0.05;
    
    // Cap confidence at 95%
    confidence = Math.min(confidence, 0.95);

    // Generate intelligent follow-up questions
    const followUpQuestions = this.generateContextualFollowUpQuestions(originalQuestion, aiResponse, context);

    // Extract teaching elements
    const teachingElements = this.extractTeachingElements(aiResponse, context);

    // Enhance response based on user experience level
    let enhancedResponse = aiResponse;
    
    if (context.userExperienceLevel === 'beginner' && !aiResponse.toLowerCase().includes('beginner')) {
      enhancedResponse += `\n\n🌱 **Beginner Tip**: Since you're starting out, consider beginning with a small test plot (0.1-0.25 hectares) to practice these techniques before scaling up. This reduces risk and helps you gain valuable hands-on experience.`;
    } else if (context.userExperienceLevel === 'advanced' && !aiResponse.toLowerCase().includes('advanced')) {
      enhancedResponse += `\n\n🎯 **Advanced Strategy**: Consider how this approach integrates with your overall farm management plan, including crop rotation schedules, input cost optimization, and market timing for maximum profitability.`;
    }

    // Add seasonal context if not already mentioned
    if (!lowerResponse.includes('season') && !lowerResponse.includes(seasonInfo.month.toLowerCase())) {
      enhancedResponse += `\n\n📅 **Current Season Context**: Since it's ${seasonInfo.month} (${seasonInfo.season}), this is typically the time for ${seasonInfo.farmingActivity} in Zimbabwe.`;
    }

    return {
      response: enhancedResponse,
      confidence,
      followUpQuestions,
      teachingElements
    };
  }

  private generateContextualFollowUpQuestions(question: string, response: string, context: TeachingContext): string[] {
    const lowerQuestion = question.toLowerCase();
    const lowerResponse = response.toLowerCase();

    // Crop-specific follow-ups
    if (lowerQuestion.includes('plant') || lowerQuestion.includes('grow') || lowerQuestion.includes('cultivat')) {
      return [
        "What specific variety is best for my region in Zimbabwe?",
        "How should I prepare my soil for optimal results?",
        "What are the key signs of healthy growth to look for?",
        "When is the optimal harvest time for best quality?",
        "What common problems should I watch out for?"
      ];
    }

    // Pest and disease management
    if (lowerQuestion.includes('pest') || lowerQuestion.includes('disease') || lowerQuestion.includes('control') || lowerQuestion.includes('problem')) {
      return [
        "How can I prevent this problem in future seasons?",
        "What organic/natural treatments are most effective?",
        "What's the best timing for applying treatments?",
        "How do I identify this problem in its early stages?",
        "Are there resistant varieties available in Zimbabwe?"
      ];
    }

    // Soil and nutrition
    if (lowerResponse.includes('fertilizer') || lowerResponse.includes('soil') || lowerQuestion.includes('nutrient')) {
      return [
        "How often should I apply fertilizer during the growing season?",
        "What are the signs of nutrient deficiency in my crops?",
        "Can I make effective organic fertilizer myself?",
        "Where can I get my soil tested in Zimbabwe?",
        "How do I improve soil fertility long-term?"
      ];
    }

    // Market and economics
    if (lowerQuestion.includes('market') || lowerQuestion.includes('price') || lowerQuestion.includes('profit') || lowerQuestion.includes('sell')) {
      return [
        "What's the best time to sell for maximum profit?",
        "How do I find reliable buyers in my area?",
        "What value-addition opportunities exist for this crop?",
        "How should I store my harvest until market time?",
        "What are the current market trends for this crop?"
      ];
    }

    // Experience-level based questions
    if (context.userExperienceLevel === 'beginner') {
      return [
        "What basic equipment do I need to get started?",
        "Should I start with a small test area first?",
        "What are the most common beginner mistakes to avoid?",
        "Where can I get extension services support in Zimbabwe?",
        "What's the total cost to get started with this crop?"
      ];
    } else if (context.userExperienceLevel === 'advanced') {
      return [
        "How can I optimize my current practices for better efficiency?",
        "What new technologies or methods should I consider?",
        "How does this compare to alternative crops for profitability?",
        "What are the export opportunities for this crop?",
        "How can I integrate this with my existing farming system?"
      ];
    }

    // Default comprehensive follow-ups
    return [
      "What specific challenges might I face in my region of Zimbabwe?",
      "How does this approach vary by season?",
      "What local resources or suppliers should I contact?",
      "Are there government programs that support this activity?",
      "What's the expected return on investment?"
    ];
  }

  private extractTeachingElements(response: string, context: TeachingContext): any {
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Find explanatory sentences (the "why" behind recommendations)
    const explanation = sentences.find(s => {
      const lower = s.toLowerCase();
      return lower.includes('because') || 
             lower.includes('this helps') ||
             lower.includes('this ensures') ||
             lower.includes('the reason') ||
             lower.includes('due to') ||
             lower.includes('this allows') ||
             lower.includes('this prevents') ||
             lower.includes('as a result');
    }) || `Understanding the science and reasoning behind farming practices leads to better decision-making and improved results in Zimbabwe's diverse agricultural conditions.`;

    // Find practical examples (local context and success stories)
    const example = sentences.find(s => {
      const lower = s.toLowerCase();
      return lower.includes('example') || 
             lower.includes('for instance') ||
             lower.includes('many farmers') ||
             lower.includes('in zimbabwe') ||
             lower.includes('successful farmers') ||
             lower.includes('farmers often') ||
             lower.includes('common practice') ||
             lower.includes('typically') ||
             lower.includes('farmers in');
    }) || `Many successful Zimbabwe farmers have achieved excellent results by adapting these practices to their specific local conditions, climate zone, and soil type.`;

    // Add context-specific teaching elements
    let contextualTip = '';
    if (context.userExperienceLevel === 'beginner') {
      contextualTip = 'Remember that farming is a learning process - start small, observe carefully, and build your knowledge gradually.';
    } else if (context.userExperienceLevel === 'advanced') {
      contextualTip = 'Consider documenting your results to build data for optimizing your farming system over time.';
    } else {
      contextualTip = 'Keep records of what works well in your specific conditions to improve your farming success year after year.';
    }

    return {
      explanation: explanation.trim(),
      example: example.trim(),
      checkPoint: contextualTip
    };
  }
}

// Create service instance
const zimbabweAIService = new ZimbabweAIFarmingService();

// Main export function
export const getChatResponse = async (
  message: string,
  context: TeachingContext
): Promise<ChatResponse> => {
  try {
    return await zimbabweAIService.getAIResponse(message, context);
  } catch (error) {
    console.error('🚨 AI service error:', error);
    
    // Determine error type for better fallback response
    const isAPIKeyError = error instanceof Error && (
      error.message.includes('API key') || 
      error.message.includes('401') || 
      error.message.includes('Unauthorized')
    );
    
    const isNetworkError = error instanceof Error && (
      error.message.includes('fetch') || 
      error.message.includes('network') ||
      error.message.includes('timeout')
    );

    const isRateLimitError = error instanceof Error && (
      error.message.includes('429') || 
      error.message.includes('rate limit')
    );
    
    let fallbackMessage = '';
    let confidence = 0.6;
    
    if (isAPIKeyError) {
      fallbackMessage = `I need a valid Groq API key to provide AI-powered responses. Please check your .env file contains REACT_APP_GROQ_API_KEY. Meanwhile, I can still help with your farming question about "${message}" - could you provide more specific details about your farming situation?`;
      confidence = 0.4;
    } else if (isRateLimitError) {
      fallbackMessage = `I've reached my API rate limit temporarily. However, I can still assist with your farming question about "${message}". Could you provide more details about your specific farming challenge?`;
      confidence = 0.7;
    } else if (isNetworkError) {
      fallbackMessage = `I'm having trouble connecting to my AI system right now due to network issues. But I can still help with your farming question about "${message}". What specific aspects would you like guidance on?`;
      confidence = 0.6;
    } else {
      fallbackMessage = `I'm experiencing technical difficulties with my AI system. However, I'm still here to help with your farming question about "${message}". Let me provide what guidance I can.`;
      confidence = 0.5;
    }
    
    return {
      response: `${fallbackMessage}\n\nFor the best help, please provide:\n• Your location in Zimbabwe\n• The specific crop you're interested in\n• Your farm size and experience level\n• Any particular challenges you're facing\n\nThis will help me provide more targeted agricultural guidance even without full AI capabilities.`,
      confidence,
      followUpQuestions: [
        "What specific crop are you asking about?",
        "Which region of Zimbabwe is your farm located in?",
        "What's your current farming experience level?",
        "Are you facing any immediate agricultural challenges?",
        "What season or timing are you planning for?"
      ],
      teachingElements: {
        explanation: "Specific information about your farming situation helps provide more targeted and useful advice, even when technical systems have issues.",
        example: "For example, asking 'How do I plant maize in Mashonaland Central in November?' gives much better guidance than just 'help with maize.'",
        checkPoint: "Don't let technical difficulties stop your farming progress - there are always ways to get the agricultural guidance you need."
      }
    };
  }
};

// Helper functions with Zimbabwe-specific context
export const getTeachingTip = (topic: string): string => {
  const zimbabweTips: Record<string, string> = {
    planting: "In Zimbabwe, start with small test plots (0.1-0.25 hectares) before scaling up new varieties or techniques. This reduces risk and helps you learn what works in your specific conditions.",
    soil: "Zimbabwe's soils vary greatly - from granite-derived sandy soils to fertile basalt clays. Test your soil and add organic matter annually to build long-term fertility.",
    pests: "With Zimbabwe's climate, prevention through good agricultural practices is always better than treatment. Integrated Pest Management (IPM) works best in our conditions.",
    weather: "Keep a detailed farm diary tracking weather patterns, planting dates, and crop performance. This builds valuable knowledge for your specific location in Zimbabwe.",
    market: "Zimbabwe's agricultural markets can be volatile. Diversify your crops and consider value-addition to reduce risk and increase profitability.",
    general: "Zimbabwe agriculture is diverse and challenging. Ask specific questions about your crops, location, and farming challenges for the most helpful guidance!"
  };
  
  return zimbabweTips[topic] || zimbabweTips.general;
};

export const getFollowUpQuestions = (context: TeachingContext): string[] => {
  const seasonInfo = getCurrentSeasonInfo();
  
  if (context.userExperienceLevel === 'beginner') {
    return [
      "What crop are you planning to grow this season in Zimbabwe?",
      "Which province or region is your farm located in?",
      "What's the size of your farm or planned growing area?",
      "Do you have access to irrigation or rely on rainfall?",
      `Given it's ${seasonInfo.month}, what farming activities are you planning?`
    ];
  } else if (context.userExperienceLevel === 'advanced') {
    return [
      "How do you want to optimize your current farming practices?",
      "Are you interested in new crops or value-addition opportunities?",
      "Would you like to explore export markets or improved varieties?",
      "How can you better integrate technology into your farming?",
      "What are your main profitability and sustainability goals?"
    ];
  }
  
  return [
    "What crop or farming activity are you most interested in?",
    "What's your biggest agricultural challenge right now?",
    "Which region of Zimbabwe are you farming in?",
    "Do you need help with timing, techniques, or problem-solving?",
    `Since it's ${seasonInfo.season}, what should you be focusing on?`
  ];
};