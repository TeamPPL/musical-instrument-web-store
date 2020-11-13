# musical-instrument-web-store
A musical instrument online store

npm init
npm install express --save
npx express-generator --hbs
npm install
npm install nodemon

change package.json to


{
  "name": "musical-instrument-web-store",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "start": "node ./bin/www",
    "dev": "nodemon ./bin/www"
  },
  "dependencies": {
    "cookie-parser": "~1.4.4",
    "debug": "~2.6.9",
    "express": "~4.16.1",
    "hbs": "^4.1.1",
    "http-errors": "~1.6.3",
    "morgan": "~1.9.1",
    "nodemon": "^2.0.6"
  },
  "devDependencies": {
    "nodemon": "^2.0.6"
  }
}
<<<<<<<<<<<<<<<<<<<<<

npm start

------------------------------

To unpackage package.json --> npm ci
To fix error              --> npm audit fix

