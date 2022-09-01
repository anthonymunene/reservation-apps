const users = require("./users/users.service.js");
const properties = require("./properties/properties.service.js");
module.exports = function (app) {
  app.configure(users);
  app.configure(properties);
};
