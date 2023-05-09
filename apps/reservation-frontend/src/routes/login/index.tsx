//@ts-nocheck
import { component$ } from '@builder.io/qwik';
import { routeLoader$, routeAction$ } from '@builder.io/qwik-city';
import { api } from '../../client';
import { z } from 'zod';
import { type InitialValues, useForm, zodForm$ } from '@modular-forms/qwik';
import { TextInput, FormFooter } from '~/components';

const loginSchema = z.object({
  email: z.string().min(1, 'Please enter your email.').email('The email address is badly formatted.'),
  password: z.string().min(1, 'Please enter your password.').min(8, 'You password must have 8 characters or more.'),
});

type LoginForm = z.input<typeof loginSchema>;

export const useFormLoader = routeLoader$<InitialValues<LoginForm>>(() => ({
  email: '',
  password: '',
}));

export const useLoginUser = routeAction$(async (data, ctx) => {
  console.log('Form data:', await ctx.request.formData());
  console.log('JSON data:', data);
  //@ts-ignore
  await api.service('users').create(data);
});

export default component$(() => {
  const [loginForm, { Form, Field }] = useForm<LoginForm>({
    loader: useFormLoader(),
    validate: zodForm$(loginSchema),
  });
  // const login = useLoginAction();
  return (
    <div class={'something'}>
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          class="mx-auto h-10 w-auto"
          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
          alt="Your Company"
        />
        <h2 class="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>
      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div class="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <Form id="add-user" class="space-y-6">
            <Field name="email">
              {(field, props) => (
                <TextInput
                  {...props}
                  value={field.value}
                  error={field.error}
                  type="email"
                  label="Email"
                  placeholder="example@email.com"
                  required
                  data-testid="email"
                />
              )}
            </Field>
            <Field name="password">
              {(field, props) => (
                <TextInput
                  {...props}
                  value={field.value}
                  error={field.error}
                  type="password"
                  label="Password"
                  placeholder="********"
                  required
                  data-testid="password"
                />
              )}
            </Field>
            <FormFooter of={loginForm} />
          </Form>
        </div>
      </div>
    </div>
  );
});
