import { component$ } from '@builder.io/qwik';
import { routeLoader$, routeAction$ } from '@builder.io/qwik-city';
import { api } from '../../client';
import type { DocumentHead } from '@builder.io/qwik-city';

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
    <div class="px-4 sm:px-6 lg:px-8">
      <ul role="list" id="userlist" class="divide-y divide-gray-100">
        {users.value.map((user, index) => (
          <li class="flex justify-between gap-x-6 py-5" key={index}>
            <div class="flex gap-x-4">
              <img
                class="h-12 w-12 flex-none rounded-full bg-gray-50"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt=""
              ></img>
              <div>
                <p class="text-sm font-semibold leading-6 text-gray-900">
                  {user.profile.firstName} {user.profile.surname}
                </p>
                <p class="mt-1 truncate text-xs leading-5 text-gray-500">{user.email}</p>
                <p class="hidden">{user.profile.bio}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
});

export const head: DocumentHead = () => {
  return {
    title: `users`,
  };
};
