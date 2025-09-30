# --- build stage ---
FROM node:20-bullseye AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

COPY --from=builder /app/dist/ ./

COPY nginx.conf /etc/nginx/nginx.conf

ENV ENV_API_BASE_URL=http://localhost:8080

EXPOSE 80

CMD sh -c "sed -i 's|\\$env_api_base_url|'\"$ENV_API_BASE_URL\"'|g' /etc/nginx/nginx.conf && nginx -g 'daemon off;'"
