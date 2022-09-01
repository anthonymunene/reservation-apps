// Initializes the `properties` service on path `/y`
const { Properties } = require("./properties.class");
const hooks = require("./properties.hooks");

module.exports = function (app) {
  const options = {
    model: "property",
    client: app.get("prisma"),
    paginate: app.get("paginate"),
    whitelist: ["$rawWhere", "$eager"],
  };

  // Initialize our service with any options it requires
  app.use("/properties", new Properties(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("properties");

  service.hooks(hooks);
};
