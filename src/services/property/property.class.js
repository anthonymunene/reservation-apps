const { PrismaService } = require("feathers-prisma");

exports.Property = class Property extends PrismaService {
  constructor({ model, ...options }, app) {
    super(
      {
        model,
        ...options,
      },
      app.get("prisma")
    );
  }
};
