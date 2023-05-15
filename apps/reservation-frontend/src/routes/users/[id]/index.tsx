import { component$ } from '@builder.io/qwik';
import { routeLoader$, routeAction$, z } from '@builder.io/qwik-city';
import { api } from '../../../client';
import type { DocumentHead } from '@builder.io/qwik-city';
import { paths } from '~/utils/paths';
import { DetailCard } from '../../../components/cards/detailed-description';

export const useUserUpdate = routeLoader$(async requestEvent => {
  const { params } = requestEvent;
  const parseResult = z.object({ id: z.coerce.string().uuid() }).safeParse(params);

  if (!parseResult.success) {
    throw requestEvent.redirect(302, paths.notFound);
  }

  const userId = parseResult.data.id;
  const { data } = await api.service('users').find({
    query: {
      id: userId,
    },
  });

  return data[0];
});

export default component$(() => {
  const user = useUserUpdate();
  return (
    <>
      <div class="px-4 sm:px-6 lg:px-8">
      <DetailCard user={user.value} />
        {/* <div role="list" id="userlist" class="divide-y divide-gray-100">
        <div class="flex justify-between gap-x-6 py-5">
        <div class="flex gap-x-4">
        <img
        class="h-12 w-12 flex-none rounded-full bg-gray-50"
        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        alt=""
        ></img>
        <div>
        <p class="text-sm font-semibold leading-6 text-gray-900">
        {user.value.profile.firstName} {user.value.profile.surname}
        </p>
        <p class="mt-1 truncate text-xs leading-5 text-gray-500">{user.value.email}</p>
        <p class="">{user.value.profile.bio}</p>
        </div>
        </div>
        </div>
      </div> */}
      </div>
    </>
  );
});

export const head: DocumentHead = () => {
  return {
    title: `users`,
  };
};
