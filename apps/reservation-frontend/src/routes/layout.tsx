import { component$, Slot } from '@builder.io/qwik';
import Footer from '../components/footer/footer';
import Header from '../components/header/header';

export default component$(() => {
  return (
    <div class="container mx-auto sm:px-6 lg:px-8">
      <Header />
      <main>
        <Slot />
      </main>
      <Footer />
    </div>
  );
});
