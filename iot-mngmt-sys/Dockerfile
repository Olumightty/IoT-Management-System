FROM node:22-alpine AS builder


WORKDIR /app
COPY ./iot-mngmt-sys/package*.json .
RUN npm install

COPY ./iot-mngmt-sys .
RUN npm run build

FROM node:22-alpine As runner
WORKDIR /app

COPY ./iot-mngmt-sys/package*.json .
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 5000
CMD ["node", "dist/main"]
