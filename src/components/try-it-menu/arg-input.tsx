import { component$, useVisibleTask$ } from "@builder.io/qwik";

export const ArgInput = component$<any>((props) => {
  useVisibleTask$(() => {
    const selector = `#argInput-${props.name}-${props.input.name}`;
    const argInputValue = document.querySelector(selector);

    const addQuotesIfNeeded = (str: string) => {
      // Regular expression to check if the string starts and ends with either " or '
      const regex = /^['"].*['"]$/;

      // If the string doesn't start and end with either " or ', add "
      if (!regex.test(str)) {
        str = `"${str}"`;
      }

      return str;
    };

    if (argInputValue) {
      argInputValue.addEventListener("sl-input", (event: Event) => {
        const inputValue = (event.target as HTMLInputElement).value;

        // Handles when the argument is an array.
        if (props.input.type.includes("[]")) {
          const parsedValue = JSON.parse(inputValue);
          props.input.value = parsedValue;
        }

        // Handle when argument is string.
        else if (props.input.type === "string") {
          props.input.value = addQuotesIfNeeded(inputValue);
        }

        // Handles when argument is anything else.
        else {
          props.input.value = inputValue;
        }
      });
    }
  });

  useVisibleTask$(() => {});

  return (
    <div>
      <sl-input id={`argInput-${props.name}-${props.input.name}`}></sl-input>
    </div>
  );
});
