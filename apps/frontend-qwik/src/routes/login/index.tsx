import { $, component$, useSignal } from "@builder.io/qwik"
import { routeLoader$, useNavigate, type DocumentHead } from "@builder.io/qwik-city"
import { z } from "zod"
import { type InitialValues, type SubmitHandler, useForm, zodForm$ } from "@modular-forms/qwik"
import { TextInput, FormFooter } from "~/components"
import { isLoginRejected, logIn, useAuth } from "~/utils/auth"

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter your email.")
    .email("The email address is badly formatted."),
  password: z
    .string()
    .min(1, "Please enter your password.")
    .min(8, "Your password must have 8 characters or more."),
})

type LoginForm = z.input<typeof loginSchema>

export const useFormLoader = routeLoader$<InitialValues<LoginForm>>(() => ({
  email: "",
  password: "",
}))

export default component$(() => {
  const [loginForm, { Form, Field }] = useForm<LoginForm>({
    loader: useFormLoader(),
    validate: zodForm$(loginSchema),
  })
  const auth = useAuth()
  const navigate = useNavigate()
  const loginError = useSignal<string | null>(null)

  // Runs in the browser after the form passes validation
  const handleSubmit = $<SubmitHandler<LoginForm>>(async values => {
    loginError.value = null
    try {
      auth.user = await logIn(values.email, values.password)
      await navigate(`/users/${auth.user.id}/`)
    } catch (error) {
      loginError.value = isLoginRejected(error)
        ? "That email and password don't match an account."
        : "We couldn't sign you in. Please try again."
    }
  })

  return (
    <div>
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
          <Form id="add-user" class="space-y-6" onSubmit$={handleSubmit}>
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
            {loginError.value && (
              <p role="alert" class="text-sm text-red-600" data-testid="login-error">
                {loginError.value}
              </p>
            )}
            <FormFooter of={loginForm} />
          </Form>
        </div>
      </div>
    </div>
  )
})

export const head: DocumentHead = {
  title: "Sign in",
}
