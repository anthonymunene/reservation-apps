import { component$ } from "@builder.io/qwik"
//@ts-ignore
import { getClientService } from "@kalisio/feathers-s3"
import { io } from "socket.io-client"
import { feathers } from "@feathersjs/client"
import { z } from "zod"
import { type InitialValues, useForm, zodForm$, Form, Field } from "@modular-forms/qwik"
import { FileInput } from "~/components"
import { UserForm, SpecialForm } from "~/routes/users/[id]"

type Props = {
  user: {
    email: string
    id: string
    profile: {
      firstName: string
      surname: string
      bio?: string
    }
  }
  Form: SpecialForm
  Field: SpecialForm
}

export const DetailCard = component$((props: Props) => {
  const {
    user: { profile },
    Form,
    Field,
  } = props
  console.log(props.user)
  return (
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
              {profile.firstName} {profile.surname}
            </dd>
            <dt class="text-sm font-medium text-gray-900">Email address</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{user.email}</dd>
            <dt class="text-sm font-medium text-gray-900">About</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{user.profile.bio}</dd>
          </div>
        </dl>
        <dl class="divide-y divide-gray-100">
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <input id="file" type="file" />
            <button
              type="button"
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
  )
})
