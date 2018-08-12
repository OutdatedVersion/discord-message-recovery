# minimal base
FROM node:alpine

# where things take place
WORKDIR /usr/app

# move requires files
COPY package.json yarn.lock ./

# setup..
RUN yarn install -q

# move source over..
COPY . .

CMD [ "yarn", "prod" ]