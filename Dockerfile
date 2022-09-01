ARG ROOT
FROM $ROOT

WORKDIR /app
RUN mkdir -p ./label-generator

WORKDIR /app/label-generator
COPY ./package.json ./
RUN npm install --omit=dev

COPY ./ .

CMD ["npm", "run", "container_dev"]
