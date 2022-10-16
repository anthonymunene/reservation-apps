import { faker } from '@faker-js/faker';
import { Prisma, PrismaClient } from '@prisma/client';
import { PROPERTY } from '../../../utils/variables';
import { randomiseArray } from '../../../utils/randomise';

export const getAmenitiesById = (client: PrismaClient) =>
  client.amenity.findMany({
    select: {
      id: true,
    },
  });

export const getAllPropertyTypesById = (client: PrismaClient) =>
  client.propertyType.findMany({
    select: {
      id: true
    },
  });

export const getPropertyTypeById = (client: PrismaClient, id: number) =>
  client.propertyType.findMany({
    where: {
      id,
    },
  });

export const getAllProperties = (client: PrismaClient) =>
  client.property.findMany({
    select: {
      id: true,
    },
  });
export const getMultipleRandomisedAmenityTypes = (amenities: string[]) =>
  faker.helpers.arrayElements(amenities, 2);


const { AMENITIES } = PROPERTY;
const amenityData = AMENITIES.map((amenity) => ({
  name: amenity,
}));

export const createProperties = async (client: PrismaClient) => {

  const [amenities, propertyTypes] = await client.$transaction([
    getAmenitiesById(client),
    getAllPropertyTypesById(client),
  ]);

  const properties= Array.from({ length: 10 }).map(() => {
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

  const connectAmenities = (data: []) =>
    data.map((item) => ({ amenity: { connect: item } }));

  await Promise.all(
    properties.map(async (property) => {
      const randomisedPropertyType = await getPropertyTypeById(
        client,
        randomiseArray(propertyTypes)
      );
      return client.property.create({
        data: {
          title: `${faker.word.adjective(7)} ${randomisedPropertyType[0].name}`,
          ...property,
          propertyType: { connect: { id: randomisedPropertyType[0].id } },
          amenities: {
            create: connectAmenities(randomiseArray(amenities, 3)),
          },
        },
      });
    })
  );
};

export const getPropertiesTypeById = async (client: PrismaClient, propertyType) =>
  await client.propertyType.findMany({
    where: {
      name: propertyType,
    },
    select: {
      id: true,
    },
  });
export const getAllPropertiesById = async (client: PrismaClient) => {
  console.log('from properties.js');
  return client.property.findMany({ select: { id: true } });
};

export const createPropertyTypes = async (client: PrismaClient) => {
  const { PROPERTY_TYPES } = PROPERTY;
  const propertyTypeData = PROPERTY_TYPES.map((propertyType) => ({
    name: propertyType,
  }));
  return client.propertyType.createMany({ data: propertyTypeData });
};

export const createAmenities = async (client: PrismaClient) => {
  return client.amenity.createMany({
    data: amenityData,
  });
};
