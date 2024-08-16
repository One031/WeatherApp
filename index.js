import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { configDotenv } from "dotenv";
configDotenv();

const app = express();
const port = 3000;

const API_URLGEO = "http://api.openweathermap.org/geo/1.0";
const API_URLWEATHER  = "http://api.openweathermap.org/data/2.5/";
const API_Key = process.env.API_Key;



app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.render("index.ejs",{ content: "Waiting for data.." } );
});

app.post("/search-name", async (req, res) => {
    try {
        const name = req.body.name;
        const resultGEO = await axios.get(API_URLGEO + "/direct?q=" + name + "&appid=" + API_Key );
        const location = resultGEO.data[0];
        const lon = location.lon;
        const lat = location.lat;
        const cityName = location.name;
        const resultWEATHER = await axios.get(API_URLWEATHER + "forecast?lat=" + lat + "&lon=" +  lon + "&appid=" + API_Key + "&units=metric");
        const weather = resultWEATHER.data.list[0];
        const temperature = weather.main.temp;
        const humidity = weather.main.humidity;
        const icon = weather.weather[0].icon;
        const wind = weather.wind.speed;


        res.render("index.ejs", {content: {city: cityName, temp: Math.round(temperature), humid: humidity, icon1: icon,  wind1: wind }});
        console.log("Retrieved data", {city: cityName, temp: temperature, humid: humidity, icon1: icon,  wind1: wind } );

    } catch (error) {
        console.error("Error retrieving data:", error);

        let errorMessage = "An error occurred while retrieving data.";
        if (error.response) {
            errorMessage += ` Error: ${JSON.stringify(error.response.data)}`;
        } else if (error.request) {
            errorMessage += " The request was made but no response was received.";
        } else {
            errorMessage += ` Error: ${error.message}`;
        }
        res.render("index.ejs", { content: errorMessage });
    }
});



app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});