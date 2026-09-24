import {
  $,
  component$,
  useSignal,
  useStore,
  useStylesScoped$,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { useNavigate } from "@builder.io/qwik-city";
import LokiPage from "~/components/loki-page/loki-page";
import { NetworkSelect } from "~/components/network-selector/network-selector";
import Web3ModalButton from "~/components/web3modal-button/Web3ModalButton";
import { AlertService } from "~/services/alertService";
import type { Network } from "~/services/chainService";
import { ChainService, NetworkNames } from "~/services/chainService";
import type { erc20FormType } from "~/services/templateService";
import { TemplateService } from "~/services/templateService";
import { UserService } from "~/services/userService";
import styles from "./erc20.scss?inline";



/**
 * Removes spaces and invalid characters from @param input
 *
 * @param input - The original string
 * @returns The cleaned string
 */
export const cleanName = (input: string) => {
  const cleanedInput = input.replace(/\s+/g, "").replace(/[^a-zA-Z0-9_]/g, "");
  return cleanedInput;
};
export const onRequest: RequestHandler = async (event: any) => {
  // make a request to the backendend to figure if the user is logged in
  try {
    await UserService.userSession();

  } catch (error) {
    console.log("Error fetching user session", error);
    throw event.redirect(302, `/`);
  }
};
/**
 * This component renders a: create an ERC20 token template page.
 */
export default component$(() => {
  useStylesScoped$(styles);
  const nav = useNavigate();

  const isDeploymentEnabled = useSignal<boolean>(false);
  const isDeploymentLoading = useSignal<boolean>(false);
  const erc20Form = useStore<erc20FormType>({
    name: "",
    ticker: "",
    supply: 0,
    isMintable: false,
    isBurnable: false,
    network: NetworkNames.Ethereum,
  });

  const compileAndDeployERC20 = $(async () => {
    try {
      isDeploymentLoading.value = true;
      const compiledCode = await TemplateService.compileERC20(erc20Form);
      const contract = await ChainService.deployWithWalletConnect(
        compiledCode.data.contracts[0].abi,
        compiledCode.data.contracts[0].evm.bytecode,
        erc20Form.network!
      );
      const deployedContract = await contract.deployed();
      const createERC20Response = await TemplateService.createERC20({
        erc20Form: erc20Form as erc20FormType,
        contract: {
          name: erc20Form.name,
          abi: compiledCode.data.contracts[0].abi,
          bytecode: compiledCode.data.contracts[0].evm.bytecode,
          address: deployedContract.address,
          network: erc20Form.network,
        },
      });
      const cuid = createERC20Response.data.contract.cuid;
      isDeploymentLoading.value = false;
      nav("/erc20/" + cuid);
    } catch (error) {
      AlertService.notifyError("Error deploying contract");
      console.error(error);
      isDeploymentLoading.value = false;
    }
  });

  const handleNetworkChange = $((network: NetworkNames | Network) => {
    if (typeof network === "string") {
      erc20Form.network = network;
    } else {
      erc20Form.network = network.name;
    }
  });

  useVisibleTask$(async () => {
    const nameInputSelector = `#name-input`;
    const tickerInputSelector = `#ticker-input`;
    const supplyInputSelector = `#supply-input`;
    const mintableInputSelector = `#mintable-input`;
    const burnableInputSelector = `#burnable-input`;
    // Attaches an event listener to each input, as soon as it is visible.
    document
      .querySelector(nameInputSelector)
      ?.addEventListener("sl-input", (event) => {
        erc20Form.name = cleanName((event as any).target.value);
      });
    document
      .querySelector(tickerInputSelector)
      ?.addEventListener("sl-input", (event) => {
        erc20Form.ticker = cleanName((event as any).target.value);
      });
    document
      .querySelector(supplyInputSelector)
      ?.addEventListener("sl-input", (event) => {
        erc20Form.supply = (event as any).target.value;
      });
    document
      .querySelector(mintableInputSelector)
      ?.addEventListener("sl-input", (event) => {
        erc20Form.isMintable = (event as any).target.checked;
      });
    document
      .querySelector(burnableInputSelector)
      ?.addEventListener("sl-input", (event) => {
        erc20Form.isBurnable = (event as any).target.checked;
      });
  });

  useVisibleTask$(({ track }) => {
    track(() => erc20Form.name);
    track(() => erc20Form.ticker);
    track(() => erc20Form.supply);

    if (
      erc20Form.name &&
      erc20Form.ticker &&
      erc20Form.supply &&
      erc20Form.network
    ) {
      isDeploymentEnabled.value = true;
    } else {
      isDeploymentEnabled.value = false;
    }
  });
  return (
    <>
      <LokiPage title="ERC20" showNavigationMenu={false}>
        <div q:slot="header">
          <Web3ModalButton></Web3ModalButton>
        </div>
        <div q:slot="sidebar">
          <sl-button
            variant="text"
            size="small"
            class="loki-text-button"
            onClick$={() => {
              nav("/templates");
            }}
          >
            <sl-icon
              class="font-size-small padding-right-1"
              src="/icons/i-loki-back.svg"
            ></sl-icon>
            Back
          </sl-button>
        </div>
        <div q:slot="content" class="flex-column">
          <div class="erc20-body">
            <sl-card>
              <div class="erc20-form-header">ERC20 Basic Token</div>
              <div class="erc20-form-body flex-column">
                <sl-input
                  id="name-input"
                  label="Name"
                  help-text="This name cannot be changed later!"
                  placeholder="e.g.: My awesome token"
                ></sl-input>
                <sl-input
                  id="ticker-input"
                  label="Ticker"
                  help-text="This is just a shorthand for your token, like ETH is the ticker for Ethereum"
                  placeholder="e.g.: MTA"
                ></sl-input>
                <sl-input
                  type="number"
                  id="supply-input"
                  label="Total Supply"
                  help-text="The total supply represents the total number of your token in circulation. Because this ERC20 token has 18 decimal places, the total supply you input will be multiplied by 10¹⁸."
                  placeholder="e.g.: 1000000"
                ></sl-input>
                <div class="grid">
                  <sl-checkbox id="mintable-input">
                    Mint new supply
                    <p class="checkbox-help-text">
                      By enabling this option the admin (you) can mint new
                      tokens at will whenever they want, making the total supply
                      elastic and not finite.
                    </p>
                  </sl-checkbox>
                  <sl-checkbox id="burnable-input">
                    Burnable
                    <p class="checkbox-help-text">
                      By enabling this option the admin can burn (destroy)
                      existing tokens in case you want to decrease the supply
                      overtime.
                    </p>
                  </sl-checkbox>
                </div>
                <div class="divider">
                  <div></div>
                </div>
                <div>Select deploy network</div>
                <NetworkSelect
                  onNetworkChange$={handleNetworkChange}
                ></NetworkSelect>
                <div class="caption text-accent-icon">
                  Select a blockchain network you want to deploy to. Some chains
                  have higher deployment fees than others, so make sure you have
                  enough funds in your wallet.
                </div>
                <sl-button
                  disabled={
                    !isDeploymentEnabled.value || isDeploymentLoading.value
                  }
                  loading={isDeploymentLoading.value}
                  onClick$={compileAndDeployERC20}
                >
                  Deploy
                </sl-button>
              </div>

              <div class="erc20-form-footer checkbox-help-text">
                By deploying this template you agree to Loki Code's{" "}
                <nav>Terms of Services</nav>
              </div>
            </sl-card>
          </div>
        </div>
      </LokiPage>
    </>
  );
});

export const head: DocumentHead = {
  title: "erc20",
};
