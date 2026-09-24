import {
  $,
  component$,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { readContract, waitForTransaction, writeContract } from "@wagmi/core";
import { ethers } from "ethers";
import { ChainService } from "~/services/chainService";

interface Props {
  contract: any;
  totalSupplyValue: { totalSupply: string };
}

/**
 * This component renders an input and button for minting new tokens.
 */
export default component$<Props>((props) => {
  const burnValue = useStore({ burn: 0 });
  const burnLoading = useSignal(false);
  const burningAlert = useStore<{ value: null | Element }>({ value: null });
  const alertData = useStore<{
    type: "warning" | "success";
    message: string;
    title: string;
    iconName: string;
  }>(() => ({
    type: "warning",
    message: "Try again later",
    title: "Minting failed!",
    iconName: "exclamation-triangle",
  }));

  // Attaches an event listener to the burn input, as soon as it is visible.
  useVisibleTask$(() => {
    burningAlert.value = document.querySelector(`#burning-alert`);
    const burnInputSelector = `#burn-input`;

    document
      .querySelector(burnInputSelector)
      ?.addEventListener("sl-input", (event) => {
        ethers.utils.parseEther((event as any).target.value.toString());
        burnValue.burn = (event as any).target.value;
      });
  });

  // Calls the burn function on the contract and updates the total supply.
  const burn = $(async () => {
    try {
      const contractAddress = (props.contract.contractData as any).address;
      const abi = (props.contract.contractData as any).abi;
      const network = (props.contract.contractData as any).network;
      const chainId = ChainService.getChainId(network);
      const burnValueInEthFormat = ethers.utils.parseEther(
        burnValue.burn.toString()
      );

      burnLoading.value = true;
      const { hash } = await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: "burn",
        args: [burnValueInEthFormat],
        chainId: chainId,
      });

      await waitForTransaction({
        hash: hash,
      });

      burnLoading.value = false;
      const totalSupply = await readContract({
        address: contractAddress,
        abi: abi,
        args: [],
        functionName: "totalSupply",
        chainId: chainId,
      });
      props.totalSupplyValue.totalSupply = totalSupply.toString();

      alertData.type = "success";
      alertData.title = "Success!";
      alertData.message = "Burned " + burnValue.burn + " tokens!";
      alertData.iconName = "check2-circle";
      (burningAlert.value as any)?.toast();
    } catch (error) {
      console.warn("burning failed", error);
      burnLoading.value = false;
      alertData.type = "warning";
      alertData.title = "Burning failed!";
      alertData.message = "Try again later";
      alertData.iconName = "exclamation-triangle";
      (burningAlert.value as any)?.toast();
    }
  });

  const burnButton = $(() => {
    if (parseInt(props.totalSupplyValue.totalSupply) <= 0) {
      return (
        <sl-button variant="primary" disabled>
          Burn
        </sl-button>
      );
    }
    return (
      <sl-button
        loading={burnLoading.value}
        variant="primary"
        onClick$={() => burn()}
      >
        Burn
      </sl-button>
    );
  });

  return (
    <>
      <sl-alert id="burning-alert" variant={alertData.type} closable>
        <sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
        <strong>{alertData.title}</strong>
        <br />
        {alertData.message}
      </sl-alert>
      <div class="flex-column">
        Burn tokens
        <div class="caption text-accent-icon">
          Use this option to burn token supply. Just add the number of tokens
          you want to be burned and press “burn”.
        </div>
        <sl-input
          type="number"
          id="burn-input"
          placeholder="e.g.: 100"
        ></sl-input>
        {burnButton()}
      </div>
    </>
  );
});
