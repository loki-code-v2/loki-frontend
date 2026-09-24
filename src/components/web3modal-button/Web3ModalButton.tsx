import { component$, useVisibleTask$ } from "@builder.io/qwik";
import Web3Service from "~/services/web3Service";

export default component$(() => {
  useVisibleTask$(async () => {
    // Opens the Web3Modal if the user is not signed in, when the page first renders.
    await Web3Service.openIfDisconnected();
  });
  return <w3m-core-button></w3m-core-button>;
});
