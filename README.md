# SalahMap

![SalahMap](https://img.shields.io/badge/SalahMap-1.0.0-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15.2.3-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📍 Overview

**SalahMap** is an interactive web application that displays Salah (prayer) times on a world map. Users can search by city and country or drag a map marker to instantly view prayer times for any location worldwide.

## 🌟 Features

- 🗺 **Interactive Map Interface** – Drag markers to get live Salah times  
- 🔍 **Location Search** – Find prayer times by city, state, and country  
- 📱 **Responsive Design** – Optimized for desktop and mobile  
- 🕒 **Real-Time Updates** – Fetches accurate prayer times for the selected location  
- 🌐 **Visual Time Zones** – Color-coded regions show time zone differences  
- 🎨 **Clean UI** – Simple, intuitive, and user-friendly interface  

##  Demo

Check out the live demo:  
👉 [SalahMap Live App](https://salah-time-map-dahirali3823-dahir-alis-projects.vercel.app/)

![SalahMap Screenshot](/salah-time-map/public/salahmap-screenshot.png)

## 🛠️ Technologies Used

- **Frontend**: [Next.js 15](https://nextjs.org/), [React](https://reactjs.org/), [TailwindCSS](https://tailwindcss.com/)  
- **APIs**: [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/overview), [Aladhan Prayer Times API](https://aladhan.com/prayer-times-api)  
- **Deployment**: [Vercel](https://vercel.com/)



## 🚀 Usage

### Map Interaction

- **Draggable Marker**: Move the marker on the map to any location. Clicking it fetches and displays the corresponding prayer times.  
- **Location Search**: Enter the city, state, and country in the input fields and click search to get Salah times in a table view.

### Prayer Time Processing

- Prayer times are retrieved using the [Aladhan API](https://aladhan.com/prayer-times-api).  
- If coordinates are selected, the **by latitude and longitude** endpoint is used.  
- Otherwise, it defaults to the **by city,state and country** endpoint.

## 📚 API Reference

**SalahMap** uses the following Aladhan API endpoints:

- **By City**:  
  `https://api.aladhan.com/v1/timingsByCity`

- **By Coordinates**:  
  `https://api.aladhan.com/v1/timings`

Responses include precise prayer timings and location metadata, which are parsed and displayed in the app.

## 🚀 Deployment

This project is deployed via [Vercel](https://vercel.com/).
