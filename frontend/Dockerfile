# Build stage
FROM node:18 AS build

# Set working directory.
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache.
COPY package.json package-lock.json ./

# Install dependencies.
RUN npm install --no-progress

# Copy the rest of the project files.
COPY . .

# Build the project.
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Copy built files to nginx html directory.
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80.
EXPOSE 80

# Run nginx.
CMD ["nginx", "-g", "daemon off;"]
