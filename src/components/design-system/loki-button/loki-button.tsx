import { component$, Slot } from "@builder.io/qwik";

export default component$(() => {
  return (
    <sl-button>
      <Slot></Slot>
    </sl-button>
  );
});
