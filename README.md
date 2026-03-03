# URL Shortener & Monitor

A full-stack URL shortening and monitoring system built with the MEAN stack (MongoDB, Express, Angular, Node.js).

## Features
- Shorten long URLs into short, shareable links
- Track visits per URL (IP, country, timestamp)
- View statistics per URL including access count, countries, and daily frequency chart

## Tech Stack
- **MongoDB** - Database
- **Express.js** - Backend API
- **Angular** - Frontend
- **Node.js** - Runtime

## Setup
### Prerequisites
- MongoDB
- Express
- Angular CLI
- Node.js 

### Installation
```bash
# Clone the repo
git clone git@github.com:danjimenezcr/url-shortener.git #Only works if you got a SSH

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Run locally
```bash
# Backend
cd backend
node server.js

# Frontend
cd frontend
ng serve
```

## Author
Danny Jimenez
Valeria Cascante