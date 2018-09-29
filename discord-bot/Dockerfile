# minimal base
FROM node:alpine

# where things take place
WORKDIR /usr/app

# move requires files
COPY package.json yarn.lock ./

# get the required modules in place
RUN ["yarn", "install", "--production", "--registry", "https://npm-registry.outdatedversion.com"]

# copy code over
COPY build/ ./build

# we'll need this port
EXPOSE 2000

ENV NODE_ENV prod

CMD [ "node", "build/index.js" ]