FROM node:18.12.1

WORKDIR /app

ARG GROUP_ID=1000
ARG USER_ID=1000

RUN groupmod -g ${GROUP_ID} node
RUN usermod -u ${USER_ID} -g ${GROUP_ID} node

USER node

ENTRYPOINT [ "npm" ]
