FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM dependencies AS build
COPY . .
ARG APP
RUN npx nest build ${APP}

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
ARG APP
ENV APP_NAME=${APP}
CMD ["sh", "-c", "node dist/apps/${APP_NAME}/main.js"]
