const { faker } = require("@faker-js/faker");
const { PrismaClient } = require("@prisma/client");
const { permittedCrossDomainPolicies } = require("helmet");

const prisma = new PrismaClient();

const getAmenitiesById = () =>
  prisma.amenity.findMany({
    select: {
      id: true,
    },
  });

const getAllPropertyTypesById = () =>
  prisma.propertyType.findMany({
    select: {
      id: true,
    },
  });

const getPropertyTypeById = ({ id }) =>
  prisma.propertyType.findMany({
    where: {
      id,
    },
  });

const getMultipleRandomisedAmenityTypes = (amenities) =>
  faker.helpers.arrayElements(amenities, 2);

const randomised = (arr) => {
  return faker.helpers.arrayElement(arr);
};
const PROPERTY_TYPES = ["flat", "house", "guest house", "hotel"];

const AMENITIES = ["wifi", "tv", "parking", "pool", "heating"];
const amenityData = AMENITIES.map((amenity) => ({
  name: amenity,
}));

const propertyType = PROPERTY_TYPES.map((propertyType) => ({
  name: propertyType,
}));

const createProperties = async () => {
  const amenities = await getAmenitiesById();
  const propertyTypes = await getAllPropertyTypesById();

  const AMENITIES = ["wifi", "tv", "parking", "pool", "heating"];
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

  properties.forEach(async (property) => {
    const randomisedPropertyType = await getPropertyTypeById(
      randomised(propertyTypes)
    );
    return await prisma.property.create({
      data: {
        title: `${faker.word.adjective(7)} ${randomisedPropertyType[0].name}`,
        ...property,
        propertyType: { connect: { id: randomisedPropertyType[0].id } },
        amenities: {
          create: [
            {
              amenity: {
                connect: randomised(amenities),
              },
            },
          ],
        },
      },
    });
  });
};

const getPropertiesTypeById = async (propertyType) =>
  await prisma.propertyType.findMany({
    where: {
      name: propertyType,
    },
    select: {
      id: true,
    },
  });
const getPropertiesById = async () =>
  await prisma.property.findMany({
    select: {
      id: true,
    },
  });

const createPropertyTypes = async (propertyTypes) => {
  const propertyTypeData = propertyTypes.map((propertyType) => ({
    name: propertyType,
  }));
  return prisma.propertyType.createMany({ data: propertyTypeData });
};

const createAmenities = async () => {
  return await prisma.amenity.createMany({
    data: amenityData,
  });
};

module.exports = {
  createPropertyTypes,
  createProperties,
  getPropertiesById,
  getPropertiesTypeById,
  propertyTypes: PROPERTY_TYPES,
  createAmenities,
};
