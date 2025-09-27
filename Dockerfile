FROM node:20-slim AS build

RUN npm install -g pnpm && \
    apt-get update && \
    apt-get install -y git

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_API_ENV
ENV VITE_API_ENV=$VITE_API_ENV

RUN pnpm run build

FROM alpine:latest

RUN apk add --no-cache nginx

COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]