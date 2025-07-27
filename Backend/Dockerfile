FROM node:16-alpine

WORKDIR /app

COPY . .

RUN npm install
RUN npx prisma generate

EXPOSE 4000

CMD ["npm", "run", "start"]
