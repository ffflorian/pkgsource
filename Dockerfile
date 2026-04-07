FROM node:24-alpine

# Set working directory
WORKDIR /app

RUN apk add --no-cache curl

# Copy needed files
COPY . ./

# Install dependencies
RUN yarn install --immutable

# Build the backend (if needed)
RUN yarn build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["yarn", "start"]
