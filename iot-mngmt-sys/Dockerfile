from node:22-alpine as builder


WORKDIR /app
COPY ./iot-mngmt-sys/package*.json .
RUN npm install

COPY ./iot-mngmt-sys .
RUN npm run build

FROM node:22-alpine as runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

EXPOSE 5000
CMD ["node", "dist/main"]
