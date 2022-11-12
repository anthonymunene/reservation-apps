import { component$, Resource } from "@builder.io/qwik";
import { RequestHandler, useEndpoint } from "@builder.io/qwik-city";

export default component$(() => {
  const userData = useEndpoint<typeof onGet>();

  return (
    <div>
      <Resource
        value={userData}
        onResolved={(users) => {
          return (
            <>
              <ul>
                {users.data.map((user) => (
                  <li>
                    <p>{user.id}</p>
                    <p>{user.firstName}</p>
                    <p>{user.lastName} </p>
                    <p>{user.profile.bio}</p>
                    <p>
                      <img src={`images/users/${user.profile.defaultProfilePic}`} />
                     </p>
                    <p>{user.profile.superHost}</p>
                  </li>
                ))}
              </ul>
            </>
          );
        }}
      />
    </div>
  );
});

export const onGet: RequestHandler<EndpointData> = async () => {
  try {
    const users = await fetch("http://localhost:3030/users").then((response) =>
      response.json()
    );
    return users;
  } catch (error) {
    console.log(error);
  }
};

interface UserProperties {
  [index: number]: { id: number };
}

interface UserProfile {
  id: number;
  bio: string;
  defaultProfilePic: string
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
