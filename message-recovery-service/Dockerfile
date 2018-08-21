# minimal base
FROM node:alpine

# where things take place
WORKDIR /usr/app

# move requires files
COPY package.json yarn.lock ./

# get the required modules in place
RUN ["yarn", "install", "--registry", "https://npm-registry.outdatedversion.com"]

COPY . ./

CMD [ "yarn", "prod" ]