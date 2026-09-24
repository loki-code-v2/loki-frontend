import {
  $,
  component$,
  useStylesScoped$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { abiFuncProps } from "~/services/chainService";
import styles from "./playground-search-bar.scss?inline";

interface PlaygroundSearchBarProps {
  abiFuncs: { value: Array<any> };
  abiFuncsFiltered: { value: Array<any> };
}

export const PlaygroundSearchBar = component$<PlaygroundSearchBarProps>(
  (props) => {
    useStylesScoped$(styles);

    useVisibleTask$(() => {
      const argInputValue = document.querySelector("#playground-search-bar");

      argInputValue?.addEventListener("sl-input", (event: Event) => {
        const inputValue = (event.target as HTMLInputElement).value;
        props.abiFuncsFiltered.value = props.abiFuncs.value.filter(
          (func: abiFuncProps) => {
            return func.name.toLowerCase().includes(inputValue.toLowerCase());
          }
        );
      });
    });

    return (
      <sl-input
        id="playground-search-bar"
        placeholder="Search function"
        class="search-bar"
      ></sl-input>
    );
  }
);
