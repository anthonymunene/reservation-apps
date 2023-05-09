import { component$ } from '@builder.io/qwik';
import { QwikLogo } from '../starter/icons/qwik';

export default component$(() => {
  return (
    <header class="lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
        <div class="flex h-16 shrink-0 items-center">
          <a href="/" title="qwik">
            <QwikLogo />
          </a>
        </div>
        <nav class="flex flex-1 flex-col">
          <ul class="flex flex-1 flex-col gap-y-7">
            <li>
              <a
                class="bg-gray-800 text-white group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                href="/users"
              >
                Users
              </a>
            </li>
            <li>
              <a
                class="bg-gray-800 text-white group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                href="/properties"
              >
                Properties
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
});
