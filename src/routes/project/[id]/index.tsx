import { component$ } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";

/**
 * The original project file-viewer page was fully commented out (dead route).
 * The live project workspace lives at /project/[id]/deployments2 — redirect there.
 */
export const onRequest: RequestHandler = async (event) => {
  throw event.redirect(302, `/project/${event.params.id}/deployments2`);
};

export default component$(() => {
  return <div class="project-redirect" />;
});
