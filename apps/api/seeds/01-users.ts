// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { Knex } from 'knex';
import { faker } from '@faker-js/faker';
// import { seedUserImageDir, createIfNotExist, clearImageFolder, seedImages } from './utils/seedImages';
import { Users, UsersData } from '../src/services/users/users.schema';
import { Properties } from '../src/services/properties/properties.schema';
import { Profiles } from '../src/services/profiles/profiles.schema';
import { randomUUID } from 'crypto';

import { randomiseInt } from '../src/utils/randomise';
import reviews from './data/reviews.json';
// //TODO: move to config
const userAccounts: Array<UsersData> = Array.from({ length: 10 }).map(() => {
  return {
    id: randomUUID(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };
});

//TYPES-TO-COLLATE:
type PropertyId = Pick<Properties, 'id'>;
type UserId = Pick<Users, 'id'>;

const getMultipleRandomisedPropertyIds = (propertyId: PropertyId[]) => faker.helpers.arrayElements(propertyId, 2);

const getAllPropertiesWithoutOwner = async (knex: Knex) => {
  const propertiesById: PropertyId[] = await knex.select('id').from('Property').whereNull('host');
  console.log(`Properties without owners by Id ${JSON.stringify(propertiesById)}`);
  return propertiesById;
};
const createProfile = async (knex: Knex, user: UserId): Promise<{ id: number }> => {
  type ProfileData = Pick<Profiles, 'id' | 'userId' | 'firstName' | 'surname' | 'bio'>;

  const firstName = faker.name.firstName();
  const surname = faker.name.lastName();
  const profile: ProfileData = {
    id: randomUUID(),
    firstName,
    surname,
    bio: faker.lorem.sentences(),
    userId: user.id,
  };

  const [id] = await knex.insert(profile).into('Profile').returning('id');

  console.log(`Returned profileId ${JSON.stringify(id)}`);
  return id;
};

const createUsers = async (knex: Knex) => {
  // createIfNotExist(seedUserImageDir);
  // await clearImageFolder(`${seedUserImageDir}/*.png`)
  //   .then((deletedFiles) => console.log('done! deleted files:', deletedFiles))
  const ownProperty = async (properties: PropertyId[], user: UserId) => {
    properties.map(async property => {
      const { id } = user;
      console.log(`User: ${user.id} \n Properties to own: \n ${JSON.stringify(properties)} \n\n`);
      await knex('Property')
        .where('id', (property as PropertyId)['id'])
        .update({
          host: id,
        });
    });
  };
  //   .catch(error => console.log(`something went wrong deleting files:\n${error}`));
  for (let index = 0; index < userAccounts.length; index++) {
    // const imageURL = await seedImages('face', {
    //   dir: seedUserImageDir,
    //   user: userAccounts[index]
    // });

    const freeProperties = await getAllPropertiesWithoutOwner(knex).then(async id => {
      // interface propertiesToOwnType {
      //   [key: string]: string;
      // }
      return getMultipleRandomisedPropertyIds(id);

      // const userIdSchema = Type.Array(Type.Object({UserId: Type.Number()}));
      // type UserId = Static<typeof userIdSchema>
    });

    const [user]: UserId[] = await knex.insert(userAccounts[index], ['id']).into('User');

    const { id } = await createProfile(knex, user);
    await knex('User').where({ id: user.id }).update('profileId', id);
    if (freeProperties.length) {
      await ownProperty(freeProperties, user);
    } else {
      console.log(`not creating profiles for User ${user.id}} `);
    }
  }
};

const createReviews = async (dbClient: Knex): Promise<void> => {
  const users: Users[] = await dbClient.select('id').from('User');
  const properties = await dbClient.select('id').from('Property');
  const allReviews = [...reviews.positive, ...reviews.negative, ...reviews.mixed];
  for (let index = 0; index < properties.length; index++) {
    const { id }: UserId = users[randomiseInt(users.length)];

    const review = allReviews[randomiseInt(allReviews.length)];
    await dbClient
      .insert({
        id: randomUUID(),
        propertyId: properties[index].id,
        userId: id,
        comment: review,
      })
      .into('Review');
  }
};

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  // await knex('User').del();
  await createUsers(knex);
}
