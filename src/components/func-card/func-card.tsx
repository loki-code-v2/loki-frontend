import {
  $,
  Slot,
  component$,
  useSignal,
  useStore,
  useStylesScoped$,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { AbiFunction } from "abitype";
import { ethers } from "ethers";
import type { Abi } from "viem";
import { parseEther } from "viem";
import { NetworkNames } from "~/services/chainService";
import { isReadFunc, isWriteFunc } from "~/services/funcTypeService";
import { TryItMenu } from "../try-it-menu/try-it-menu";
import styles from "./func-card.scss?inline";
import { TryItBtn } from "./try-it-btn";

export interface FuncCardProps {
  func: AbiFunction;
  network: NetworkNames;
  address: `0x${string}`;
  abi: Abi;
}

export const FuncCard = component$<FuncCardProps>(
  ({ func, network, address, abi }) => {
    useStylesScoped$(styles);

    return (
      <>
        <sl-alert id="wallet-alert" variant="warning" closable>
          <sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
          <strong>Is your wallet connected?</strong>
        </sl-alert>
        <div class="function-wrapper">
          <div class="function-name flex-column">
            <div class="function-name-title">NAME</div>
            <div class="function-name-value">{func.name}</div>
            <sl-badge
              pill
              variant={isReadFunc(func) ? "primary" : "danger"}
              class="function-name-readwrite"
            >
              {isReadFunc(func) ? "READ" : "WRITE"}
            </sl-badge>
          </div>
          <div class="function-arguments flex-column">
            <div class="function-arguments-title">ARGS</div>
            <div class="arguments">
              {func.inputs.map((arg, index) => (
                <div class="func-args-value" key={index}>
                  <span>{arg.name}</span>
                  <sl-badge variant="neutral" class="badge" pill>
                    {arg.type.toUpperCase()}
                  </sl-badge>
                </div>
              ))}
            </div>
          </div>
          <Slot></Slot>
          <TryItBtn func={func} network={network} address={address} abi={abi} />
        </div>
      </>
    );
  }
);
