import { component$, useStyles$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import styles from './header.css?inline';

export default component$(() => {
  useStyles$(styles);

  const pathname = useLocation().pathname;

  return (
    <header>
      <div class="header-inner">
        <section class="logo">
          <a href="/">Qwik City 🏙</a>
        </section>
        <nav>
          <a href="/users" class={{ active: pathname.startsWith('/users') }}>
            Users
          </a>
          <a href="/properties" class={{ active: pathname.startsWith('/properties') }}>
            Properties
          </a>
        </nav>
      </div>
    </header>
  );
});
