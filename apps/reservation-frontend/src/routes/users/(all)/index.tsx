import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { api } from '../../../client';
import type { DocumentHead } from '@builder.io/qwik-city';

export const useAllUsersLoader = routeLoader$(async () => {
  const { data } = await api.service('users').find();

  return data;
});

export default component$(() => {
  const users = useAllUsersLoader();
  return (
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="overflow-hidden bg-white shadow sm:rounded-lg">
        <ul role="list" id="userlist" class="divide-y divide-gray-100">
          {users.value.map((user, index) => (
            <li class="px-4 py-6 sm:px-6 flex justify-between gap-x-6 py-5" key={index}>
              <a href={user.id} class="flex-1">
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
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

export const head: DocumentHead = () => {
  return {
    title: `users`,
  };
};
