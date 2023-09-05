# each line is a layer and layers eventually form the image

# base image: build our custom image from this
FROM node:20
#set working directory
WORKDIR /app
#copy package file into container
COPY package.json .
# install (image build time)
ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ]; \
  then npm install; \
  else npm install --only=production; \
fi
# copy the rest of the project files
COPY . .
# our app is run on a port that needs to be exposed (this is just for documentation! docker container is still isolated and unaccessible)
#ENV PORT 3000
EXPOSE $PORT
# run app (container run time) - this can be overrided in compose files
CMD ["node", "index.js"]