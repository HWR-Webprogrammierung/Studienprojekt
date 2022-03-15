FROM node:16
WORKDIR /usr/src/app

RUN git clone https://github.com/HWR-Webprogrammierung/Studienprojekt.git ./
RUN npm install

EXPOSE 8080
CMD ["node", "index.js"]
