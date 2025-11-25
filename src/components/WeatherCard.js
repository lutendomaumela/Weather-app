import React from "react";
import './WeatherCard.css';

const WeatherCard = ({ city, date, temperature, description, windSpeed }) => {
  // Function to map weather descriptions to icons
  const getWeatherIcon = (description) => {
    if (description.includes("cloud")) return "☁️";
    if (description.includes("rain")) return "🌧️";
    if (description.includes("clear")) return "☀️";
    return "🌤"; // Default icon
  };

  return (
    <div className="weather-card">
      <h3>{city}</h3>
      <p>{date}</p>
      <div className="icon">{getWeatherIcon(description)}</div>
      <div className="temperature">{temperature}°C</div>
      <p className="description">{description}</p>
      <div className="wind">
        <span role="img" aria-label="wind">🌬️</span> 
        <span>{windSpeed} m/s</span>
      </div>
    </div>
  );
};

export default WeatherCard;

