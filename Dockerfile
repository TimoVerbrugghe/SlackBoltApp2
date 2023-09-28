# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the app source code into the container
COPY . .

# Expose a port that the app will listen on
EXPOSE 3000

# Define the command to run your app when the container starts
CMD ["node", "app.js"]