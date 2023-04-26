import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { api } from '../../client';

export const getUsers = routeLoader$(async requestEvent => {
  const queryBuilder = requestEvent.query;
  const defaultLimit = queryBuilder.get('limit') ? queryBuilder.get('limit') : requestEvent.env.get('LIMIT');
  
  const { data } = await api.service('users').find({ query: { $limit: Number(defaultLimit) } });

  return data;
});

export default component$(() => {
  const users = getUsers();
  return (
    <div class={'something'}>
      <ul>
        {users.value.map((user, index) => (
          <li key={index}>
            <p>{user.email}</p>
            <p>{user.profile.firstName}</p>
            <p>{user.profile.surname}</p>
            <p>{user.profile.bio}</p>
            <p></p>
          </li>
        ))}
      </ul>
    </div>
  );
});

export const fetchUsers = routeLoader$(async () => {
  try {
    const users = await fetch('http://localhost:3030/users').then(response => response.json());
    return users;
  } catch (error) {
    console.log(error);
  }
});

interface UserProperties {
  [index: number]: { id: number };
}

interface UserProfile {
  id: number;
  bio: string;
  defaultProfilePic: string;
  profilePic: string;
  accountId: string;
  superHost: boolean;
}
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  properties: UserProperties;
  profile: UserProfile;
}

interface EndpointData {
  total: number;
  skip: number;
  limit: number;
  data: Array<User>;
}
