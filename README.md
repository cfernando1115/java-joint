![JavaJoint logo](public/img/logo-sm.png)
## JavaJoint
*A responsive restaurant-helper web app using MongoDb, Node.js, and EJS*

***
### This project is currently in progress
***
### Note: a [MongoDb](https://www.mongodb.com/) connection string is needed to run this app locally
*Create a file named mongoConnection.js in util/ and store your string in export connectionString*
***
### Note: an express-session secret is needed to run this app
*Create a file named expressSessionSecret.js in util/ and store your string in export sessionSecret*
***
### Note: a [SendGrid](https://www.sendgrid.com/) verified sender identity and api key is needed for email functionality
*Create a file named sendgrid.js in util/ and store your key in export apiKey, sender identity in export senderEmail*
***
### Version 1.0 Features

- [x] Ingredient CRUD - Manager
- [x] Item CRUD - Manager
- [x] Menu CRUD - Manager
- [x] Item Feature: Food cost alerts - Manager
- [x] Item Feature: Dynamic food cost calculator - Manager
- [ ] Order CRUD - Guest
- [x] Login functionality - Guest
- [ ] Login functionality - Manager
- [x] Authentication (sessions)
- [x] CSRF
- [ ] Role-based authorization
- [ ] Error-handling
- [ ] Optimization

***

### CLI Instructions
Install Packages: `npm install`  
Run App (nodemon): `npm start`