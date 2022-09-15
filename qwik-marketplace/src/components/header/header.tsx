import { component$, useStyles$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import styles from './header.css?inline';

import { SessionContext } from "~/libs/context";

export default component$(({connect$}) => {
  useStyles$(styles);

  return (
    <header>
      <div class="header-inner">
        <button class="bg-gray-100 p-2" onClick$={connect$}>
          Connect Metamask
          </button>
        <section>
          Connect With Your Metamask Wallet To Buy Items
        </section>
      </div>
    </header>
  );
});
