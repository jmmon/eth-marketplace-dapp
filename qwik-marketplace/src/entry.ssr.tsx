import { renderToStream, RenderToStreamOptions } from '@builder.io/qwik/server';
import { manifest } from '@qwik-client-manifest';
import Root from './root';

/**
 * Server-Side Render method to be called by a server.
 */
export default function (opts: RenderToStreamOptions) {
  // Render the Root component to a string
  // Pass in the manifest that was generated from the client build
  return renderToStream(<Root />, {
    manifest,
    ...opts,
    streaming: {
      inOrder: {
        // strategy: 'disabled', // prevents streaming; forces server to get all resources before showing any html 
        strategy: 'auto',
        minimumChunkSize: 0, // for testing...
        initialChunkSize: 0,
      }
    }
  });
}
