FROM node:20-alpine AS build

ARG COMMIT_HASH

WORKDIR /build
COPY . .
RUN npm ci && \
    npm run build-prod

FROM joseluisq/static-web-server:2

COPY --from=build /build/dist/* /public/
