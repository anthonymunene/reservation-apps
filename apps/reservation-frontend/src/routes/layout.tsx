import { component$, Slot } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import type { DocumentHead } from '@builder.io/qwik-city';
import Header from '~/components/sidebar';
import Footer from '~/components/starter/footer/footer';

export const useServerTimeLoader = routeLoader$(() => {
  return {
    date: new Date().toISOString(),
  };
});

export default component$(() => {
  return (
    <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <Header />
      <div class="lg:pl-72">
        <main class="py-10">
          <Slot />
        </main>
        <Footer />
      </div>
    </div>
  );
});

export const head: DocumentHead = ({ head }) => {
  return {
    title: `Reservations - ${head.title}`,
  };
};
