FROM node:24-alpine@sha256:d1b3b4da11eefd5941e7f0b9cf17783fc99d9c6fc34884a665f40a06dbdfc94f

# Set working directory
WORKDIR /app

RUN apk add --no-cache curl=8.17.0-r1

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
