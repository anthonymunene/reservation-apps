import { component$ } from "@builder.io/qwik"

type Props = {
  property: {
    amenities: {
      name: string
    }[]
    id: string
    title: string
    description: string
    city: string
    countryCode: string
    bedrooms: number
    ownedBy: string
    images: { url: string }[]
    beds: number
  }
}

export const DetailCard = component$((props: Props) => {
  const { property } = props
  return (
    <div class="overflow-hidden bg-white shadow sm:rounded-lg">
      <div class="px-4 py-6 sm:px-6">
        <h3 class="text-base font-semibold leading-7 text-gray-900 capitalize">
          {property.title} in {property.city}
        </h3>
      </div>
      <div class="border-t border-gray-100">
        <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <img
            class="h-36 w-36 flex-none rounded-full bg-gray-50"
            src={`${import.meta.env.PUBLIC_IMAGE_BASE_URL}/properties/${property.images[0].url}`}
            alt=""
          ></img>
        </div>
        <dl class="divide-y divide-gray-100">
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-900">Description</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {property.description}
            </dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-900">Owner</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {property.ownedBy}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
})
