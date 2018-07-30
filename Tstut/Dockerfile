# Inherit from Heroku's stack
FROM ubuntu:16.04

# Which version of node?
ENV NODE_ENGINE 8.6.0
ENV PATH /app/node/bin/:/app/api/node_modules/.bin:$PATH

# Create some needed directories
RUN mkdir -p /app/node /app/.profile.d /app/api
RUN apt-get -qq update \
    && apt-get install -y apt-utils curl python make g++ tcpdump \
    && curl -s https://s3pository.heroku.com/node/v$NODE_ENGINE/node-v$NODE_ENGINE-linux-x64.tar.gz | tar --strip-components=1 -xz -C /app/node \
    && apt-get -y --allow-remove-essential remove curl \
    && apt-get -y --allow-remove-essential autoremove \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
# Export the node path in .profile.d
RUN echo "export PATH=\"/app/node/bin:/app/node_modules/.bin:\$PATH\"" > /app/.profile.d/nodejs.sh

WORKDIR /app/api
COPY . .
RUN /app/node/bin/npm install -g concurrently nodemon
RUN /app/node/bin/npm install --production
