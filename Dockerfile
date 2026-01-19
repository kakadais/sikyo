# ==========================================
# 1. BUILD STAGE
# ==========================================
# Use Node 20 directly simplifies things since Meteor 3 runs on Node 20
FROM node:20-bookworm as build

# Install Meteor (Meteor 3 requires --release argument or it defaults to 2.x/3.0-alpha)
# We simply invoke the install script.
ENV METEOR_ALLOW_SUPERUSER=true
RUN curl https://install.meteor.com/ | sh

# Copy package files
WORKDIR /opt/src
COPY package*.json ./

# Install npm dependencies
RUN meteor npm ci

# Copy source files
COPY . .

# Build the Meteor application
# This creates a tarball at /opt/meteor/dist/app.tar.gz
RUN meteor build --directory /opt/meteor/dist --server-only

# ==========================================
# 2. RUN STAGE
# ==========================================
FROM node:20-alpine

# Environment variables
ENV APP_BUNDLE_FOLDER /opt/meteor/dist/bundle
ENV BUILD_SCRIPTS_FOLDER /opt/meteor/dist/bundle/programs/server

# Install build dependencies for native modules if needed (python/make/g++)
RUN apk add --no-cache python3 make g++

# Copy the built bundle from the build stage
COPY --from=build $APP_BUNDLE_FOLDER /app

# Install production dependencies
WORKDIR /app/programs/server
RUN npm install --production

# Return to app root
WORKDIR /app

# Start the application
CMD ["node", "main.js"]
