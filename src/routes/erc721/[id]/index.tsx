import {
  $,
  component$,
  useSignal,
  useStore,
  useStyles$,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import {
  fetchBalance,
  getAccount,
  readContract,
  waitForTransaction,
  watchAccount,
  watchReadContract,
  writeContract,
} from "@wagmi/core";
import type { AxiosResponse } from "axios";
import axios from "axios";
import { ethers } from "ethers";
import Header from "~/components/header/header";
import LokiPage from "~/components/loki-page/loki-page";
import { ChainService } from "~/services/chainService";
import type { ApiResponse } from "~/services/httpClient/LokiClient";
import { TemplateService } from "~/services/templateService";
import { UserService } from "~/services/userService";
import styles from "./erc721[id].scss?inline";
import Web3Service from "~/services/web3Service";

export interface IContract {
  contractData: any;
  templateValues: {
    revenue: string;
    price: string;
    supply: string;
    minted: string;
    description: string;
  };
}

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
 * This component renders a private page for the contract creator to manage a specific ERC721 token, after it has been created.
 */
export default component$(() => {
  useStyles$(styles);
  const nav = useNavigate();
  const loc = useLocation();
  const imgURL = useStore<{ url: null | string }>({ url: null });
  const contract = useStore<IContract>({
    contractData: {},
    templateValues: {
      revenue: "",
      price: "",
      supply: "",
      minted: "",
      description: "",
    },
  });

  const totalSupplyValue = useStore({ totalSupply: "" });
  const maxSupplyValue = useStore({ maxSupply: "" });
  const balanceOfContract = useStore({ balance: "" });
  const contractOwnerValue = useStore({ owner: {} });
  const validRoute = useStore<{ status: boolean | "undefined" }>({
    status: "undefined",
  });
  const copyButtonMessage = useSignal("Copy Shareable Link");
  const isAuthorizedUser = useSignal(false);

  useVisibleTask$(async () => {
    // Sets up the web3modal which allows the user to connect their wallet to interact with the contract.
    await Web3Service.getInstance()

    // Gets the ERC721 contract data from the backend, based off the id given. Then gets data from the on-chain contract, and populates the corresponding local stores.
    await TemplateService.getERC721(loc.params.id)
      .then(async (response: ApiResponse<any>) => {
        validRoute.status = true;
        const imgIpfsUrl = formatImageIpfsUrl(
          response.data.templateFields,
          response.data.templateFieldsValues
        );
        getImageUrl(imgIpfsUrl).then((res) => {
          imgURL.url =
            "https://gateway.pinata.cloud/ipfs/" +
            res.data.image.replace("ipfs://", "");
        });
        const c = formatContractData(
          response.data.templateFields,
          response.data.templateFieldsValues,
          response.data.contract
        );
        contract.contractData = c.contractData;
        contract.templateValues = c.templateValues;
        const contractAddress = (contract.contractData as any).address;
        const abi = (contract.contractData as any).abi;
        const network = (contract.contractData as any).network;
        const chainId = ChainService.getChainId(network);

        try {
          contractOwnerValue.owner = await readContract({
            address: contractAddress,
            abi: abi,
            args: [],
            functionName: "owner",
          });

          const totalSupply = await readContract({
            address: contractAddress,
            abi: abi,
            args: [],
            functionName: "totalSupply",
            chainId: chainId,
          });
          totalSupplyValue.totalSupply = totalSupply.toString();

          const balance = await fetchBalance({
            address: contractAddress,
            chainId: chainId,
          });
          balanceOfContract.balance = ethers.utils
            .formatEther(balance.value)
            .toString();
        } catch (error: any) {
          console.log(error);
        }
      })
      .catch((error) => {
        console.error("File error", error);
        validRoute.status = false;
        nav("/dashboard");
      });

    if (getAccount().address === contractOwnerValue.owner) {
      isAuthorizedUser.value = true;
    }

    try {
      const account = getAccount();
      if (account.address === undefined) {
        console.log("User is not signed into wallet");
        await await Web3Service.openIfDisconnected();
      }

      // Watches for changes in the account.
      watchAccount(async (account) => {
        if (account.address === contractOwnerValue.owner) {
          isAuthorizedUser.value = true;
        } else {
          isAuthorizedUser.value = false;
        }
      });

      // Watches for changes in the contract balance.
      // TODO: This might not be doing anything.
      const config = {
        address: contract.contractData.address,
        abi: contract.contractData.abi,
        functionName: "balanceOf",
        args: [],
        chain: ChainService.getChainId((contract.contractData as any).network),
      };
      watchReadContract(
        config,
        (data_) => (balanceOfContract.balance = data_.toString())
      );
    } catch (error) {
      console.log(error);
    }
  });

  // Calls the withdraw function on the contract and updates the total supply.
  const withdraw = $(async () => {
    try {
      const contractAddress = (contract.contractData as any).address;
      const abi = (contract.contractData as any).abi;
      const network = (contract.contractData as any).network;
      const chainId = ChainService.getChainId(network);

      const { hash } = await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: "withdraw",
        args: [],
        chainId: chainId,
      });

      await waitForTransaction({
        hash: hash,
      });

      const totalSupply = await readContract({
        address: contractAddress,
        abi: abi,
        args: [],
        functionName: "totalSupply",
        chainId: chainId,
      });
      totalSupplyValue.totalSupply = totalSupply.toString();

      const maxSupply = await readContract({
        address: contractAddress,
        abi: abi,
        args: [],
        functionName: "MAX_SUPPLY",
        chainId: chainId,
      });
      maxSupplyValue.maxSupply = maxSupply.toString();
    } catch (error) {
      console.log(error);
    }
  });

  // Creates the url for the public version of this token's page, and then copies it to the clipboard.
  const copyPublicUrl = $(() => {
    const pathname = loc.url.toString();
    const publicPathName = pathname.replace("/erc721/", "/erc721/public/");
    navigator.clipboard.writeText(publicPathName);

    copyButtonMessage.value = "Copied!";
    setTimeout(() => {
      copyButtonMessage.value = "Copy Shareable Link";
    }, 2000);
  });

  // Dynamic rendering of the withdraw button.
  const withdrawButtonLogic = $(() => {
    if (!isAuthorizedUser.value) {
      return (
        <sl-button variant="primary" disabled>
          You must be the owner to withdraw
        </sl-button>
      );
    } else if (Number(balanceOfContract.balance) <= 0) {
      return (
        <sl-button variant="primary" disabled>
          There's nothing to withdraw
        </sl-button>
      );
    } else {
      return (
        <sl-button variant="primary" onClick$={() => withdraw()}>
          Withdraw
        </sl-button>
      );
    }
  });

  return (
    <>
      {validRoute.status && validRoute.status !== "undefined" ? (
        <>
          {/* We need this here for now because it tells qwik that something is different and it will trigger the usevisibletask. Some times I hate web dev =| */}
          <div class="invisible">ERC721 Manage</div>
          <LokiPage title="ERC721" showNavigationMenu={false}>
            <div q:slot="header">
              <w3m-core-button></w3m-core-button>
            </div>
            <div q:slot="sidebar">
              <sl-button
                variant="text"
                size="small"
                class="loki-text-button"
                onClick$={() => {
                  nav("/projects");
                }}
              >
                <sl-icon
                  class="font-size-small padding-right-1"
                  src="/icons/i-loki-back.svg"
                ></sl-icon>
                Back
              </sl-button>
            </div>
            <div q:slot="content" class="flex-column content">
              <div class="erc20-body">
                <sl-card>
                  <div class="nft-image">
                    {imgURL.url && (
                      <img
                        width="244"
                        height="206"
                        src={imgURL.url}
                        title="img"
                      />
                    )}
                  </div>
                  <div>
                    <h4 class="erc20-form-header">
                      {(contract.contractData as any).name}
                    </h4>
                  </div>
                  <div class="erc20-form-body flex-column">
                    <div>
                      Contract address:
                      <div class="caption text-accent-icon">
                        {(contract.contractData as any).address}
                      </div>
                    </div>
                    <div>
                      Wallet address that is authorized to withdraw:
                      <div class="caption text-accent-icon">
                        {contract.templateValues.revenue}
                      </div>
                    </div>
                    <div>
                      Minted
                      <div class="caption text-accent-icon">
                        {totalSupplyValue.totalSupply} of{" "}
                        {contract.templateValues.supply}
                      </div>
                    </div>
                    <div>
                      Contract Balance
                      <div class="caption text-accent-icon">
                        {balanceOfContract.balance}{" "}
                        {contract.contractData.network === "Ethereum"
                          ? "ETH"
                          : contract.contractData.network + "ETH"}
                      </div>
                    </div>
                    {withdrawButtonLogic()}
                    <sl-button
                      variant="neutral"
                      onClick$={() => copyPublicUrl()}
                    >
                      {copyButtonMessage.value}
                    </sl-button>
                  </div>
                </sl-card>
              </div>
            </div>
          </LokiPage>
        </>
      ) : (
        <div>
          <Header></Header>
          <div class="flex-column"> Loading</div>
        </div>
      )}
    </>
  );
});

// TODO: Should I move these functions back inside the component?
function getImageUrl(
  ipfsImageMetaData: string
): Promise<AxiosResponse<any, any>> {
  const ipfsMetadataCUID = ipfsImageMetaData.replace("ipfs://", "");
  return axios.get("https://gateway.pinata.cloud/ipfs/" + ipfsMetadataCUID);
}

function formatImageIpfsUrl(
  templateFields: Array<any>,
  templateFieldsValues: Array<any>
): string {
  return (templateFieldsValues as Array<any>).find(
    (field) =>
      field.fieldId ===
      (templateFields as Array<any>).find((field) => field.name === "image").id
  ).value;
}

function formatContractData(
  templateFields: Array<any>,
  templateFieldsValues: Array<any>,
  c: any
) {
  const contract: IContract = {
    contractData: {},
    templateValues: {
      revenue: "",
      price: "",
      supply: "",
      minted: "",
      description: "",
    },
  };
  contract.contractData = c;
  contract.templateValues.revenue = (templateFieldsValues as Array<any>).find(
    (fieldValue) =>
      fieldValue.fieldId ===
      (templateFields as Array<any>).find((field) => field.name === "revenue")
        .id
  ).value;

  contract.templateValues.description = (
    templateFieldsValues as Array<any>
  ).find(
    (fieldValue) =>
      fieldValue.fieldId ===
      (templateFields as Array<any>).find(
        (field) => field.name === "description"
      ).id
  ).value;

  contract.templateValues.price = (templateFieldsValues as Array<any>).find(
    (fieldValue) =>
      fieldValue.fieldId ===
      (templateFields as Array<any>).find((field) => field.name === "price").id
  ).value;

  contract.templateValues.supply = (templateFieldsValues as Array<any>).find(
    (fieldValue) =>
      fieldValue.fieldId ===
      (templateFields as Array<any>).find((field) => field.name === "supply").id
  ).value;
  return contract;
}