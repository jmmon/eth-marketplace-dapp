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
          <a href="/">Marketplace 🏙</a>
        </section>
        <nav>
          <a href="/register" class={{ active: pathname.startsWith('/register') }}>
            Register
          </a>
          <a href="/browse" class={{ active: pathname.startsWith('/browse') }}>
            Browse
          </a>
          <a href="/api" class={{ active: pathname.startsWith('/api') }}>
            API
          </a>
        </nav>
      </div>
    </header>
  );
});
