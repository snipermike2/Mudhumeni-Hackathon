import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, Calendar, DollarSign, MapPin, Beaker, Droplets } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { CropRecommendation, SoilData } from '../types';
import { getChatResponse } from '../services/chatService';

const CropRecommendations: React.FC = () => {
  const { t } = useLanguage();
  const [soilData, setSoilData] = useState<SoilData>({
    ph: 6.5,
    nitrogen: 15,
    phosphorus: 25,
    potassium: 200,
    organicMatter: 3.5,
    moisture: 60,
    texture: 'loam',
    location: 'Harare'
  });
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load initial recommendations
    handleGetRecommendations();
  }, []);

  const generateAIPrompt = (soilData: SoilData): string => {
    return `Based on these soil conditions in Zimbabwe, provide 4-5 specific crop recommendations:

SOIL ANALYSIS:
- pH Level: ${soilData.ph}
- Nitrogen: ${soilData.nitrogen}%
- Phosphorus: ${soilData.phosphorus} ppm
- Potassium: ${soilData.potassium} ppm
- Organic Matter: ${soilData.organicMatter}%
- Moisture: ${soilData.moisture}%
- Soil Texture: ${soilData.texture}
- Location: ${soilData.location || 'Zimbabwe'}

Please provide specific crop recommendations with:
1. Crop name and best variety for Zimbabwe
2. Confidence level (0-100%)
3. Expected yield per hectare
4. Profitability assessment (high/medium/low)
5. Planting and harvest timing
6. Specific soil requirements
7. Water/irrigation needs
8. Brief reasoning for recommendation

Consider Zimbabwe's climate zones, current season, local varieties, and market conditions. Focus on crops that will perform well with these specific soil conditions.`;
  };

  const parseAIResponse = (aiResponse: string, confidence: number): CropRecommendation[] => {
    try {
      // Parse the AI response and convert to CropRecommendation format
      const lines = aiResponse.split('\n').filter(line => line.trim());
      const recommendations: CropRecommendation[] = [];
      
      let currentRec: Partial<CropRecommendation> = {};
      let recCount = 0;

      for (let i = 0; i < lines.length && recCount < 5; i++) {
        const line = lines[i].trim();
        
        // Look for crop names (usually numbered or have clear crop indicators)
        if (line.match(/^\d+\./) || 
            line.toLowerCase().includes('maize') || 
            line.toLowerCase().includes('tomato') || 
            line.toLowerCase().includes('bean') ||
            line.toLowerCase().includes('tobacco') ||
            line.toLowerCase().includes('cotton') ||
            line.toLowerCase().includes('sunflower') ||
            line.toLowerCase().includes('sorghum') ||
            line.toLowerCase().includes('cassava')) {
          
          // Save previous recommendation if exists
          if (currentRec.cropName) {
            recommendations.push(createRecommendation(currentRec, confidence, recCount));
            recCount++;
          }
          
          // Start new recommendation
          currentRec = {
            cropName: extractCropName(line),
            reason: line
          };
        } else if (line.toLowerCase().includes('confidence') || line.includes('%')) {
          const confidenceMatch = line.match(/(\d+)%/);
          if (confidenceMatch) {
            currentRec.confidence = parseFloat(confidenceMatch[1]) / 100;
          }
        } else if (line.toLowerCase().includes('yield')) {
          currentRec.expectedYield = extractYield(line);
        } else if (line.toLowerCase().includes('profit')) {
          currentRec.profitability = extractProfitability(line);
        } else if (line.toLowerCase().includes('plant') && line.toLowerCase().includes('harvest')) {
          const timingMatch = line.match(/(plant|sow).*?(\w+(?:-\w+)?)/i);
          if (timingMatch) {
            currentRec.plantingTime = timingMatch[2] || 'October-December';
          }
        }
      }
      
      // Add last recommendation
      if (currentRec.cropName) {
        recommendations.push(createRecommendation(currentRec, confidence, recCount));
      }

      // If we didn't get enough from parsing, add some defaults
      while (recommendations.length < 3) {
        recommendations.push(createDefaultRecommendation(recommendations.length, confidence));
      }

      return recommendations.slice(0, 5);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return getDefaultRecommendations(confidence);
    }
  };

  const extractCropName = (line: string): string => {
    const cropMatch = line.match(/(?:maize|corn|tomato|bean|tobacco|cotton|sunflower|sorghum|cassava|groundnut|soybean)/i);
    if (cropMatch) {
      return cropMatch[0].charAt(0).toUpperCase() + cropMatch[0].slice(1).toLowerCase();
    }
    return line.replace(/^\d+\.?\s*/, '').split(/[(:]/)[0].trim();
  };

  const extractYield = (line: string): string => {
    const yieldMatch = line.match(/(\d+(?:\.\d+)?)\s*(?:tonnes?|tons?|kg)\s*(?:per\s*)?(?:hectare|ha)/i);
    if (yieldMatch) {
      return `${yieldMatch[1]} tonnes/hectare`;
    }
    return '2-4 tonnes/hectare';
  };

  const extractProfitability = (line: string): 'high' | 'medium' | 'low' => {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('high')) return 'high';
    if (lowerLine.includes('low')) return 'low';
    return 'medium';
  };

  const createRecommendation = (rec: Partial<CropRecommendation>, confidence: number, index: number): CropRecommendation => {
    return {
      id: `ai-rec-${index + 1}`,
      cropName: rec.cropName || `Crop ${index + 1}`,
      confidence: rec.confidence || confidence,
      reason: rec.reason || 'Suitable for current soil conditions',
      expectedYield: rec.expectedYield || '2-4 tonnes/hectare',
      profitability: rec.profitability || 'medium',
      plantingTime: rec.plantingTime || 'October-December',
      harvestTime: 'April-May',
      soilRequirements: ['Well-drained soil', 'pH 6.0-7.0'],
      waterRequirements: 'Regular rainfall or irrigation',
      // Additional properties for compatibility
      crop: rec.cropName,
      variety: `Local variety`,
      seasonality: rec.plantingTime || 'October-December',
      requirements: rec.reason || 'Standard requirements',
      marketPrice: 500 + (index * 100),
      plantingInstructions: {
        spacing: '30cm x 75cm',
        depth: '2-3cm',
        soilPrep: 'Deep plowing and ridging',
        fertilizer: 'Basal fertilizer at planting',
        pestControl: 'Regular monitoring and IPM'
      }
    };
  };

  const createDefaultRecommendation = (index: number, confidence: number): CropRecommendation => {
    const crops = [
      { name: 'Maize', variety: 'ZM521', yield: '4-6 tonnes/hectare', price: 400 },
      { name: 'Tomatoes', variety: 'Star 9009', yield: '20-30 tonnes/hectare', price: 800 },
      { name: 'Beans', variety: 'Sugar Bean', yield: '1-2 tonnes/hectare', price: 900 },
      { name: 'Sunflower', variety: 'Hybrid', yield: '1.5-2.5 tonnes/hectare', price: 600 },
      { name: 'Sorghum', variety: 'Local', yield: '2-3 tonnes/hectare', price: 350 }
    ];
    
    const crop = crops[index] || crops[0];
    
    return {
      id: `default-${index + 1}`,
      cropName: crop.name,
      confidence,
      reason: `${crop.name} is well-suited to your soil conditions and Zimbabwe's climate`,
      expectedYield: crop.yield,
      profitability: 'medium',
      plantingTime: 'October-December',
      harvestTime: 'April-May',
      soilRequirements: ['Well-drained soil', 'pH 6.0-7.0'],
      waterRequirements: 'Regular rainfall',
      crop: crop.name,
      variety: crop.variety,
      seasonality: 'October-December',
      requirements: 'Standard soil preparation and management',
      marketPrice: crop.price,
      plantingInstructions: {
        spacing: '30cm x 75cm',
        depth: '2-3cm',
        soilPrep: 'Deep plowing and ridging',
        fertilizer: 'Compound fertilizer at planting',
        pestControl: 'IPM approach recommended'
      }
    };
  };

  const getDefaultRecommendations = (confidence: number): CropRecommendation[] => {
    return [0, 1, 2].map(index => createDefaultRecommendation(index, confidence));
  };

  const handleGetRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🌱 Getting AI crop recommendations...');
      
      const prompt = generateAIPrompt(soilData);
      
      const response = await getChatResponse(prompt, {
        questionCount: 1,
        topicsDiscussed: ['crop_recommendations', 'soil_analysis'],
        userExperienceLevel: 'intermediate',
        lastTopics: ['soil', 'crops']
      });

      console.log('✅ AI response received for crop recommendations');
      
      const aiRecommendations = parseAIResponse(response.response, response.confidence);
      setRecommendations(aiRecommendations);
      
    } catch (error) {
      console.error('❌ Error getting crop recommendations:', error);
      setError('Unable to get AI recommendations. Showing default suggestions.');
      
      // Fallback to default recommendations
      const defaultRecs = getDefaultRecommendations(0.75);
      setRecommendations(defaultRecs);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SoilData, value: number | string) => {
    setSoilData(prev => ({ ...prev, [field]: value }));
  };

  const getProfitabilityColor = (profitability: string) => {
    switch (profitability) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-green-600';
    if (confidence > 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.crops.title}</h1>
          <p className="text-gray-600">{t.crops.subtitle}</p>
        </div>

        {/* Soil Data Input */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Beaker className="w-5 h-5 mr-2 text-green-600" />
            {t.crops.inputSoil}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">pH Level</label>
              <input
                type="number"
                step="0.1"
                min="3"
                max="9"
                value={soilData.ph || ''}
                onChange={(e) => handleInputChange('ph', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="6.0 - 8.0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nitrogen (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="50"
                value={soilData.nitrogen || ''}
                onChange={(e) => handleInputChange('nitrogen', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="10 - 30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phosphorus (ppm)</label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={soilData.phosphorus || ''}
                onChange={(e) => handleInputChange('phosphorus', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="15 - 50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Potassium (ppm)</label>
              <input
                type="number"
                step="10"
                min="0"
                max="1000"
                value={soilData.potassium || ''}
                onChange={(e) => handleInputChange('potassium', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="100 - 400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organic Matter (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="20"
                value={soilData.organicMatter || ''}
                onChange={(e) => handleInputChange('organicMatter', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="2.0 - 8.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Moisture (%)</label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={soilData.moisture || ''}
                onChange={(e) => handleInputChange('moisture', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="40 - 80"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soil Texture</label>
              <select
                value={soilData.texture}
                onChange={(e) => handleInputChange('texture', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="clay">Clay</option>
                <option value="loam">Loam</option>
                <option value="sandy">Sandy</option>
                <option value="silt">Silt</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={soilData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Harare"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleGetRecommendations}
              disabled={loading}
              className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Getting AI Recommendations...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>{t.crops.getRecommendations}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">{error}</p>
          </div>
        )}

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                🤖 AI-Powered Crop Recommendations
              </h2>
              <span className="text-sm text-gray-500">
                Based on your soil analysis
              </span>
            </div>

            <div className="grid gap-6">
              {recommendations.map((recommendation, index) => (
                <div key={recommendation.id} className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          #{index + 1} {recommendation.cropName}
                        </h3>
                        {recommendation.variety && (
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {recommendation.variety}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{recommendation.reason}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Confidence:</span>
                          <span className={`font-semibold ${getConfidenceColor(recommendation.confidence)}`}>
                            {Math.round(recommendation.confidence * 100)}%
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Season:</span>
                          <span>{recommendation.seasonality || recommendation.plantingTime}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">Water:</span>
                          <span>{recommendation.waterRequirements}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      {recommendation.marketPrice && (
                        <div className="flex items-center mb-2">
                          <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                          <span className="text-sm font-medium">
                            ${recommendation.marketPrice}/tonne
                          </span>
                        </div>
                      )}
                      
                      <div className="text-sm">
                        <div className="font-medium text-gray-700">Expected Yield:</div>
                        <div className="text-green-600 font-semibold">{recommendation.expectedYield}</div>
                      </div>
                      
                      <div className="mt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getProfitabilityColor(recommendation.profitability)}`}>
                          {recommendation.profitability.charAt(0).toUpperCase() + recommendation.profitability.slice(1)} Profitability
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Soil Requirements:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {recommendation.soilRequirements.map((req, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {recommendation.plantingInstructions && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Planting Guide:</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div><strong>Spacing:</strong> {recommendation.plantingInstructions.spacing}</div>
                          <div><strong>Depth:</strong> {recommendation.plantingInstructions.depth}</div>
                          <div><strong>Fertilizer:</strong> {recommendation.plantingInstructions.fertilizer}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span><strong>Plant:</strong> {recommendation.plantingTime}</span>
                      <span><strong>Harvest:</strong> {recommendation.harvestTime}</span>
                      <span><strong>Water needs:</strong> {recommendation.waterRequirements}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && recommendations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-600 text-lg">🤖 AI is analyzing your soil conditions...</p>
            <p className="text-gray-500 text-sm">Generating personalized crop recommendations</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropRecommendations;