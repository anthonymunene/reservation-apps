import { component$ } from '@builder.io/qwik';
import {routeLoader$, routeAction$ } from '@builder.io/qwik-city';
import { api } from '../../client';

export const useUserUpdate = routeLoader$(async requestEvent => {
  const queryBuilder = requestEvent.query;
  const defaultLimit = queryBuilder.get('limit') ? queryBuilder.get('limit') : requestEvent.env.get('LIMIT');

  const { data } = await api.service('users').find({ query: { $limit: Number(defaultLimit) } });

  return data;
});

export const useLoginAction = routeAction$(async (data, ctx) => {
  console.log('Form data:', await ctx.request.formData());
  console.log('JSON data:', data);
  //@ts-ignore
  await api.service('users').create(data);
});

export default component$(() => {
  const users = useUserUpdate();
  return (
    <div class={'something'}>
      <ul id="userlist">
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
