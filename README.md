# Kalyke - Model Designs Hub

Welcome to Kalyke, your ultimate destination for exceptional model designs crafted by designers, for designers. Our platform offers unbeatable deals on stunning models, empowering web developers, UI/UX designers, and anyone seeking to elevate their design projects.

## Backend Dependencies
- **axios:** ^1.6.2
- **bcryptjs:** ^2.4.3
- **body-parser:** ^1.20.2
- **cors:** ^2.8.5
- **crypto:** ^1.0.1
- **dotenv:** ^16.3.1
- **ejs:** ^3.1.9
- **express:** ^4.18.2
- **firebase-admin:** ^11.11.0
- **google-auth-library:** ^9.1.0
- **jsonwebtoken:** ^9.0.1
- **mongoose:** ^7.4.3
- **multer:** ^1.4.5-lts.1
- **nodemailer:** ^6.9.6
- **nodemon:** ^3.0.1
- **socket.io:** ^4.7.2
- **stripe:** ^14.7.0
- **uuid:** ^9.0.1

## How to Start and Build the App Locally
- For starting, use `npm start`.
- For building, use `npm run dev`.

## How to Update Constants
![image](https://github.com/hamsterNotSloth/kalykebackendv1/assets/113926529/567511fe-195e-40f1-88c3-6048e5ee9c86)

You can update the constants as needed and then rebuild the app using `npm run build`. After pushing the code to GitHub, restart the EC2 instance, reconnect it, and restart the server.

### Commands for Restarting the Server (Windows)
```powershell
# Open Windows PowerShell,
# Connect to EC2
cd app
cd kalykefrontendv1
git pull
cd ../
cd kalykebackendv1
pm2 start ./src/index.js --name kalyke
