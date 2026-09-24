import type { NoSerialize } from "@builder.io/qwik";
import {
  $,
  component$,
  noSerialize,
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
import type { Network, NetworkNames } from "~/services/chainService";
import { ChainService } from "~/services/chainService";
import type { erc721FormType } from "~/services/templateService";
import { TemplateService } from "~/services/templateService";
import { UserService } from "~/services/userService";
import { cleanName } from "../erc20";
import styles from "./erc721.scss?inline";

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
 * This component renders a: create an ERC721 (NFT) token template page.
 */
export default component$(() => {
  useStylesScoped$(styles);
  const nav = useNavigate();
  const erc721Form = useStore<erc721FormType>({
    image: null,
    name: "",
    ticker: "",
    description: "",
    supply: 0,
    price: 0,
    revenue: "",
    network: null,
  });
  const file = useStore<{ value: null | NoSerialize<File> }>({ value: null });

  const isDeploymentEnabled = useSignal<boolean>(false);
  const isDeploymentLoading = useSignal<boolean>(false);

  const compileAndDeployERC721 = $(async () => {
    try {
      isDeploymentLoading.value = true;
      const compiledCode = await TemplateService.compileERC721(erc721Form);
      // make call to deploy using wallet connect
      const contract = await ChainService.deployWithWalletConnect(
        compiledCode.data.code.contracts[0].abi,
        compiledCode.data.code.contracts[0].evm.bytecode,
        erc721Form.network!
      );
      const deployedContract = await contract.deployed();
      const createERC20Response = await TemplateService.createERC721({
        erc721Form: erc721Form as erc721FormType,
        ipfsUrl: (compiledCode as any).data.ipfsUrl,
        contract: {
          name: erc721Form.name,
          abi: compiledCode.data.code.contracts[0].abi,
          bytecode: compiledCode.data.code.contracts[0].evm.bytecode,
          address: deployedContract.address,
          network: erc721Form.network,
        },
      });
      const cuid = createERC20Response.data.contract.cuid;
      isDeploymentLoading.value = false;
      nav("/erc721/" + cuid);
    } catch (error) {
      AlertService.notifyError("Error deploying contract");
      console.error(error);
      isDeploymentLoading.value = false;
    }
  });

  useVisibleTask$(({ track }) => {
    track(() => erc721Form.image);
    track(() => erc721Form.name);
    track(() => erc721Form.ticker);
    track(() => erc721Form.description);
    track(() => erc721Form.supply);
    track(() => erc721Form.price);
    track(() => erc721Form.revenue);
    track(() => erc721Form.network);
    // validate form
    if (
      erc721Form.image &&
      erc721Form.name &&
      erc721Form.ticker &&
      erc721Form.description &&
      erc721Form.supply &&
      erc721Form.price &&
      erc721Form.revenue &&
      erc721Form.network
    ) {
      isDeploymentEnabled.value = true;
    } else {
      isDeploymentEnabled.value = false;
    }
  });

  useVisibleTask$(async () => {
    const fileInput = `#file-selector`;
    const contractNameInput = `#contract-name-input`;
    const tickerInputSelector = `#ticker-input`;
    const descriptionInputSelector = `#description-input`;
    const supplyInputSelector = `#supply-input`;
    const priceInputSelector = `#price-input`;
    const revenueInputSelector = `#revenue-input`;

    document.querySelector(fileInput)?.addEventListener("change", (event) => {
      const fileList = (event.target as HTMLInputElement).files;
      if (!fileList) {
        console.error("No file selected");
        return;
      }
      if (fileList.length === 1) {
        file.value = noSerialize(fileList[0]);
        erc721Form.image = file.value;
      }
    });

    // Attaches an event listener to each input, as soon as it is visible.
    document
      .querySelector(contractNameInput)
      ?.addEventListener("sl-input", (event) => {
        erc721Form.name = cleanName((event as any).target.value);
      });
    document
      .querySelector(tickerInputSelector)
      ?.addEventListener("sl-input", (event) => {
        erc721Form.ticker = cleanName((event as any).target.value);
      });
    document
      .querySelector(descriptionInputSelector)
      ?.addEventListener("sl-input", (event) => {
        erc721Form.description = (event as any).target.value;
      });
    document
      .querySelector(supplyInputSelector)
      ?.addEventListener("sl-input", (event) => {
        erc721Form.supply = (event as any).target.value;
      });
    document
      .querySelector(priceInputSelector)
      ?.addEventListener("sl-input", (event) => {
        erc721Form.price = (event as any).target.value;
      });
    document
      .querySelector(revenueInputSelector)
      ?.addEventListener("sl-input", (event) => {
        erc721Form.revenue = (event as any).target.value;
      });
    AlertService.notify(
      "Please do not leave this page while the deployment is loading. Doing so will prevent Loki.code from having access to your deployment data."
    );
  });

  return (
    <>
      {/* We need this here for now because it tells qwik that something is different and it will trigger the usevisibletask. Some times I hate web dev =| */}
      <div class="invisible">ERC 721</div>
      <LokiPage title="ERC721" showNavigationMenu={false}>
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
        <div q:slot="content" class="erc20-body">
          <sl-card>
            <div class="erc20-form-header">NFT Drop - ERC721</div>
            <div class="erc20-form-body flex-column">
              <sl-input
                id="file-input"
                label="Upload Image"
                help-text=" This is the image that will associated with your NFT."
                value={
                  erc721Form.image?.name !== "" ? erc721Form.image?.name : ""
                }
                disabled={true}
                class="loki-disabled-input"
              ></sl-input>
              <input
                type="file"
                id="file-selector"
                style="display: none;"
                multiple={false}
              ></input>
              <sl-button-group style={"width:100%"}>
                <sl-button
                  style={"width: -webkit-fill-available;"}
                  onClick$={() => {
                    const fileSelector =
                      document.getElementById("file-selector");
                    if (fileSelector) {
                      fileSelector.click();
                    }
                  }}
                  variant="neutral"
                >
                  Choose file
                </sl-button>
                {file.value && (
                  <sl-tooltip disabled={false}>
                    <div slot="content">
                      <img
                        title="test"
                        src={URL.createObjectURL(file.value)}
                      ></img>
                    </div>
                    <sl-button variant="neutral">
                      <sl-icon name="eye"></sl-icon>
                    </sl-button>
                  </sl-tooltip>
                )}
              </sl-button-group>

              <sl-input
                id="contract-name-input"
                label="Contract name"
                help-text="Your contract name will appear wherever your Contract is mentioned. This name cannot be changed in the future."
                placeholder="e.g.: SuperNFT"
              ></sl-input>
              <sl-input
                id="ticker-input"
                label="Ticker"
                help-text="This is just a shorthand for your token, like ETH is the ticker for Ethereum."
                placeholder="e.g.: SNFT"
              ></sl-input>
              <sl-textarea
                id="description-input"
                label="Description"
                help-text="Describe your NFT. This data will be used by OpenSea and other NFT marketplaces."
                placeholder="This is a cool NFT representing..."
              ></sl-textarea>
              <sl-input
                id="supply-input"
                type="number"
                label="Supply"
                help-text="This is the number of the maximum NFTs that will be available to be bought during public sale."
                placeholder="e.g. 100"
              ></sl-input>
              <sl-input
                id="price-input"
                type="number"
                label="Price"
                help-text="The base price per single NFT the minter will pay (plus the gas fee) during the public sale."
                placeholder="e.g. 0.05"
              ></sl-input>
              <sl-input
                id="revenue-input"
                label="Revenue"
                help-text="The wallet address that will receive the revenue from the public sale. Usually this is the wallet address of the NFT creator."
                placeholder="Paste wallet address"
              ></sl-input>
              <div>Select deploy network</div>
              <NetworkSelect
                onNetworkChange$={$((e: Network | NetworkNames) => {
                  if (typeof e === "string") {
                    erc721Form.network = e;
                    return;
                  } else if (typeof e === "object") {
                    erc721Form.network = e.name;
                  }
                })}
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
                onClick$={compileAndDeployERC721}
              >
                Deploy
              </sl-button>
            </div>
            <div class="erc20-form-footer checkbox-help-text">
              By deploying this template you agree to Loki Code's
              <nav>Terms of Services</nav>
            </div>
          </sl-card>
        </div>
      </LokiPage>
    </>
  );
});

export const head: DocumentHead = {
  title: "erc721",
};
