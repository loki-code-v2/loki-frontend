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
import { ChainService, NetworkNames } from "~/services/chainService";
import { isReadFunc, isWriteFunc } from "~/services/funcTypeService";
import { TryItMenu } from "../try-it-menu/try-it-menu";
import { FuncCardProps } from "./func-card";
import styles from "./func-card.scss?inline";
import { getNetwork, switchNetwork } from "@wagmi/core";

export const TryItBtn = component$<FuncCardProps>(
  ({ func, network, address, abi }) => {
    useStylesScoped$(styles);

    const answer = useSignal("");
    const ethInput = useSignal("");
    const errorMsg = useSignal("");

    const transactionState = useStore<{
      state:
        | "processing-transaction"
        | "transaction-success"
        | "transaction-error"
        | "transaction-not-started";
    }>({ state: "transaction-not-started" });

    const functionInputs = useStore<{
      values: Array<{
        name: string;
        type: string;
        internalType: string;
        value: any;
      }>;
    }>({
      values: func.inputs.map((arg) => ({
        name: arg.name || "",
        type: arg.type,
        internalType: arg.internalType || "",
        value: "",
      })),
    });

    useVisibleTask$(() => {
      const dialogSelector = `#try-it-dialog-${func.name}`;
      const buttonSelector = `#try-it-button-${func.name}`;
      const dialog = document.querySelector(dialogSelector);
      const openButton = document.querySelector(buttonSelector);

      const openDialog = () => {
        transactionState.state = "transaction-not-started";
        (dialog as any)?.show();
      };

      openButton?.addEventListener("click", openDialog);

      dialog?.addEventListener("sl-request-close", (event) => {
        if ((event as any).detail.source === "overlay") {
          event.preventDefault();
        }
      });
    });

    // const transact = $(async (): Promise<any> => {
    //   const chainId = ChainService.getChainId(network);

    //   if (isReadFunc(func)) {
    //     try {
    //       const data = await readContract({
    //         address,
    //         abi: abi,
    //         functionName: func.name,
    //         chainId,
    //         args: functionInputs.values.map((i) => i.value),
    //       });
    //       debugger;
    //       answer.value = (data as any).toString();
    //       return data;
    //     } catch (error) {
    //       console.error("Read failed:", error);
    //       AlertService.notifyError("Read failed");
    //     }
    //   } else if (isWriteFunc(func)) {
    //     try {
    //       debugger;
    //       const { request } = await prepareWriteContract({
    //         address,
    //         abi,
    //         functionName: func.name,
    //         args: functionInputs.values.map((i) => i.value),
    //         chainId,
    //       });
    //       console.log('write input', {
    //         address,
    //         abi,
    //         functionName: func.name,
    //         args: functionInputs.values.map((i) => i.value),
    //         chainId,
    //       })
    //       const data = await writeContract(request);
    //       await waitForTransaction({ chainId, hash: data.hash });
    //       answer.value = "Transaction successful";
    //       return data;
    //     } catch (error) {
    //       console.error("Write failed:", error);
    //       AlertService.notifyError("Write failed");
    //     }
    //   } else {
    //     const errorMsg = `Invalid state mutability: ${func.stateMutability}`;
    //     console.error(errorMsg);
    //     AlertService.notifyError(errorMsg);
    //     throw new Error(errorMsg);
    //   }
    // });

    const transactViaWindowEthereum = $(async (): Promise<any> => {
      const { chain } = getNetwork();
      if (chain!.id !== ChainService.getChainId(network)) {
        await switchNetwork({
          chainId: ChainService.getChainId(network)!,
        });
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        address,
        JSON.stringify(abi),
        signer
      );

      if (!window.ethereum.selectedAddress) {
        throw new Error("Wallet not connected");
      }

      if (isReadFunc(func)) {
        const data = await contract[func.name](
          ...functionInputs.values.map((i) => i.value)
        );
        answer.value = data.toString();
        return data;
      } else if (isWriteFunc(func)) {
        const data = await contract[func.name](
          ...functionInputs.values.map((i) => i.value),
          {
            value: parseEther(ethInput.value),
          }
        );
        await data.wait();
        answer.value = "Transaction successful";
        return data;
      } else {
        const errorMsg = `Invalid state mutability: ${func.stateMutability}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
    });

    return (
      <div>
        <sl-dialog
          label={func.name}
          id={`try-it-dialog-${func.name}`}
          class={`try-it-dialog loki-dialog`}
        >
          {transactionState.state === "transaction-not-started" ? (
            <>
              <TryItMenu
                name={func.name}
                stateMutability={func.stateMutability}
                inputs={functionInputs.values}
                ethInput={ethInput}
              ></TryItMenu>
              <sl-button
                slot="footer"
                variant="primary"
                onClick$={async () => {
                  transactionState.state = "processing-transaction";
                  try {
                    if (network === NetworkNames.Buildbear) {
                      await transactViaWindowEthereum();
                    } else {
                      await transactViaWindowEthereum();
                    }
                    transactionState.state = "transaction-success";
                  } catch (error: any) {
                    transactionState.state = "transaction-error";
                    console.error("Transaction failed:", error);
                    errorMsg.value = error.message;

                    const walletAlert = document.querySelector("#wallet-alert");
                    (walletAlert as any)?.toast();
                  }
                }}
                style={{ width: "100%" }}
              >
                Transact
              </sl-button>
            </>
          ) : transactionState.state === "processing-transaction" ? (
            <div>Loading</div>
          ) : transactionState.state === "transaction-success" ? (
            <div>{answer.value}</div>
          ) : transactionState.state === "transaction-error" ? (
            <div>{errorMsg.value}</div>
          ) : null}
        </sl-dialog>
        <sl-button
          variant="primary"
          outline
          class="try-it-button"
          id={`try-it-button-${func.name}`}
        >
          Try it
        </sl-button>
      </div>
    );
  }
);
