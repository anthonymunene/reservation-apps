import { component$ } from '@builder.io/qwik';
import { routeLoader$, routeAction$, z } from '@builder.io/qwik-city';
import { type InitialValues, useForm } from '@modular-forms/qwik';
//@ts-ignore

import { api } from '../../../client';
import type { DocumentHead } from '@builder.io/qwik-city';
import { paths } from '~/utils/paths';
import { DetailCard } from '../../../components/cards/user/detailed-description';

const ACCEPTED_FILE_TYPES = ['application/json'];

const userForm = z.object({
  file: z
    .custom<File>(val => val instanceof File, 'Please upload a file')
    .refine(file => ACCEPTED_FILE_TYPES.includes(file.type), { message: 'Please choose .json format files only' }),
});
type UserForm = z.infer<typeof userForm>;

export const useUserUpdate = routeLoader$(async requestEvent => {
  // const file = await import('@kalisio/feathers-s3');
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

export const useUploadFileLoader = routeLoader$<InitialValues<UserForm>>(() => {
  file: undefined;
});

export default component$(() => {
  // const [userForm, { Form, Field }] = useForm<UserForm>({
  //   loader: useUploadFileLoader(),
  // });
  const user = useUserUpdate();
  console.log(user.value)
  return (
    <>
      <div class="px-4 sm:px-6 lg:px-8">
        <DetailCard user={user.value} />
      </div>
    </>
  );
});

export const head: DocumentHead = () => {
  return {
    title: `users`,
  };
};
