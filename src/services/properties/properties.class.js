const { PrismaService } = require("feathers-prisma");

exports.Properties = class Properties extends PrismaService {
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
