# Use the official Node.js image as the base image
FROM node

# Set the working directory in the container
WORKDIR /app

# Copy the application files into the working directory
COPY . /app

COPY package*.json ./
COPY views /app/views
COPY public /app/public

# Install the application dependencies
RUN npm install

EXPOSE 3000

# Use a larger timeout value for Git operations
RUN git config --global http.lowSpeedLimit 0
RUN git config --global http.lowSpeedTime 999999


# Define the entry point for the container
CMD ["node", "app.js"]


