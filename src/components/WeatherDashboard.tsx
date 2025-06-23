import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer, 
  Eye, 
  MapPin,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Sprout
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { WeatherData } from '../types';
import { getChatResponse } from '../services/chatService';

const WeatherDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState('Harare, Zimbabwe');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [farmingAdvice, setFarmingAdvice] = useState<string>('');
  const [advisoryLoading, setAdvisoryLoading] = useState(false);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use OpenWeather API (free tier) or fallback to mock data
      const weatherApiKey = 'demo_key'; // In production, use real API key
      let weather: WeatherData;
      
      try {
        // Try to fetch real weather data
        weather = await fetchRealWeatherData(location, weatherApiKey);
      } catch (apiError) {
        console.log('Using enhanced mock weather data for demo...');
        weather = getEnhancedMockWeatherData(location);
      }
      
      setWeatherData(weather);
      
      // Generate AI farming advice based on weather
      await generateFarmingAdvice(weather);
      
    } catch (err: any) {
      console.error('Weather fetch error:', err);
      setError(err.message || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRealWeatherData = async (_location: string, _apiKey: string): Promise<WeatherData> => {
    // For demo purposes, we'll use mock data that looks like real API response
    // In production, uncomment below for real API:
    /*
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${_location}&appid=${_apiKey}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error('Weather API request failed');
    }
    
    const data = await response.json();
    return {
      date: new Date(),
      temperature: {
        min: data.main.temp_min,
        max: data.main.temp_max
      },
      humidity: data.main.humidity,
      rainfall: data.rain?.['1h'] || 0,
      windSpeed: data.wind.speed,
      condition: mapWeatherCondition(data.weather[0].main),
      location: data.name,
      description: data.weather[0].description,
      uvIndex: 6, // Would need separate UV API call
      forecast: await fetchForecastData(_location, _apiKey)
    };
    */
    
    throw new Error('API key not configured - using mock data');
  };

  const getEnhancedMockWeatherData = (location: string): WeatherData => {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1; // 1-12
    
    // Zimbabwe seasonal weather patterns
    let baseTemp, rainfall, humidity, condition;
    
    if (month >= 11 || month <= 3) {
      // Wet season
      baseTemp = { min: 18, max: 28 };
      rainfall = Math.random() * 15 + 5; // 5-20mm
      humidity = Math.random() * 20 + 70; // 70-90%
      condition = Math.random() > 0.4 ? 'rainy' : 'cloudy';
    } else if (month >= 4 && month <= 6) {
      // Early dry season
      baseTemp = { min: 12, max: 25 };
      rainfall = Math.random() * 3; // 0-3mm
      humidity = Math.random() * 15 + 50; // 50-65%
      condition = Math.random() > 0.7 ? 'cloudy' : 'sunny';
    } else {
      // Mid-late dry season
      baseTemp = { min: 8, max: 26 };
      rainfall = 0;
      humidity = Math.random() * 10 + 35; // 35-45%
      condition = 'sunny';
    }

    // Adjust for altitude (Harare is highland)
    if (location.toLowerCase().includes('harare')) {
      baseTemp.min -= 2;
      baseTemp.max -= 2;
    }

    const weatherData: WeatherData = {
      date: currentDate,
      temperature: baseTemp,
      humidity: Math.round(humidity),
      rainfall: Math.round(rainfall * 10) / 10,
      windSpeed: Math.round((Math.random() * 15 + 5) * 10) / 10, // 5-20 km/h
      condition: condition as 'sunny' | 'cloudy' | 'rainy' | 'stormy',
      location: location,
      description: getWeatherDescription(condition as string, baseTemp.max),
      uvIndex: condition === 'sunny' ? Math.round(Math.random() * 4 + 7) : Math.round(Math.random() * 3 + 3),
      forecast: generateMockForecast()
    };

    return weatherData;
  };

  const getWeatherDescription = (condition: string, maxTemp: number): string => {
    if (condition === 'rainy') return 'Light to moderate rainfall expected';
    if (condition === 'cloudy') return 'Partly cloudy with scattered clouds';
    if (maxTemp > 30) return 'Clear skies with high temperatures';
    return 'Clear skies with pleasant temperatures';
  };

  const generateMockForecast = () => {
    const forecast = [];
    for (let i = 1; i <= 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      forecast.push({
        date,
        temperature: {
          min: Math.round(Math.random() * 8 + 15),
          max: Math.round(Math.random() * 10 + 25)
        },
        condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)],
        humidity: Math.round(Math.random() * 30 + 50),
        rainfall: Math.random() * 10
      });
    }
    return forecast;
  };

  const generateFarmingAdvice = async (weather: WeatherData) => {
    setAdvisoryLoading(true);
    try {
      const weatherPrompt = `Based on this weather forecast for ${weather.location}, provide specific farming advice for Zimbabwe farmers:

CURRENT WEATHER:
- Temperature: ${weather.temperature.min}°C - ${weather.temperature.max}°C
- Humidity: ${weather.humidity}%
- Rainfall: ${weather.rainfall}mm
- Wind Speed: ${weather.windSpeed} km/h
- Condition: ${weather.condition}
- UV Index: ${weather.uvIndex}
- Date: ${weather.date.toLocaleDateString()}

Please provide:
1. Immediate farming activities recommended for today/this week
2. Crop protection advice based on current conditions
3. Irrigation recommendations
4. Pest and disease risks to watch for
5. Harvesting guidance if applicable
6. Soil management tasks suitable for these conditions

Consider Zimbabwe's agricultural calendar and current season. Be specific and actionable.`;

      const response = await getChatResponse(weatherPrompt, {
        questionCount: 1,
        topicsDiscussed: ['weather', 'farming_advice'],
        userExperienceLevel: 'intermediate',
        lastTopics: ['weather']
      });

      setFarmingAdvice(response.response);
    } catch (error) {
      console.error('Error generating farming advice:', error);
      setFarmingAdvice(getDefaultFarmingAdvice(weather));
    } finally {
      setAdvisoryLoading(false);
    }
  };

  const getDefaultFarmingAdvice = (weather: WeatherData): string => {
    const month = weather.date.getMonth() + 1;
    let advice = '';

    if (weather.rainfall > 10) {
      advice += "Heavy rainfall expected - avoid field operations and check drainage systems. ";
    } else if (weather.rainfall > 0) {
      advice += "Light rainfall is good for crops - consider reducing irrigation. ";
    } else {
      advice += "No rainfall expected - maintain irrigation schedules. ";
    }

    if (weather.temperature.max > 30) {
      advice += "High temperatures - provide shade for sensitive crops and increase watering frequency. ";
    }

    if (weather.humidity > 80) {
      advice += "High humidity increases disease risk - monitor crops for fungal infections. ";
    }

    if (month >= 11 || month <= 3) {
      advice += "Wet season activities: focus on planting summer crops and weed management.";
    } else {
      advice += "Dry season activities: harvest remaining crops and prepare land for next season.";
    }

    return advice;
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'cloudy':
        return <Cloud className="w-8 h-8 text-gray-500" />;
      case 'rainy':
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      case 'stormy':
        return <CloudRain className="w-8 h-8 text-purple-500" />;
      default:
        return <Sun className="w-8 h-8 text-yellow-500" />;
    }
  };

  const getUVLevel = (uvIndex?: number): { level: string; color: string } => {
    if (!uvIndex) return { level: 'Unknown', color: 'text-gray-500' };
    if (uvIndex <= 2) return { level: 'Low', color: 'text-green-600' };
    if (uvIndex <= 5) return { level: 'Moderate', color: 'text-yellow-600' };
    if (uvIndex <= 7) return { level: 'High', color: 'text-orange-600' };
    if (uvIndex <= 10) return { level: 'Very High', color: 'text-red-600' };
    return { level: 'Extreme', color: 'text-purple-600' };
  };

  const getFarmingAlert = (weather: WeatherData): { message: string; level: 'info' | 'warning' | 'danger' } | null => {
    if (weather.rainfall > 15) {
      return { message: 'Heavy rainfall warning - postpone field operations', level: 'warning' };
    }
    if (weather.temperature.max > 35) {
      return { message: 'Extreme heat - protect crops and livestock', level: 'danger' };
    }
    if (weather.humidity > 85) {
      return { message: 'High humidity - monitor for crop diseases', level: 'info' };
    }
    if (weather.rainfall === 0 && weather.temperature.max > 30) {
      return { message: 'Hot and dry conditions - increase irrigation', level: 'warning' };
    }
    return null;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">🌤️ Fetching weather data...</p>
          <p className="text-gray-500 text-sm">Getting current conditions for {location}</p>
        </div>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || 'Failed to load weather data'}</p>
          <button 
            onClick={fetchWeatherData}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const alert = getFarmingAlert(weatherData);
  const uvLevel = getUVLevel(weatherData.uvIndex);

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t.weather?.title || 'Weather Dashboard'}
          </h1>
          <p className="text-gray-600">
            {t.weather?.subtitle || 'Current weather conditions and farming guidance'}
          </p>
        </div>

        {/* Location Selector */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-4">
            <MapPin className="w-5 h-5 text-gray-500" />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Harare, Zimbabwe">Harare, Zimbabwe</option>
              <option value="Bulawayo, Zimbabwe">Bulawayo, Zimbabwe</option>
              <option value="Mutare, Zimbabwe">Mutare, Zimbabwe</option>
              <option value="Gweru, Zimbabwe">Gweru, Zimbabwe</option>
              <option value="Kwekwe, Zimbabwe">Kwekwe, Zimbabwe</option>
            </select>
            <button
              onClick={fetchWeatherData}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Update
            </button>
          </div>
        </div>

        {/* Farming Alert */}
        {alert && (
          <div className={`rounded-lg p-4 border-l-4 ${
            alert.level === 'danger' ? 'bg-red-50 border-red-500' :
            alert.level === 'warning' ? 'bg-yellow-50 border-yellow-500' :
            'bg-blue-50 border-blue-500'
          }`}>
            <div className="flex items-center">
              <AlertTriangle className={`w-5 h-5 mr-3 ${
                alert.level === 'danger' ? 'text-red-600' :
                alert.level === 'warning' ? 'text-yellow-600' :
                'text-blue-600'
              }`} />
              <p className={`font-medium ${
                alert.level === 'danger' ? 'text-red-800' :
                alert.level === 'warning' ? 'text-yellow-800' :
                'text-blue-800'
              }`}>
                {alert.message}
              </p>
            </div>
          </div>
        )}

        {/* Current Weather */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                {weatherData.location}
              </h2>
              <p className="text-gray-600 text-sm">
                {weatherData.date.toLocaleDateString()} • {weatherData.date.toLocaleTimeString()}
              </p>
              <p className="text-gray-600">{weatherData.description}</p>
            </div>
            <div className="text-center">
              {getWeatherIcon(weatherData.condition)}
              <p className="text-sm text-gray-600 mt-1 capitalize">{weatherData.condition}</p>
            </div>
          </div>

          {/* Weather Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Thermometer className="w-5 h-5 text-orange-600 mr-2" />
                <span className="font-medium text-gray-700">Temperature</span>
              </div>
              <p className="text-lg font-semibold text-orange-700">
                {weatherData.temperature.min}°C - {weatherData.temperature.max}°C
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Droplets className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium text-gray-700">Humidity</span>
              </div>
              <p className="text-lg font-semibold text-blue-700">{weatherData.humidity}%</p>
            </div>

            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CloudRain className="w-5 h-5 text-indigo-600 mr-2" />
                <span className="font-medium text-gray-700">Rainfall</span>
              </div>
              <p className="text-lg font-semibold text-indigo-700">{weatherData.rainfall}mm</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Wind className="w-5 h-5 text-gray-600 mr-2" />
                <span className="font-medium text-gray-700">Wind Speed</span>
              </div>
              <p className="text-lg font-semibold text-gray-700">{weatherData.windSpeed} km/h</p>
            </div>
          </div>

          {/* UV Index */}
          {weatherData.uvIndex && (
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Eye className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="font-medium text-gray-700">UV Index</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-purple-700">{weatherData.uvIndex}</p>
                  <p className={`text-sm font-medium ${uvLevel.color}`}>{uvLevel.level}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5-Day Forecast */}
        {weatherData.forecast && weatherData.forecast.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              5-Day Forecast
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {weatherData.forecast.map((day, index) => (
                <div key={index} className="border rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                  <p className="font-medium text-gray-900 mb-2">
                    {day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <div className="mb-2">
                    {getWeatherIcon(day.condition)}
                  </div>
                  <p className="text-sm text-gray-600 mb-1 capitalize">{day.condition}</p>
                  <p className="font-semibold text-gray-900">
                    {day.temperature.min}° - {day.temperature.max}°
                  </p>
                  <p className="text-xs text-gray-500">
                    💧 {Math.round(day.rainfall)}mm • 💨 {day.humidity}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Farming Advice */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-l-4 border-green-500">
          <h3 className="text-xl font-semibold text-green-800 mb-3 flex items-center">
            <Sprout className="w-5 h-5 mr-2" />
            🤖 AI Farming Advisory
          </h3>
          
          {advisoryLoading ? (
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              <span className="text-green-700">Generating personalized farming advice...</span>
            </div>
          ) : (
            <div className="text-green-700 space-y-2">
              {farmingAdvice.split('\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <p key={index} className="leading-relaxed">
                    {paragraph.trim()}
                  </p>
                )
              ))}
            </div>
          )}
          
          <button
            onClick={() => generateFarmingAdvice(weatherData)}
            disabled={advisoryLoading}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Refresh Advice</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;