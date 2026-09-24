import {
  component$,
  useStylesScoped$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { ArgInput } from "./arg-input";
import styles from "./try-it-menu.scss?inline";

interface TryItMenuProps {
  stateMutability: string;
  name: string;
  inputs: Array<{
    name: string;
    type: string;
    internalType: string;
    value: any;
  }>;
  ethInput: { value: string };
}

export const TryItMenu = component$((props: TryItMenuProps) => {
  useStylesScoped$(styles);
  useVisibleTask$(
    ({ track }) => {
      track(() => props.stateMutability);
      if (
        props.stateMutability === "payable" ||
        props.stateMutability === "nonpayable"
      ) {
        const ethInput = document.querySelector(`#ethInput-${props.name}`);
        if (ethInput) {
          ethInput.addEventListener("sl-input", (event) => {
            if (Number((event.target as HTMLInputElement).value) <= 0) {
              // TODO: Handle when user enters non-number or negative values
              props.ethInput.value = "0";
            } else {
              props.ethInput.value = (event.target as HTMLInputElement).value;
            }
          });
        }
      }
    },
    { strategy: "document-ready" }
  );

  return (
    <div>
      {props.stateMutability === "payable" && (
        <>
          <div>Value (optional)</div>
          <sl-input id={`ethInput-${props.name}`} placeholder="0.0"></sl-input>
        </>
      )}

      {props.inputs.map((input, index) => (
        <div key={index}>
          <div class="header">
            <div class="header-name">{input.name}</div>
            <sl-badge variant="neutral" class="badge" pill>
              {input.type}
            </sl-badge>
          </div>
          <div>
            <ArgInput name={props.name} input={input}></ArgInput>
          </div>
        </div>
      ))}
    </div>
  );
});
