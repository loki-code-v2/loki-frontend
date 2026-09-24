import { component$, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./arg-input.scss?inline";

interface ArgInputProps {
  mark: number;
  name: string;
  placeholder: string;
  arg: { name: string; type: string; internalType: string };
}

export const ArgInput = component$<ArgInputProps>(() => {
  useStylesScoped$(styles);

  return <></>;
});
