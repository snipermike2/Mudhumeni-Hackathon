// src/types/index.ts
// Updated type definitions with all missing properties

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  farmSize?: number;
  preferredLanguage: 'en' | 'sn' | 'nd';
  createdAt: Date;
  // Add missing properties
  primaryCrops?: string[];
  joinedAt?: Date;
}

export interface TeachingContext {
  questionCount: number;
  topicsDiscussed: string[];
  userExperienceLevel: 'beginner' | 'intermediate' | 'advanced';
  lastTopics: string[];
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  language?: string;
  rating?: 'up' | 'down';
  confidence?: number;
  teachingTip?: string;
  // Fix visualAid to accept undefined instead of null
  visualAid?: {
    type: string;
    content: string;
  } | undefined;
  checkPoint?: string;
}

export interface ChatResponse {
  response: string;
  confidence: number;
  followUpQuestions: string[];
  teachingElements?: {
    explanation?: string;
    example?: string;
    checkPoint?: string;
  };
}

export interface CropRecommendation {
  id: string;
  cropName: string;
  confidence: number;
  reason: string;
  expectedYield: string;
  profitability: 'high' | 'medium' | 'low';
  plantingTime: string;
  harvestTime: string;
  soilRequirements: string[];
  waterRequirements: string;
  // Add missing properties used in components
  crop?: string;
  variety?: string;
  seasonality?: string;
  requirements?: string;
  marketPrice?: number;
  plantingInstructions?: {
    spacing: string;
    depth: string;
    soilPrep: string;
    fertilizer: string;
    pestControl: string;
  };
}

export interface SoilData {
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicMatter: number;
  texture: 'clay' | 'loam' | 'sandy' | 'silt';
  moisture: number;
  // Add location property used in components
  location?: string;
}

export interface WeatherData {
  date: Date;
  temperature: {
    min: number;
    max: number;
  };
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  farmingAdvice?: string;
  // Add missing properties
  uvIndex?: number;
  forecast?: Array<{
    date: Date;
    temperature: { min: number; max: number; };
    condition: string;
    humidity: number;
    rainfall: number;
  }>;
  location?: string;
  description?: string;
}

export interface TranslationStrings {
  language: 'en' | 'sn' | 'nd';
  appName: string;
  tagline: string;
  navigation: {
    chat: string;
    crops: string;
    weather: string;
    profile: string;
  };
  chat: {
    title: string;
    subtitle?: string;
    placeholder: string;
    send: string;
    typing: string;
    examples: string[];
    sendHint?: string;
    offlineCapable?: string;
    newChat?: string;
    interactions?: string;
    continueLeaning?: string;
    tryAsking?: string;
    teachingWelcome?: string;
    // Add missing welcome and subtitle properties
    welcome?: string;
    teachingTips?: {
      welcome: string;
      askWhy: string;
      trySmall: string;
      localWisdom: string;
      keepLearning: string;
    };
    teachingQuestions?: {
      explainDifferently: string;
      whatConfusing: string;
      needExample: string;
    };
    userLevels?: {
      beginner: string;
      intermediate: string;
      advanced: string;
    };
  };
  crops: {
    title: string;
    subtitle: string;
    inputSoil: string;
    getRecommendations: string;
    confidence: string;
    expectedYield: string;
    profitability: string;
    // Add missing properties
    seasonality?: string;
    requirements?: string;
  };
  auth: {
    login: string;
    register: string;
    email: string;
    password: string;
    name: string;
    phone: string;
    location: string;
    farmSize: string;
    language: string;
    // Add missing properties
    welcome?: string;
    subtitle?: string;
  };
  common: {
    submit: string;
    cancel: string;
    save: string;
    loading: string;
    error: string;
    success: string;
    offline: string;
    rate: string;
    feedback: string;
    // Add missing properties
    tryAgain?: string;
  };
  // Add missing weather translations
  weather?: {
    title: string;
    subtitle: string;
    temperature: string;
    humidity: string;
    rainfall: string;
    windSpeed: string;
    uvIndex: string;
    forecast: string;
    condition: string;
    farmingAdvice: string;
  };
}

// Export type for language
export type Language = 'en' | 'sn' | 'nd';

// Remove the duplicate export declaration that's causing conflicts
// The interfaces are already exported above with the 'export' keyword