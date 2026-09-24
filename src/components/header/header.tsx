import {
  Slot,
  component$,
  useStylesScoped$
} from "@builder.io/qwik";
import styles from "./header.scss?inline";

interface HeaderProps {
  title?: string;
}

export default component$((props: HeaderProps) => {
  useStylesScoped$(styles);

  return (
    <nav class="flex">
      <div class="flex ">
      {props.title && <p class="page-title ">{props.title}</p>}
      </div>
      <Slot />
    </nav>
  );
});
