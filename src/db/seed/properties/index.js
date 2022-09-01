const { faker } = require("@faker-js/faker");

const getAmenitiesById = (client) =>
  client.amenity.findMany({
    select: {
      id: true,
    },
  });

const getAllPropertyTypesById = (client) =>
  client.propertyType.findMany({
    select: {
      id: true,
    },
  });

const getPropertyTypeById = (client, { id }) =>
  client.propertyType.findMany({
    where: {
      id,
    },
  });

const getAllProperties = (client) =>
  client.property.findMany({
    select: {
      id: true,
    },
  });
const getMultipleRandomisedAmenityTypes = (amenities) =>
  faker.helpers.arrayElements(amenities, 2);

const randomised = (items, count) => {
  return Array.isArray(items)
    ? count
      ? faker.helpers.uniqueArray(items, count)
      : faker.helpers.arrayElement(items)
    : Math.floor(Math.random() * items);
};
const PROPERTY_TYPES = ["flat", "house", "guest house", "hotel"];
const AMENITIES = ["wifi", "tv", "parking", "pool", "heating"];
const amenityData = AMENITIES.map((amenity) => ({
  name: amenity,
}));

const createProperties = async (client) => {
  const [amenities, propertyTypes] = await client.$transaction([
    getAmenitiesById(client),
    getAllPropertyTypesById(client),
  ]);

  const properties = Array.from({ length: 10 }).map(() => {
    return {
      description: faker.lorem.sentences(),
      city: faker.address.city(),
      country: faker.address.country(),
      bedrooms: faker.helpers.arrayElement([1, 2, 3]),
      beds: faker.helpers.arrayElement([1, 2, 3]),
      baths: faker.helpers.arrayElement([1, 2, 3]),
      entirePlace: faker.helpers.arrayElement([true, false]),
    };
  });

  const connectAmenities = (data = []) =>
    data.map((item) => ({ amenity: { connect: item } }));
  await Promise.all(
    properties.map(async (property) => {
      const randomisedPropertyType = await getPropertyTypeById(
        client,
        randomised(propertyTypes)
      );
      return client.property.create({
        data: {
          title: `${faker.word.adjective(7)} ${randomisedPropertyType[0].name}`,
          ...property,
          propertyType: { connect: { id: randomisedPropertyType[0].id } },
          amenities: {
            create: connectAmenities(randomised(amenities,3))
          },
        },
      });
    })
  );
};

const getPropertiesTypeById = async (client, propertyType) =>
  await client.propertyType.findMany({
    where: {
      name: propertyType,
    },
    select: {
      id: true,
    },
  });
const getAllPropertiesById = async (client) => {
  console.log("from properties.js");
  return client.property.findMany({ select: { id: true } });
};

const createPropertyTypes = async (client, propertyTypes) => {
  const propertyTypeData = propertyTypes.map((propertyType) => ({
    name: propertyType,
  }));
  return client.propertyType.createMany({ data: propertyTypeData });
};

const createAmenities = async (client) => {
  return client.amenity.createMany({
    data: amenityData,
  });
};

module.exports = {
  createPropertyTypes,
  createProperties,
  getAllPropertiesById,
  getPropertiesTypeById,
  propertyTypes: PROPERTY_TYPES,
  createAmenities,
  getAllProperties,
  randomised,
};
