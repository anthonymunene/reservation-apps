// Initializes the `property` service on path `/property`
const { Property } = require("./property.class");
const hooks = require("./property.hooks");

module.exports = function (app) {
  const options = {
    model: "property",
    client: app.get("prisma"),
    paginate: app.get("paginate"),
  };

  // Initialize our service with any options it requires
  app.use("/property", new Property(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("property");

  service.hooks(hooks);
};
