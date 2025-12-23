# YouTube Clone

This project is a full-stack YouTube clone built with the MERN stack (MongoDB, Express, React, Node.js). It includes features such as user authentication, video uploading, playback, commenting, and liking. The application is fully responsive, ensuring a seamless experience across both desktop and mobile devices.

## Technolgies Used

- Vite + React
- React Router
- React Redux
- Redux-toolkit
- Axios
- Tailwind CSS

- Node.js
- Express.js
- MongoDB
- Mongoose

- Multer
- Cloudinary

- Jwt
- Bycrypt

## Screenshots


![alt text](<public/assetGitHub/screenshot.png>)


## Features

- Authentication - realtime email validation 
- CRUD functionality in videos, comments, and users
- Like/Dislike, views count 
- Video upload with thumbnail 
- Channel Subscriptions

## Conclusion

By developing this project, we have acquired a deeper understanding of various web development concepts and technologies, including front-end development with React, back-end development with Express and Node.js, database management with MongoDB. We have also learned how to address common challenges in web application development, such as scalability, performance optimization, and security.

## Installation
1. Clone the repository: `git clone
2. Navigate to the project directory: `cd viewtube`
3. Install dependencies for the server: `npm install`
4. Install dependencies for the frontend: `cd ./UserInterface && npm install`
5. Create a `.env` file in the root directory and add the following environment variables:
   ``` 
   PORT=5000
   MONGO_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret

   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=your_access_token_expiry_time
   ```
6. Start the server: `npm run dev`
7. Start the frontend: `cd ./UserInterface && npm run dev`
8. Open your browser and navigate to `http://localhost:5173/` to view the application



 ### License
Icons by Google, licensed under the Apache License 2.0.
See: https://www.apache.org/licenses/LICENSE-2.0
