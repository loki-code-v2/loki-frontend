import {
  component$,
  useSignal,
  useStylesScoped$,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { AbiFunction } from "abitype";
import { isReadFunc, isWriteFunc } from "~/services/funcTypeService";
import styles from "./js-card.scss?inline";
import {
  ethersRead,
  ethersReadTS,
  ethersWrite,
  ethersWriteTS,
  viemRead,
  viemReadTS,
  viemWrite,
  viemWriteTS,
  web3Read,
  web3ReadTS,
  web3Write,
  web3WriteTS,
} from "./library-code";
interface JsCardProps {
  func: AbiFunction;
  library: "web3" | "ethers" | "viem";
  network: any;
  address: `0x${string}`;
  abi: any;
}

export const JsCard = component$<JsCardProps>((props) => {
  useStylesScoped$(styles);

  const code = useSignal("");
  const tsSwitch = useSignal(false);
  const tsSwitchId = `ts-switch-${props.func.name}`;

  useVisibleTask$(() => {
    const tsSwitchSelector = `#ts-switch-${props.func.name}`;
    document
      .querySelector(tsSwitchSelector)
      ?.addEventListener("sl-change", (event) => {
        tsSwitch.value = (event as any).target.checked;
      });
  });

  useTask$(async ({ track }) => {
    track(() => props.library);
    track(() => tsSwitch.value);
    if (props.func.inputs === undefined) {
      return;
    }
    const args = props.func.inputs
      .map((arg) => {
        return arg.name + ", ";
      })
      .join("")
      .slice(0, -2);

    let result = "";

    if (props.library === "web3") {
      if (isReadFunc(props.func)) {
        if (tsSwitch.value) {
          result = web3ReadTS(
            props.func.name,
            args,
            JSON.stringify(props.abi, null, 2),
            props.address
          );
        } else {
          result = web3Read(
            props.func.name,
            args,
            JSON.stringify(props.abi, null, 2),
            props.address
          );
        }
      } else if (isWriteFunc(props.func)) {
        if (tsSwitch.value) {
          result = web3WriteTS(
            props.func.name,
            args,
            JSON.stringify(props.abi, null, 2),
            props.address
          );
        } else {
          result = web3Write(
            props.func.name,
            args,
            JSON.stringify(props.abi, null, 2),
            props.address
          );
        }
      }
    } else if (props.library === "ethers") {
      if (isReadFunc(props.func)) {
        if (tsSwitch.value) {
          result = ethersReadTS(
            props.func.name,
            args,
            JSON.stringify(props.abi, null, 2),
            props.address
          );
        } else {
          result = ethersRead(
            props.func.name,
            args,
            JSON.stringify(props.abi, null, 2),
            props.address
          );
        }
      } else if (isWriteFunc(props.func)) {
        if (tsSwitch.value) {
          result = ethersWriteTS(
            props.func.name,
            args,
            JSON.stringify(props.abi, null, 2),
            props.address
          );
        } else {
          result = ethersWrite(
            props.func.name,
            args,
            JSON.stringify(props.abi, null, 2),
            props.address
          );
        }
      }
    } else if (props.library === "viem") {
      if (isReadFunc(props.func)) {
        if (tsSwitch.value) {
          result = viemReadTS(
            props.func.name,
            args,
            "<ABI>",
            props.address,
            props.network.toLowerCase()
          );
        } else {
          result = viemRead(
            props.func.name,
            args,
            JSON.stringify(props.abi, null, 2),
            props.address,
            props.network.toLowerCase()
          );
        }
      } else if (isWriteFunc(props.func)) {
        if (tsSwitch.value) {
          result = viemWriteTS(
            props.func.name,
            args,
            JSON.stringify(props.abi, null, 2),
            props.address,
            props.network.toLowerCase()
          );
        } else {
          result = viemWrite(
            props.func.name,
            args,
            JSON.stringify(props.abi, null, 2),
            props.address,
            props.network.toLowerCase()
          );
        }
      }
    }

    code.value = result;
  });

  return (
    <div class="function-code-card">
      <div class="copy-button-wrapper">
        <sl-copy-button class="copy-button" value={code.value}>
          <sl-icon
            slot="copy-icon"
            src="/icons/i-loki-copy.svg"
            class="copy-icon"
          ></sl-icon>
        </sl-copy-button>
        <sl-switch
          id={tsSwitchId}
          class="ts-switch"
          checked={tsSwitch.value}
          size="small"
        >
          {tsSwitch.value ? "TS" : "JS"}
        </sl-switch>
      </div>
      <div class="code-container">
        <pre>
          {/* <code class="language-js">{generateCode()}</code> */}
          <code class="language-js">{code.value}</code>
        </pre>
      </div>
    </div>
  );
});
function track(arg0: () => any) {
  throw new Error("Function not implemented.");
}
