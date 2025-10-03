# Use Node.js as the base image
FROM node:22.20.0

# Set working directory
WORKDIR /src

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app source code
COPY . .

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Run database migrations and start app
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
