import type { QRL } from "@builder.io/qwik";
import {
  $,
  component$,
  useSignal,
  useStore,
  useStylesScoped$,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { SlDialog, SlInput } from "@shoelace-style/shoelace";
import type { AbiConstructor } from "abitype";
import type { Argument } from "../deployments-page/models";
import styles from "./constructor-inputs-menu.scss?inline";

/**
 * ConstructorInputsMenu Component
 * 
 * This component handles the input of constructor arguments for smart contract deployment.
 * It provides a modal dialog for users to input and save constructor arguments.
 * The component emits an event with the constructor arguments when the user saves the input.
 * It supports receiving constructor definition and preset constructor arguments.
 * If it receives preset constructor arguments, it will display them in the input fields.
 */
type ConstructorInputsMenuProps = {
  constructorDefinition: AbiConstructor;
  constructorData?: Argument[];
  onSave: QRL<(data: Argument[]) => void>;
};

export const ConstructorInputsMenu = component$<ConstructorInputsMenuProps>(
  ({ constructorData = [], onSave, constructorDefinition }) => {
    useStylesScoped$(styles);
    const randomId = useSignal(Math.random().toString(36).substring(7));
    const constructorInputsStore = useStore<{
      currentArguments: Argument[];
      savedArguments: Argument[];
    }>({
      currentArguments: [],
      savedArguments: []
    });

    /**
     * Initializes the arguments for the constructor inputs based on the constructor definition and provided data.
     * Ensures the provided data matches the constructor definition.
     * @param constructorDefinition The ABI constructor definition.
     * @param constructorData The provided constructor argument values.
     * @returns The initialized argument values.
     */
    const initializeArguments = $((constructorDefinition: AbiConstructor, constructorData: Argument[]) => {
      return constructorDefinition.inputs.map((input, index) => {
        const matchingArg = constructorData.find(arg => arg.name === input.name && arg.type === input.type);
        return {
          name: input.name || `param${index}`,
          type: input.type,
          internalType: input.internalType || "",
          value: matchingArg ? matchingArg.value : ""
        };
      });
    })



    /**
     * Handles the change of input values in the constructor arguments.
     * @param name The name of the argument.
     * @param value The value of the argument.
     */
    const handleInputChange = $((name: string, value: string) => {
      const argIndex = constructorInputsStore.currentArguments.findIndex(
        (arg) => arg.name === name
      );
      if (argIndex !== -1) {
        constructorInputsStore.currentArguments[argIndex].value = value;
      }
    });

    /**
     * Sets up event listeners for the component's DOM elements.
     */
    const setupEventListeners = $(() => {
      const saveButton = document.querySelector(
        `#save-button-${randomId.value}`
      );
      const constructorDialog = document.querySelector(
        `#constructor-dialog-${randomId.value}`
      ) as SlDialog;
      const constructorButton = document.querySelector(
        `#constructor-button-${randomId.value}`
      );

      if (!saveButton || !constructorDialog || !constructorButton) {
        console.error("Required elements not found for event listeners.");
        return;
      }

      constructorDialog.addEventListener("sl-show", () => {
        constructorInputsStore.currentArguments =
          constructorInputsStore.savedArguments.map((arg) => ({ ...arg }));
        constructorDefinition.inputs.forEach((input, index) => {
          const inputElement = document.querySelector(
            `#constructorInput-${input.name || `param${index}`}-${randomId.value}`
          ) as SlInput;
          if (inputElement) {
            inputElement.value =
              constructorInputsStore.currentArguments.find(
                (storedArg) => storedArg.name === (input.name || `param${index}`)
              )?.value || "";
          }
        });
      });

      saveButton.addEventListener("click", () => {
        constructorInputsStore.savedArguments =
          constructorInputsStore.currentArguments.map((arg) => ({ ...arg }));
        onSave(constructorInputsStore.currentArguments);
        constructorDialog.hide();
      });

      constructorButton.addEventListener("click", () => {
        constructorDialog.show();
      });

      constructorDefinition.inputs.forEach((input, index) => {
        const inputElement = document.querySelector(
          `#constructorInput-${input.name || `param${index}`}-${randomId.value}`
        ) as SlInput;
        if (inputElement) {
          inputElement.addEventListener("sl-input", () => {
            handleInputChange(input.name || `param${index}`, inputElement.value);
          });
        }
      });
    });

    useVisibleTask$(async ({ track }) => {
      track(() => constructorData);
      constructorInputsStore.savedArguments = await initializeArguments(constructorDefinition, constructorData);
      constructorInputsStore.currentArguments = await initializeArguments(constructorDefinition, constructorData);
    });

    useVisibleTask$(() => {
      setupEventListeners();
    });

    useTask$(async () => {
      //initialize arguments
      constructorInputsStore.savedArguments = await initializeArguments(constructorDefinition, constructorData);
      constructorInputsStore.currentArguments = await initializeArguments(constructorDefinition, constructorData);
    });

    return (
      <>
        <sl-button
          variant="primary"
          outline
          id={`constructor-button-${randomId.value}`}
        >
          Set constructor arguments
        </sl-button>
        <sl-dialog
          label="Constructor arguments"
          id={`constructor-dialog-${randomId.value}`}
        >
          {constructorDefinition.inputs.length > 0 && (
            <div>
              {constructorDefinition.inputs.map((input, index) => (
                <div key={index}>
                  <div>{input.name || `param${index}`}</div>
                  <div>
                    <sl-input
                      id={`constructorInput-${input.name || `param${index}`}-${randomId.value}`}
                      placeholder={input.type}
                      class="constructor-input"
                      name={input.name || `param${index}`}
                      value={constructorInputsStore.currentArguments.find(
                        (arg) => arg.name === (input.name || `param${index}`)
                      )?.value || ""}
                    ></sl-input>
                  </div>
                </div>
              ))}
            </div>
          )}

          <sl-button
            slot="footer"
            variant="primary"
            id={`save-button-${randomId.value}`}
          >
            Save
          </sl-button>
        </sl-dialog>
      </>
    );
  }
);
