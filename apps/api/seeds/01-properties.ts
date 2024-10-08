// 👇️ ts-nocheck disables type checking for entire file
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

const { faker } = require("@faker-js/faker")
import { Knex } from "knex"
import { PROPERTY } from "../src/utils/variables"
import { randomiseArray } from "../src/utils/randomise"
// import { createIfNotExist, seedImages, clearImageFolder } from '../utils/seedImages';
import { Properties } from "../src/services/properties/properties.schema"
import { Amenity, PropertyType } from "../src/types"
import { randomUUID } from "crypto"

//TYPES-TO-COLLATE:
type PropertyId = Pick<Properties, "id">
type PropertyTypeData = Pick<PropertyType, "id" | "name">

type AmenityData = Pick<Amenity, "id" | "name">

export const getAmenitiesById = async (dbClient: Knex): Pick<AmenityData, "id">[] => {
  const amenities: AmenityData[] = await dbClient.select("id", "name").from("Amenity")
  return amenities
}

export const getAllPropertyTypes = async (dbClient: Knex): PropertyTypeData[] => {
  const propertyTypes: PropertyTypeData[] = await dbClient.select("id", "name").from("PropertyType")
  return propertyTypes
}

// export const getPropertyTypeById = (dbClient: PrismaClient, id: number) => {

//   return dbClient.propertyType.findMany({
//     where: id
//   });

// };
// export const getAllProperties = (dbClient: PrismaClient) =>
//   dbClient.property.findMany({
//     select: {
//       id: true,
//     },
//   });
// export const getMultipleRandomisedAmenityTypes = (amenities: string[]) =>
//   faker.helpers.arrayElements(amenities, 2);

export const createProperties = async (dbClient: Knex): Promise<void> => {
  const amenities = await getAmenitiesById(dbClient)
  const propertyTypes = await getAllPropertyTypes(dbClient)

  const properties = Array.from({ length: 10 }).map(() => {
    return {
      id: randomUUID(),
      description: faker.lorem.sentences(),
      city: faker.location.city(),
      countryCode: faker.location.countryCode(),
      bedrooms: faker.helpers.arrayElement([1, 2, 3]),
      beds: faker.helpers.arrayElement([1, 2, 3]),
      images: {},
      // entirePlace: faker.helpers.arrayElement([true, false])
    }
  })

  // const connectAmenities = (data: []) =>
  //   data.map((item) => ({ amenity: { connect: item } }));

  // const propertiesImageDir = `${process.cwd()}/src/db/seed/images/properties`;
  // await clearImageFolder(`${propertiesImageDir}/*.png`)
  //   .then((deletedFiles) => console.log('done! deleted files:', deletedFiles));
  const addAmenities = (amenities: AmenityData[], property: PropertyId): void => {
    amenities.map(async (amenity: AmenityData) => {
      await dbClient("PropertyAmenity").insert({
        id: randomUUID(),
        amenityId: amenity.id,
        propertyId: property.id,
      })
    })
  }
  await Promise.all(
    properties.map(async property => {
      const assignedPropertyType: PropertyTypeData = randomiseArray(propertyTypes)
      const assignedAmenities: AmenityData[] = randomiseArray(amenities, 3)
      const title = `${faker.word.adjective(7)} ${assignedPropertyType.name}`

      // createIfNotExist(propertiesImageDir);
      // const propertyImage = await seedImages('house', {
      //   dir: propertiesImageDir,
      //   property: { title }
      // });
      const propertyId: PropertyId[] = await dbClient("Property").insert(
        {
          id: randomUUID(),
          title: title,
          ...property,
          propertyTypeId: assignedPropertyType.id,
        },
        ["id"]
      )

      addAmenities(assignedAmenities, propertyId[0])
    })
  )
}

export const createPropertyTypes = async (dbClient: Knex): Promise<void> => {
  console.log("CREATING PROPERTY TYPES.....")
  const { PROPERTY_TYPES } = PROPERTY
  const propertyTypeData = PROPERTY_TYPES.map(
    (propertyType): PropertyTypeData => ({
      id: randomUUID(),
      name: propertyType,
    })
  )

  const propertyTypes = await dbClient("PropertyType").whereIn("name", PROPERTY_TYPES)
  return propertyTypes.length ? propertyTypes : await dbClient.insert(propertyTypeData, ["id"]).into("PropertyType")
}

export const createAmenities = async (dbClient: Knex): Promise<void> => {
  console.log("CREATING AMENITIES.....")
  const { AMENITIES } = PROPERTY
  const amenityData = AMENITIES.map(
    (amenity): AmenityData => ({
      id: randomUUID(),
      name: amenity,
    })
  )
  const amenities = await dbClient("Amenity").whereIn("name", AMENITIES)

  return amenities.length ? amenities : await dbClient.insert(amenityData, ["id"]).into("Amenity")
}

export async function seed(knex: Knex): Promise<void> {
  await createAmenities(knex)
  await createPropertyTypes(knex)
  await createProperties(knex)
}
