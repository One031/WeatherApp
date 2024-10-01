import express from "express"; // Import the express module
import bodyParser from "body-parser"; // Import body-parser to parse incoming request bodies
import axios from "axios"; // Import axios for making HTTP requests
import { configDotenv } from "dotenv"; // Import dotenv for environment variable management
configDotenv(); // Load environment variables from .env file

const app = express(); // Create an instance of an Express application
const port = 3000; // Define the port number for the server

// API URLs for geographic and weather data
const API_URLGEO = "http://api.openweathermap.org/geo/1.0"; // Geo API endpoint
const API_URLWEATHER = "http://api.openweathermap.org/data/2.5/"; // Weather API endpoint
const API_Key = process.env.API_Key; // Retrieve API key from environment variables

// Middleware to serve static files from the "public" directory
app.use(express.static("public"));
// Middleware to parse URL-encoded bodies (form submissions)
app.use(bodyParser.urlencoded({ extended: true }));

// Route for the root URL
app.get("/", (req, res) => {
    // Render the index.ejs view with initial content
    res.render("index.ejs", { content: "Waiting for data.." });
});

// Route to handle the form submission
app.post("/search-name", async (req, res) => {
    try {
        const name = req.body.name; // Get the name from the form submission
        // Make a request to the Geo API to get location data based on the name
        const resultGEO = await axios.get(API_URLGEO + "/direct?q=" + name + "&appid=" + API_Key);
        const location = resultGEO.data[0]; // Extract the first location from the response
        const lon = location.lon; // Get longitude
        const lat = location.lat; // Get latitude
        const cityName = location.name; // Get city name

        // Make a request to the Weather API to get weather data using latitude and longitude
        const resultWEATHER = await axios.get(API_URLWEATHER + "forecast?lat=" + lat + "&lon=" + lon + "&appid=" + API_Key + "&units=metric");
        const weather = resultWEATHER.data.list[0]; // Get the first weather forecast
        const temperature = weather.main.temp; // Get temperature
        const humidity = weather.main.humidity; // Get humidity
        const icon = weather.weather[0].icon; // Get weather icon
        const wind = weather.wind.speed; // Get wind speed

        // Render the index.ejs view with the retrieved weather data
        res.render("index.ejs", { content: { city: cityName, temp: Math.round(temperature), humid: humidity, icon1: icon, wind1: wind } });
        console.log("Retrieved data", { city: cityName, temp: temperature, humid: humidity, icon1: icon, wind1: wind });

    } catch (error) {
        console.error("Error retrieving data:", error); // Log error details

        // Construct an error message to display to the user
        let errorMessage = "An error occurred while retrieving data.";
        if (error.response) {
            errorMessage += ` Error: ${JSON.stringify(error.response.data)}`; // Include error response
        } else if (error.request) {
            errorMessage += " The request was made but no response was received."; // No response received
        } else {
            errorMessage += ` Error: ${error.message}`; // General error message
        }
        // Render the index.ejs view with the error message
        res.render("index.ejs", { content: errorMessage });
    }
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server running on port: ${port}`); // Log the server status
});
