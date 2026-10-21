import { component$, type NoSerialize, $, useSignal } from "@builder.io/qwik"
import { type DocumentHead, routeLoader$, z } from "@builder.io/qwik-city"
import { type InitialValues, useForm } from "@modular-forms/qwik"
import { FileInput } from "~/components"
import { api } from "../../../client"
import upload from "../../../utils/aws"
import { paths } from "~/utils/paths"
import { USER_IMAGE_FOLDER } from "~/utils/variables"
import { logError } from "~/utils/logError"
import { primaryImageEntry, profileImageUrl, uniqueImageName } from "~/utils/profile-image"

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

type UploadStatus = { kind: "success" | "error"; message: string } | null

export default component$(() => {
  // Use special form
  const [, { Form, Field }] = useForm<SpecialForm>({
    loader: useFormLoader(),
  })

  const user = useUserUpdate()

  const { firstName, surname } = user.value.profile
  const userId = user.value.id
  const pictureUrl = useSignal(profileImageUrl(user.value.profile.images))
  const uploadStatus = useSignal<UploadStatus>(null)

  // Uploads the chosen file to S3, then saves it on the profile as the user's picture
  const uploadProfilePicture = $(async (formData: SpecialForm) => {
    const file = formData.file.item
    if (!file) {
      uploadStatus.value = { kind: "error", message: "Choose an image to upload first." }
      return
    }

    const fileName = uniqueImageName(userId, file.name)
    try {
      const response = await upload(file, {
        expiresIn: 3600,
        path: USER_IMAGE_FOLDER,
        fileName,
      })
      if (!response?.ok) throw new Error("The image could not be uploaded.")

      // The new picture replaces the previous one on the profile
      await api
        .service("profiles")
        .patch(null, { images: [primaryImageEntry(fileName)] }, { query: { userId } })

      pictureUrl.value = profileImageUrl([{ url: fileName }])
      uploadStatus.value = { kind: "success", message: "Your profile picture has been updated." }
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)))
      uploadStatus.value = {
        kind: "error",
        message: "Your profile picture could not be updated. Please try again.",
      }
    }
  })

  return (
    <Form class="space-y-12 md:space-y-14 lg:space-y-16" onSubmit$={uploadProfilePicture}>
      <div class="overflow-hidden bg-white shadow sm:rounded-lg">
        <div class="px-4 py-6 sm:px-6">
          <h3 class="text-base font-semibold leading-7 text-gray-900">Applicant Information</h3>
          <p class="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
            Personal details and application.
          </p>
        </div>
        <div class="border-t border-gray-100">
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <img
              class="h-36 w-36 flex-none rounded-full bg-gray-50"
              src={pictureUrl.value}
              alt={`${firstName} ${surname}`}
              data-testid="profile-picture"
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
                {(field, props) => (
                  <FileInput {...props} value={field.value} error={field.error} label="File item" />
                )}
              </Field>
              <button
                type="submit"
                class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Upload file
                <svg
                  class="-mr-0.5 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
              {uploadStatus.value && (
                <p
                  role="status"
                  data-testid="upload-status"
                  class={
                    uploadStatus.value.kind === "success"
                      ? "mt-2 text-sm text-green-700"
                      : "mt-2 text-sm text-red-700"
                  }
                >
                  {uploadStatus.value.message}
                </p>
              )}
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
