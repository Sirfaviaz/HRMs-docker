# Build stage
FROM node:14 AS build

# Increase Node.js memory limit
ENV NODE_OPTIONS="--max_old_space_size=2048"

# Set working directory.
WORKDIR /app

# Install dependencies.
COPY package.json package-lock.json ./
RUN npm install --no-progress

# Address dependency warnings
RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object

# Copy project files and build.
COPY . .
# Disable source maps to reduce memory usage
ENV GENERATE_SOURCEMAP=false
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files to nginx html directory.
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80.
EXPOSE 80

# Run nginx.
CMD ["nginx", "-g", "daemon off;"]
