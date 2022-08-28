ARG COMMON
FROM $COMMON

WORKDIR /app
RUN mkdir -p ./label-generator

COPY ./package.json ./label-generator
RUN npm install --omit=dev

COPY ./ ./label-generator

WORKDIR /app/label-generator

CMD ["npm", "run", "dev"]
