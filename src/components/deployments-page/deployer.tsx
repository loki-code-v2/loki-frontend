import type { QRL } from "@builder.io/qwik";
import {
  $,
  component$,
  useStore,
  useStylesScoped$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { getNetwork, switchNetwork } from "@wagmi/core";
import type { Abi, AbiConstructor } from "abitype";
import { ContractFactory } from "ethers";
import { AlertService, AlertVariant } from "~/services/alertService";
import type { Network, NetworkNames } from "~/services/chainService";
import { ChainService, getEthersSigner } from "~/services/chainService";
import BuildbearButton from "../buildbear-button/buildbear-button";
import { ConstructorInputsMenu } from "../constructor-inputs-menu/constructor-inputs-menu";
import { NetworkSelect } from "../network-selector/network-selector";
import styles from "./deployment-history-item.scss?inline";
import type { Argument } from "./models";

/**
 * Deployer Component
 *
 * This component handles the deployment of Solidity smart contracts.
 * It provides network selection, constructor inputs, and deployment functionalities.
 * It also supports Buildbear sandbox deployment.
 * The component emits events on successful and failed deployments.
 * It supports receiving preset information for constructor arguments and network selection, which is used mainly by the deployment request functionality.
 */
interface DeployerProps {
  abi: Abi;
  bytecode: string;
  contractName: string;
  onDeploymentSuccess$: QRL<
    (
      contractAddress: string,
      networkName: NetworkNames,
      chainId: number,
      abi: Abi,
      bytecode: string,
      constructorArgs?: Argument[]
    ) => void
  >;
  enabled?: boolean;
  isBuilbearEnabled?: boolean;
  isConstructorMenuEnabled?: boolean;
  isNetworkSelectorEnabled?: boolean;
  selectedNetwork?: NetworkNames;
  constructorArgs?: Argument[];
}

export default component$<DeployerProps>((props) => {
  useStylesScoped$(styles);

  // Unified store for component state
  const state = useStore<{
    hasConstructor: boolean;
    selectedSandbox: any | null;
    selectedNetwork: NetworkNames | null;
    constructorValues: Argument[];
    isDeployerEnabled: boolean;
    isDeploymentLoading: boolean;
  }>({
    hasConstructor: false,
    selectedSandbox: null,
    selectedNetwork: props.selectedNetwork || null,
    constructorValues: props.constructorArgs || [],
    isDeployerEnabled: false,
    isDeploymentLoading: false,
  });

  /**
   * Checks if the ABI has a constructor and updates the state accordingly.
   */
  const checkHasConstructor = $(() => {
    state.hasConstructor =
      Array.isArray(props.abi) &&
      props.abi.some((e: any) => e.type === "constructor");
  });

  /**
   * Handles the selection of a network.
   * @param network The selected network.
   */
  const handleNetworkSelect = $(async (network: Network | NetworkNames) => {
    state.selectedNetwork =
      typeof network === "string" ? network : network.name;
    state.selectedSandbox = null;
  });

  /**
   * Handles the selection of a Buildbear sandbox.
   * @param sandboxData The selected sandbox data.
   */
  const handleBuildbearSelectSandbox = $((sandboxData: any) => {
    state.selectedSandbox = sandboxData;
  });

  /**
   * Checks if the deployment can be enabled based on the current state and props.
   */
  const checkDeploymentEnabled = $(() => {
    state.isDeployerEnabled = !!(
      props.abi &&
      props.bytecode &&
      state.selectedNetwork
    );

    if (
      props.isBuilbearEnabled &&
      state.selectedNetwork === "Buildbear" &&
      !state.selectedSandbox
    ) {
      state.isDeployerEnabled = false;
    }

    if (state.hasConstructor) {
      const constructorDef = props.abi.find(
        (item: any) => item.type === "constructor"
      ) as AbiConstructor;

      if (constructorDef && constructorDef.inputs.length > 0) {
        const allArgsProvided = constructorDef.inputs.every((input: any) => {
          const arg = state.constructorValues.find(
            (arg) => arg.name === input.name
          );
          return arg && arg.value !== undefined && arg.value !== "";
        });

        if (!allArgsProvided) {
          state.isDeployerEnabled = false;
        }
      }
    }
  });

  /**
   * Deploys the contract using the provided ABI, bytecode, and constructor arguments.
   */
  const deployContract = $(async () => {
    try {
      state.isDeploymentLoading = true;
      const { chain } = getNetwork();

      if (chain!.id !== ChainService.getChainId(state.selectedNetwork!)) {
        await switchNetwork({
          chainId: ChainService.getChainId(state.selectedNetwork!)!,
        });
      }

      const signer = await getEthersSigner({
        chainId: ChainService.getChainId(state.selectedNetwork!),
      });
      const factory = new ContractFactory(
        JSON.stringify(props.abi),
        props.bytecode,
        signer
      );
      const contract = state.hasConstructor
        ? await factory.deploy(
            ...state.constructorValues.map((input) => input.value)
          )
        : await factory.deploy();

      const receipt = await contract.deployTransaction.wait();

      if (receipt.status !== 1) {
        throw new Error("Failed to deploy contract");
      }

      props.onDeploymentSuccess$(
        contract.address,
        state.selectedNetwork!,
        ChainService.getChainId(state.selectedNetwork!)!,
        props.abi,
        props.bytecode,
        state.constructorValues
      );

      AlertService.notify(
        "Your contract has been deployed successfully!",
        AlertVariant.success,
        "check-circle",
        10000
      );
    } catch (error: any) {
      console.error("Deployment error:", error);
      AlertService.notifyError(`Failed to deploy contract: ${error.message}`);
      AlertService.notifyError("Is your wallet connected?");
    } finally {
      state.isDeploymentLoading = false;
    }
  });

  /**
   * Saves the constructor values from the input data.
   * @param data The input data containing constructor values.
   */
  const saveConstructorValues = $(async (data: any) => {
    const constructorDef = props.abi.find(
      (item: any) => item.type === "constructor"
    ) as AbiConstructor;
    if (!constructorDef) {
      console.error("No constructor defined in ABI.");
      return;
    }

    const formattedArgs = constructorDef.inputs.map((input: any) => {
      const inputFromData = data.find((d: any) => d.name === input.name);
      if (
        !inputFromData ||
        inputFromData.value === undefined ||
        inputFromData.value === ""
      ) {
        throw new Error(
          `Value for ${input.name} is required and was not provided.`
        );
      }
      return {
        name: input.name,
        value: inputFromData.value,
        type: input.type,
        internalType: input.internalType,
      };
    });

    state.constructorValues = formattedArgs;
    checkDeploymentEnabled();
  });

  useVisibleTask$(({ track }) => {
    track(() => props.abi);
    track(() => props.bytecode);
    track(() => state.hasConstructor);
    track(() => state.selectedNetwork);
    track(() => state.selectedSandbox);
    checkDeploymentEnabled();
    checkHasConstructor();
  });

  return (
    <>
      <div class="flex-column">
        <NetworkSelect
          onNetworkChange$={handleNetworkSelect}
          enableBuildBear={false} // TODO: Change this to true when Buildbear bug is fixed.
          chainId={
            props.selectedNetwork
              ? ChainService.getChainId(props.selectedNetwork)
              : undefined
          }
        />
        <div class="flex">
          {state.hasConstructor && (
            <ConstructorInputsMenu
              constructorDefinition={
                props.abi.find(
                  (item: any) => item.type === "constructor"
                ) as AbiConstructor
              }
              constructorData={state.constructorValues}
              onSave={saveConstructorValues}
            />
          )}
          <sl-button
            disabled={!state.isDeployerEnabled || state.isDeploymentLoading}
            loading={state.isDeploymentLoading}
            onClick$={deployContract}
          >
            Deploy
          </sl-button>
          {state.selectedNetwork === "Buildbear" && (
            <BuildbearButton
              onSelectedSandbox$={handleBuildbearSelectSandbox}
            />
          )}
        </div>
        {state.selectedSandbox && (
          <sl-tag>
            {`Selected sandbox: ${state.selectedSandbox.sandboxId}`}
          </sl-tag>
        )}
      </div>
    </>
  );
});
