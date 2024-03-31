FROM node:20-alpine AS build

WORKDIR /build
COPY . .
RUN npm ci && \
    npm run build-prod

FROM joseluisq/static-web-server:2

COPY --from=build /build/dist/* /public/
