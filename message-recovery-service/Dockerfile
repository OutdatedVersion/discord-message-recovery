# minimal base
FROM node:alpine

# where things take place
WORKDIR /usr/app

# move requires files
COPY package.json yarn.lock ./

# move source over..
COPY ./build ./node_modules ./

CMD [ "yarn", "prod" ]