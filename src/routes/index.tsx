import {
  component$,
  useStyles$
} from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import LoginSignupCard from "~/components/login-signup-card/login-signup-card";
import styles from "./index.scss?inline";

export default component$(() => {

  useStyles$(styles);


  return (
    <>
      <LoginSignupCard />
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Loki Code",
  meta: [
    {
      name: "description",
      content: "Loki Code is a Smart Contract development platform",
    },
  ],
};
