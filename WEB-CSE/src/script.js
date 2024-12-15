const apiKey = "6dab4d0a58c5bd0e7cc08e08829a5f3b";
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const currentWeather = document.getElementById('currentWeather');
const cityName = document.getElementById('cityName');
const weatherDescription = document.getElementById('weatherDescription');
const temp = document.getElementById('temp');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const forecast = document.getElementById('forecast');
const forecastCards = document.getElementById('forecastCards');
const loadingSpinner = document.getElementById('loadingSpinner');
const wishlistBtn = document.getElementById('addToWishlist');
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || []; // Retrieve wishlist from localStorage

const commonCities = ["Pune", "Patna", "Mumbai","Dhanbad","Delhi","Goa"]; // Default common cities

// Render default weather for common cities
async function renderCommonCitiesWeather() {
  const wishlistContainer = document.getElementById("wishlistWeather");
  wishlistContainer.innerHTML = ""; // Clear previous content

  for (const city of commonCities) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
      );

      if (!response.ok) throw new Error(`Weather data not available for ${city}`);

      const data = await response.json();

      // Create a card for each city weather
      const cityCard = `
        <div class="city-weather-card">
          <h3>${city}</h3>
          <p>${data.main.temp}°C - ${data.weather[0].description}</p>
          <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon" />
        </div>
      `;

      wishlistContainer.innerHTML += cityCard;
    } catch (error) {
      console.error(error.message);
      wishlistContainer.innerHTML += `<div class="city-weather-card"><h3>${city}</h3><p>Weather unavailable</p></div>`;
    }
  }
}

// Call function to load common cities weather when the page loads
document.addEventListener("DOMContentLoaded", () => {
  renderCommonCitiesWeather(); // Load default wishlist cities' weather
  loadWishlistPage(); // Load user wishlist
});

// Keep the rest of your original code intact...


// Event listener for search button
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) {
    showLoading(true); // Show the loading spinner
    getWeather(city);
    getForecast(city);
  } else {
    alert("Please enter a city name.");
  }
});

// Function to show loading spinner
const showLoading = (isLoading) => loadingSpinner.style.display = isLoading ? 'block' : 'none';

// Function to update the background based on weather condition
function updateBackground(weatherCondition) {
  const currentWeatherDiv = document.getElementById('idk');

  // Define different backgrounds for various weather conditions
  if (weatherCondition === "Clear") {
    currentWeatherDiv.style.backgroundImage = "url('clear-sky.jpg')";
  } else if (weatherCondition === "Rain") {
    currentWeatherDiv.style.backgroundImage = "url('rainy.jpg')";
  } else if (weatherCondition === "Clouds") {
    currentWeatherDiv.style.backgroundImage = "url('cloudy.jpg')";
  } else if (weatherCondition === "Snow") {
    currentWeatherDiv.style.backgroundImage = "url('snowy.jpg')";
  } else if (weatherCondition === "Thunderstorm") {
    currentWeatherDiv.style.backgroundImage = "url('stormy.jpg')";
  } else if (weatherCondition === "Haze") {
    currentWeatherDiv.style.backgroundImage = "url('haze.jpg')";
  } else if (weatherCondition === "Mist") {
    currentWeatherDiv.style.backgroundImage = "url('mist.jpg')";
  } else {
    currentWeatherDiv.style.backgroundImage = "url('default.jpg')";
  }
  currentWeatherDiv.style.backgroundSize = "cover"; // Ensure the background covers the whole div
}

// Fetch current weather data
async function getWeather(city) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
    if (!response.ok) throw new Error("City not found!");

    const data = await response.json();
    updateWeatherUI(data);
  } catch (error) {
    alert(error.message);
    showLoading(false); // Hide the loading spinner if there's an error
  }
}

// Update UI with current weather data
function updateWeatherUI(data) {
  currentWeather.style.display = 'block';
  cityName.textContent = data.name;
  weatherDescription.textContent = data.weather[0].description;
  temp.textContent = `${data.main.temp}`;
  humidity.textContent = `${data.main.humidity}`;
  windSpeed.textContent = `${data.wind.speed}`;
  
  // Update the background based on the weather condition
  updateBackground(data.weather[0].main);
  
  showLoading(false); // Hide the loading spinner after data is fetched
}

// Fetch 5-day forecast data
async function getForecast(city) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`);
    if (!response.ok) throw new Error("Unable to fetch forecast!");

    const data = await response.json();
    updateForecastUI(data);
  } catch (error) {
    alert(error.message);
    showLoading(false); // Hide the loading spinner if there's an error
  }
}

// Update UI with 5-day forecast data
function updateForecastUI(data) {
  forecast.style.display = 'block';
  forecastCards.innerHTML = ''; // Clear previous forecast cards

  const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));

  dailyData.forEach(day => {
    const date = new Date(day.dt_txt).toLocaleDateString();
    const temp = day.main.temp;
    const icon = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;

    const card = `
      <div class="card">
        <div class="card-body text-center">
          <p>${date}</p>
          <img src="${icon}" alt="weather-icon">
          <p>${temp}°C</p>
        </div>
      </div>
    `;
    forecastCards.innerHTML += card;
  });
}

// Function to toggle city in wishlist
function toggleWishlist(city) {
  const cityIndex = wishlist.indexOf(city);
  if (cityIndex !== -1) {
    wishlist.splice(cityIndex, 1);  // Remove city from wishlist
    alert(`${city} removed from Wishlist!`);
  } else {
    wishlist.push(city);  // Add city to wishlist
    alert(`${city} added to Wishlist!`);
  }

  // Save updated wishlist to localStorage
  localStorage.setItem('wishlist', JSON.stringify(wishlist));

  // Update the heart icon and refresh UI
  updateHeartIcon(city);
  loadWishlistPage();
}

// Function to update heart icon based on wishlist state
function updateHeartIcon(city) {
  if (!city) return; // Guard clause to prevent updating when no city is selected

  // Check if the city is in the wishlist
  const isInWishlist = wishlist.includes(city);

  // Update the class based on the wishlist state
  if (isInWishlist) {
    wishlistBtn.classList.add('clicked'); // Add red color class
  } else {
    wishlistBtn.classList.remove('clicked'); // Remove red color class
  }
}

// Function to load and display wishlist
// Function to load and display wishlist
// Function to load and display wishlist
function loadWishlistPage() {
    const wishlistCities = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishlistContainer = document.getElementById('wishlistList');
    wishlistContainer.innerHTML = ''; // Clear the wishlist container
  
    if (wishlistCities.length === 0) {
      wishlistContainer.innerHTML = '<p>No cities in your wishlist.</p>';
    } else {
      wishlistCities.forEach((city, index) => {
        // Create a div for each city
        const cityDiv = document.createElement('div');
        cityDiv.classList.add('city-item');
        
        // Add city name
        const cityName = document.createElement('span');
        cityName.textContent = city;
        
        // Add remove icon
        const removeBtn = document.createElement('i');
        removeBtn.classList.add('bi', 'bi-trash', 'remove-icon');
        removeBtn.style.cursor = 'pointer'; // Change cursor to pointer
        removeBtn.title = 'Remove'; // Tooltip when hovering
        removeBtn.addEventListener('click', () => removeCityFromWishlist(index));
  
        // Append city name and remove icon to the div
        cityDiv.appendChild(cityName);
        cityDiv.appendChild(removeBtn);
        
        // Append the div to the wishlist container
        wishlistContainer.appendChild(cityDiv);
      });
    }
  }
  
  // Function to remove a city from the wishlist
  function removeCityFromWishlist(index) {
    const wishlistCities = JSON.parse(localStorage.getItem('wishlist')) || [];
    const removedCity = wishlistCities.splice(index, 1); // Remove the city at the given index
  
    // Update the local storage and refresh the wishlist display
    localStorage.setItem('wishlist', JSON.stringify(wishlistCities));
    loadWishlistPage();
  
    alert(`${removedCity} has been removed from your wishlist.`);
  }
  
// Ensure wishlist state is reflected correctly on page load
document.addEventListener('DOMContentLoaded', () => {
  loadWishlistPage();

  const currentCity = cityName.textContent;
  if (currentCity) {
    updateHeartIcon(currentCity);
  }
});

// Event listener for Add to Wishlist button (heart icon)
wishlistBtn.addEventListener('click', () => {
  const city = cityName.textContent; // Get city name from current weather
  if (city) {
    toggleWishlist(city); // Toggle the city in wishlist
  } else {
    alert("City not found. Please search for a city first.");
  }
});

document.addEventListener('DOMContentLoaded', () => {
    // Load Wishlist and Initialize Menu
    loadWishlistPage();
  
    const currentCity = cityName.textContent;
    if (currentCity) {
      updateHeartIcon(currentCity);
    }
  
    // Add functionality to Wishlist link in the navbar
    const wishlistMenuLink = document.querySelector('a[href="#wishlist"]');
    wishlistMenuLink.addEventListener('click', (event) => {
      event.preventDefault();
      showWishlistDropdown();
    });
  });
  
  // Function to show wishlist dropdown in the navbar
  function showWishlistDropdown() {
    const dropdown = document.createElement('div');
    dropdown.classList.add('wishlist-dropdown');
    const wishlistCities = JSON.parse(localStorage.getItem('wishlist')) || [];
  
    if (wishlistCities.length === 0) {
      dropdown.innerHTML = '<p>No cities in your wishlist.</p>';
    } else {
      wishlistCities.forEach(city => {
        const cityItem = document.createElement('a');
        cityItem.href = '#';
        cityItem.textContent = city;
        cityItem.classList.add('wishlist-city');
        cityItem.addEventListener('click', () => {
          getWeather(city); // Fetch and display weather for the clicked city
          getForecast(city); // Fetch and display the forecast as well
        });
        dropdown.appendChild(cityItem);
      });
    }
  
    // Ensure previous dropdowns are removed before adding a new one
    removeExistingDropdown();
    document.querySelector('.navbar').appendChild(dropdown);
  }
  
  // Function to remove any existing wishlist dropdown
  function removeExistingDropdown() {
    const existingDropdown = document.querySelector('.wishlist-dropdown');
    if (existingDropdown) {
      existingDropdown.remove();
    }
  }
  
  // Ensure dropdown closes when clicking elsewhere
  document.addEventListener('click', (event) => {
    const dropdown = document.querySelector('.wishlist-dropdown');
    if (dropdown && !event.target.closest('.wishlist-dropdown') && !event.target.closest('a[href="#wishlist"]')) {
      dropdown.remove();
    }
  });
  
