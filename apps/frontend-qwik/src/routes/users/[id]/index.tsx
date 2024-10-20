import { component$, type NoSerialize, $ } from "@builder.io/qwik"
import { type DocumentHead, routeLoader$, z } from "@builder.io/qwik-city"
import { type InitialValues, useForm } from "@modular-forms/qwik"
import { FileInput } from "~/components"
import { api } from "../../../client"
import upload from "../../../utils/aws"
import { paths } from "~/utils/paths"
import { DetailCard } from "../../../components/cards/user/detailed-description"
import { USER_IMAGE_FOLDER } from "~/utils/variables"

type SpecialForm = {
  file: {
    list: NoSerialize<File>[]
    item: NoSerialize<File>
  }
  name: string
}

// type SpecialForm = Input<typeof specialFormSchema>

export const useUserUpdate = routeLoader$(async requestEvent => {
  // const file = await import('@kalisio/feathers-s3');
  const { params } = requestEvent
  const parseResult = z.object({ id: z.coerce.string().uuid() }).safeParse(params)

  if (!parseResult.success) {
    throw requestEvent.redirect(302, paths.notFound)
  }

  const userId = parseResult.data.id
  const { data } = await api.service("users").find({
    query: {
      id: userId,
    },
  })

  return data[0]
})

export const useFormLoader = routeLoader$<InitialValues<SpecialForm>>(() => ({
  file: {
    list: [],
    item: undefined,
  },
  name: undefined,
}))

const uploadProfilePicture = $(async (formData: SpecialForm) => {
  console.log("this works")
  const {
    file: { item: item },
  } = formData
  console.log(item)
  try {
    await upload(item, { expiresIn: 3600, path: USER_IMAGE_FOLDER }).then(async data => {
      console.log(await data)
    })
  } catch (error) {
    console.log(error)
  }
})

export default component$(() => {
  // Use special form
  const [, { Form, Field }] = useForm<SpecialForm>({
    loader: useFormLoader(),
  })

  const user = useUserUpdate()

  const { firstName, surname } = user.value.profile

  return (
    <Form class="space-y-12 md:space-y-14 lg:space-y-16" onSubmit$={uploadProfilePicture}>
      <div class="overflow-hidden bg-white shadow sm:rounded-lg">
        <div class="px-4 py-6 sm:px-6">
          <h3 class="text-base font-semibold leading-7 text-gray-900">Applicant Information</h3>
          <p class="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Personal details and application.</p>
        </div>
        <div class="border-t border-gray-100">
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <img
              class="h-36 w-36 flex-none rounded-full bg-gray-50"
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt=""
            ></img>
          </div>
          <dl class="divide-y divide-gray-100">
            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-900">Full name</dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {firstName} {surname}
              </dd>
              {/* <dt class="text-sm font-medium text-gray-900">Email address</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{user.email}</dd>
            <dt class="text-sm font-medium text-gray-900">About</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{user.profile.bio}</dd> */}
            </div>
          </dl>
          <dl class="divide-y divide-gray-100">
            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <Field name="file.item" type="File">
                {(field, props) => <FileInput {...props} value={field.value} error={field.error} label="File item" />}
              </Field>
              <button
                type="submit"
                class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Upload file
                <svg class="-mr-0.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </dl>
        </div>
      </div>

      {/* </div> */}
      {/* <FormFooter of={specialForm} /> */}
    </Form>
  )
})

export const head: DocumentHead = {
  title: "Special form",
}
