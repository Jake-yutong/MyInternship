FROM node:24-bookworm-slim

WORKDIR /app

COPY package.json ./
RUN npm install --no-package-lock

COPY . .

RUN npm run build

ENV NODE_ENV=production
ENV MYINTERNSHIP_API_HOST=0.0.0.0
ENV MYINTERNSHIP_API_PORT=8787

EXPOSE 8787

CMD ["npm", "run", "start:server"]