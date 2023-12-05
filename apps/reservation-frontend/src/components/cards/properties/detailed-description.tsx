import { component$ } from '@builder.io/qwik';
type Props = {
  property: {
    amenities: {
      name: string;
    }[];
    id: string;
    title: string;
    description: string;
    city: string;
    countryCode: string;
    bedrooms: number;
    ownedBy: string;
    images: string;
    beds: number;
  };
};

export const DetailCard = component$((props: Props) => {
  const { property } = props;
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
            src="https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80"
            alt=""
          ></img>
        </div>
        <dl class="divide-y divide-gray-100">
          
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-900">Description</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{property.description}</dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-900">Owner</dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{property.ownedBy}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
});
