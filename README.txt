# Freelancer Portfolio - Experiment 10

## Requirements
- Node.js and npm
- MongoDB Community Server running locally

## Setup
1. Open this folder in VS Code.
2. Open a terminal in this folder.
3. Install packages:
   ```bash
   npm install
   ```
4. Make sure MongoDB is running.
5. Start the application:
   ```bash
   npm start
   ```
6. Open **http://localhost:6000** in your browser.

## What it does
- Serves the existing Freelancer Portfolio page using Express.
- Receives registration form data through `POST /api/register`.
- Stores registrations in the `freelancer_portfolio` database, `registrations` collection.
- Retrieves saved registrations through `GET /api/registrations`.
- Passwords are hashed before storage and are not returned to the browser.

## Useful checks
- Server health: http://localhost:6000/api/health
- MongoDB database: `freelancer_portfolio`
- Collection: `registrations`

Do not open index.html directly with file://. Run the Node.js server and visit localhost:6000.
