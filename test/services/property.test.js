const app = require("../../src/app");

describe("'property' service", () => {
  it("registered the service", () => {
    const service = app.service("property");
    expect(service).toBeTruthy();
  });
});
