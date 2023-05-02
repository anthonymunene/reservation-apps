import { component$ } from '@builder.io/qwik';
import { Form, routeLoader$, routeAction$ } from '@builder.io/qwik-city';
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
  const login = useLoginAction();
  return (
    <div class={'something'}>
      <div>
        <Form id="add-user" action={login}>
          <input data-testid="email" type="email" name="email" placeholder="email" />
          <input data-testid="password"  type="password" name="password" />
          <button data-testid="submit" type="submit">Save</button>
        </Form>
      </div>
      <ul id="users:list">
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
