FROM node:20-slim AS build

RUN npm install -g pnpm && \
    apt-get update && \
    apt-get install -y git

WORKDIR /app

COPY docs/api/package.json docs/api/pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY docs/api .

RUN pnpm run build

FROM alpine:latest

RUN apk add --no-cache nginx

COPY --from=build /app/.vitepress/dist /usr/share/nginx/html
COPY --from=build /app/static /usr/share/nginx/html/static
COPY --from=build /app/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]