FROM node:alpine

WORKDIR /app

COPY . .

# RUN npm install

RUN yarn i

EXPOSE 4000

# CMD [ "npm", "run", "start:prod" ]

CMD [ "yarn", "start:prod" ]