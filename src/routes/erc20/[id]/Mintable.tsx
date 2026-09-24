import {
  $,
  component$,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import {
  getAccount,
  readContract,
  waitForTransaction,
  writeContract,
} from "@wagmi/core";
import { ethers } from "ethers";
import { AlertService } from "~/services/alertService";
import { ChainService } from "~/services/chainService";

interface Props {
  contract: any;
  totalSupplyValue: { totalSupply: string };
}

/**
 * This component renders an input and button for minting new tokens.
 */
export default component$<Props>((props) => {
  const mintValue = useStore({ mint: 0 });
  const mintLoading = useSignal(false);
  const mintingAlert = useStore<{ value: null | Element }>({ value: null });
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

  // Attaches an event listener to the mint input, as soon as it is visible.
  useVisibleTask$(() => {
    mintingAlert.value = document.querySelector(`#minting-alert`);
    const mintInputSelector = `#mint-input`;

    document
      .querySelector(mintInputSelector)
      ?.addEventListener("sl-input", (event) => {
        ethers.utils.parseEther((event as any).target.value.toString());
        mintValue.mint = (event as any).target.value;
      });
  });

  // Calls the mint function on the contract and updates the total supply.
  const mint = $(async () => {
    try {
      const contractAddress = (props.contract.contractData as any).address;
      const abi = (props.contract.contractData as any).abi;
      const network = (props.contract.contractData as any).network;
      const chainId = ChainService.getChainId(network);
      const account = getAccount();
      const mintValueInEthFormat = ethers.utils.parseEther(
        mintValue.mint.toString()
      );

      mintLoading.value = true;
      const { hash } = await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: "mint",
        args: [account.address, mintValueInEthFormat],
        chainId: chainId,
      });

      await waitForTransaction({
        hash: hash,
      });

      mintLoading.value = false;
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
      alertData.message = "Minted " + mintValue.mint + " tokens!";
      alertData.iconName = "check-circle2";
      (mintingAlert.value as any)?.toast();
    } catch (error) {
      AlertService.notifyError("Error minting tokens.");
      console.log(error);
      mintLoading.value = false;
      alertData.type = "warning";
      alertData.title = "Minting failed!";
      alertData.message = "Try again later";
      alertData.iconName = "exclamation-triangle";
      (mintingAlert.value as any)?.toast();
    }
  });

  return (
    <>
      <sl-alert id="minting-alert" variant={alertData.type} closable>
        <sl-icon slot="icon" name={alertData.iconName}></sl-icon>
        <strong>{alertData.title}</strong>
        <br />
        {alertData.message}
      </sl-alert>
      <div class="flex-column">
        Mint tokens
        <div class="caption text-accent-icon">
          Use this option to mint new token supply. Just add the number of
          tokens you want to be minted and press “Mint”.
        </div>
        <sl-input
          type="number"
          id="mint-input"
          placeholder="e.g.: 100"
        ></sl-input>
        <sl-button
          loading={mintLoading.value}
          variant="primary"
          onClick$={() => mint()}
        >
          Mint
        </sl-button>
      </div>
    </>
  );
});
