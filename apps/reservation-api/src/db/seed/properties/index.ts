// 👇️ ts-nocheck disables type checking for entire file
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { PROPERTY } from '../../../utils/variables';
import { randomiseArray } from '../../../utils/randomise';
import { createIfNotExist, seedImages, clearImageFolder } from '../seedImages';

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

export const getPropertyTypeById = (client: PrismaClient, id: number) => {

  return client.propertyType.findMany({
    where: id
  });

};
export const getAllProperties = (client: PrismaClient) =>
  client.property.findMany({
    select: {
      id: true,
    },
  });
export const getMultipleRandomisedAmenityTypes = (amenities: string[]) =>
  faker.helpers.arrayElements(amenities, 2);




export const createProperties = async (client: PrismaClient) => {

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
      entirePlace: faker.helpers.arrayElement([true, false])
    };
  });

  const connectAmenities = (data: []) =>
    data.map((item) => ({ amenity: { connect: item } }));

  const propertiesImageDir = `${process.cwd()}/src/db/seed/images/properties`;
  await clearImageFolder(`${propertiesImageDir}/*.png`)
    .then((deletedFiles) => console.log('done! deleted files:', deletedFiles));
  await Promise.all(
    properties.map(async (property) => {
      const randomisedPropertyType = await getPropertyTypeById(
        client,
        randomiseArray(propertyTypes)
      );
      const title = `${faker.word.adjective(7)} ${randomisedPropertyType[0].name}`;
      createIfNotExist(propertiesImageDir);
      const propertyImage = await seedImages('house', {
        dir: propertiesImageDir,
        property: { title }
      });
      return client.property.create({
        data: {
          title,
          ...property,
          defaultImage: propertyImage[0],
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

  const propertyTypes = await client.propertyType.findMany({
    where: {
      name: { in: PROPERTY_TYPES }
    }
  });
  return propertyTypes.length ? propertyTypes : await client.propertyType.createMany({ data: propertyTypeData });
};

export const createAmenities = async (client: PrismaClient) => {
  const { AMENITIES } = PROPERTY;
  const amenityData = AMENITIES.map((amenity) => ({
    name: amenity,
  }));
  const amenities = await client.amenity.findMany({
    where: {
      name: { in: AMENITIES }
    }
  });
  return amenities.length ? amenities : await client.amenity.createMany({
    data: amenityData,
  });
};
