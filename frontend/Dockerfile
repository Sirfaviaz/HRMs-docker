# Build stage
FROM node:14 as build

# Set working directory.
WORKDIR /app

# Install dependencies.
COPY package.json package-lock.json ./
RUN npm install --no-progress

# Copy project files and build.
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files to nginx html directory.
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80.
EXPOSE 80

# Run nginx.
CMD ["nginx", "-g", "daemon off;"]
 
