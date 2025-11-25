import React, { useState, useCallback } from "react";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import './App.css';

const API_KEY = '2f1d794d66129953b23f349d83acce32';

// Cache implementation
const createCache = (maxAge = 10 * 60 * 1000) => { // 10 minutes cache
  return {
    get: (key) => {
      try {
        const item = localStorage.getItem(key);
        if (!item) return null;
        
        const { value, timestamp } = JSON.parse(item);
        if (Date.now() - timestamp > maxAge) {
          localStorage.removeItem(key);
          return null;
        }
        return value;
      } catch {
        return null;
      }
    },
    set: (key, value) => {
      try {
        const item = JSON.stringify({
          value,
          timestamp: Date.now()
        });
        localStorage.setItem(key, item);
      } catch (error) {
        console.warn('Cache set failed:', error);
      }
    }
  };
};

const cache = createCache();

const App = () => {
  const [city, setCity] = useState("");
  const [temperature, setTemperature] = useState(null);
  const [description, setDescription] = useState("");
  const [windSpeed, setWindSpeed] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [feelsLike, setFeelsLike] = useState(null);
  const [date, setDate] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastSearchedCity, setLastSearchedCity] = useState("");

  const handleSearch = useCallback(async (cityName) => {
    if (loading) return;
    
    const searchTerm = cityName.trim();
    if (!searchTerm) {
      setErrorMessage("Please enter a city name");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setLastSearchedCity(searchTerm);

    try {
      // Check cache first
      const cacheKey = `weather_${searchTerm.toLowerCase()}`;
      const cachedData = cache.get(cacheKey);
      
      if (cachedData) {
        // Use cached data
        const data = cachedData;
        updateWeatherData(data, searchTerm);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${searchTerm}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.cod === 200) {
        // Cache the successful response
        cache.set(cacheKey, data);
        updateWeatherData(data, searchTerm);
      } else {
        throw new Error(data.message || "City not found");
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setErrorMessage(
        error.message === "City not found" 
          ? "City not found. Please try again." 
          : "Failed to fetch weather data. Please check your connection and try again."
      );
      setHasSearched(false);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const updateWeatherData = (data, searchTerm) => {
    setCity(`${data.name}, ${data.sys.country}`);
    setTemperature(Math.round(data.main.temp));
    setDescription(data.weather[0].description);
    setWindSpeed(data.wind.speed);
    setHumidity(data.main.humidity);
    setFeelsLike(Math.round(data.main.feels_like));

    const currentDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    setDate(currentDate);
    setHasSearched(true);
  };

  const clearCache = () => {
    // Clear all weather cache
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('weather_')) {
        localStorage.removeItem(key);
      }
    });
    if (lastSearchedCity) {
      handleSearch(lastSearchedCity); // Refresh current city
    }
  };

  return (
    <div className="weather-container">
      <div className="weather-app">
        <div className="app-header">
          <h1>🌤 Weather Forecast</h1>
          <p className="app-subtitle">Get accurate weather information for any city</p>
        </div>
        
        <SearchBar onSearch={handleSearch} loading={loading} />
        
        {errorMessage && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            {errorMessage}
          </div>
        )}
        
        {loading && (
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <span>Loading weather data...</span>
          </div>
        )}
        
        {hasSearched && !loading && (
          <>
            <WeatherCard
              city={city}
              date={date}
              temperature={temperature}
              description={description}
              windSpeed={windSpeed}
              humidity={humidity}
              feelsLike={feelsLike}
            />
            <button className="clear-cache-btn" onClick={clearCache}>
              <i className="fas fa-sync-alt"></i> Refresh Data
            </button>
          </>
        )}
        
        {!hasSearched && !loading && !errorMessage && (
          <div className="welcome-message">
            <i className="fas fa-search-location"></i>
            <h3>Search for a City</h3>
            <p>Enter a city name above to get current weather information</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;