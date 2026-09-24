import {
  $,
  component$,
  useStore,
  useStyles$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import Header from "~/components/header/header";

import {
  getAccount,
  readContract,
  waitForTransaction,
  writeContract,
} from "@wagmi/core";
import axios from "axios";
import { ethers } from "ethers";
import LokiPage from "~/components/loki-page/loki-page";
import { ChainService } from "~/services/chainService";
import { ApiResponse } from "~/services/httpClient/LokiClient";
import { TemplateService } from "~/services/templateService";
import type { IContract } from "../../[id]";
import styles from "./erc721[id].scss?inline";
import Web3Service from "~/services/web3Service";

/**
 * This component renders a public page for anyone to mint a specific ERC721 token, after it has been created.
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
  const validRoute = useStore<{ status: boolean | "undefined" }>({
    status: "undefined",
  });

  useVisibleTask$(async () => {
    // Sets up the web3modal which allows the user to connect their wallet to interact with the contract.
    await Web3Service.getInstance();

    // Gets the ERC721 contract data from the backend, based off the id given. Then gets data from the on-chain contract, and populates the corresponding local stores.
    await TemplateService.getERC721Public(loc.params.id)
      .then(async (response) => {
        setImageUrl(response, imgURL);
        validRoute.status = true;

        contract.contractData = response.data.contract;
        setTemplateValues(contract, response);
        try {
          const contractAddress = (contract.contractData as any).address;
          const abi = (contract.contractData as any).abi;
          const network = (contract.contractData as any).network;
          const chainId = ChainService.getChainId(network);

          const totalSupply = await readContract({
            address: contractAddress,
            abi: abi,
            args: [],
            functionName: "totalSupply",
            chainId: chainId,
          });
          totalSupplyValue.totalSupply = totalSupply.toString();
        } catch (error) {
          console.log(error);
        }
      })
      .catch((error) => {
        console.error("File error", error);
        validRoute.status = false;
        nav("/dashboard");
      });
  });

  // Calls the mint function on the contract and updates the total supply.
  const mint = $(async () => {
    const contractAddress = (contract.contractData as any).address;
    const abi = (contract.contractData as any).abi;
    const address = getAccount().address;
    const network = (contract.contractData as any).network;
    const chainId = ChainService.getChainId(network);
    try {
      const { hash } = await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: "safeMint",
        args: [address],
        chainId: chainId,
        value: ethers.utils
          .parseEther(contract.templateValues.price)
          .toBigInt(),
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
    } catch (error) {
      console.log(error);
    }
  });

  const mintButton = $(() => {
    if (totalSupplyValue.totalSupply < contract.templateValues.supply) {
      return (
        <sl-button variant="primary" onClick$={() => mint()}>
          Mint
        </sl-button>
      );
    }
    return (
      <sl-button variant="primary" disabled>
        Mint
      </sl-button>
    );
  });

  const maxTotalSupply = $(() => {
    return (
      <div>
        Max total supply
        <div class="caption text-accent-icon">
          {totalSupplyValue.totalSupply} / {contract.templateValues.supply}
        </div>
      </div>
    );
  });

  return (
    <>
      {validRoute.status && validRoute.status !== "undefined" ? (
        <>
          {/* We need this here for now because it tells qwik that something is different and it will trigger the usevisibletask. Some times I hate web dev =| */}
          <div class="invisible">ERC721 Manage Public</div>
          <LokiPage title="ERC721" showNavigationMenu={false}>
            <div q:slot="header">
              <w3m-core-button></w3m-core-button>
            </div>
            <div q:slot="content" class="flex-column content">
              <div class="erc20-body">
                <sl-card>
                  <div class="nft-image">
                    {imgURL.url && <img src={imgURL.url} title="img" />}
                  </div>
                  <div>
                    <h4 class="erc20-form-header">
                      {(contract.contractData as any).name}
                    </h4>
                  </div>
                  <div class="erc20-form-body flex-column">
                    <div>
                      Created by:
                      <div class="caption text-accent-icon">
                        {contract.templateValues.revenue}
                      </div>
                    </div>
                    <div>{contract.templateValues.description}</div>
                    <div>
                      Price
                      <div class="caption text-accent-icon">
                        {contract.templateValues.price}{" "}
                        {contract.contractData.network === "Ethereum"
                          ? "ETH"
                          : contract.contractData.network + "ETH"}
                      </div>
                    </div>
                    {mintButton()}
                    {maxTotalSupply()}
                  </div>
                </sl-card>
              </div>
            </div>
          </LokiPage>
        </>
      ) : (
        <>
          <Header>
            <w3m-core-button></w3m-core-button>
          </Header>
          <div style="flex-grow: 1;" class="grid-center">
            <sl-spinner style="font-size: 3rem;"></sl-spinner>
          </div>
        </>
      )}
    </>
  );
});

// TODO: Should I move these functions back inside the component?
function setTemplateValues(
  contract: {
    contractData: {};
    templateValues: {
      revenue: string;
      price: string;
      supply: string;
      minted: string;
      description: string;
    };
  },
  response: ApiResponse<any>
) {
  contract.templateValues.revenue = (
    response.data.templateFieldsValues as Array<any>
  ).find(
    (fieldValue) =>
      fieldValue.fieldId ===
      (response.data.templateFields as Array<any>).find(
        (field) => field.name === "revenue"
      ).id
  ).value;

  contract.templateValues.description = (
    response.data.templateFieldsValues as Array<any>
  ).find(
    (fieldValue) =>
      fieldValue.fieldId ===
      (response.data.templateFields as Array<any>).find(
        (field) => field.name === "description"
      ).id
  ).value;

  contract.templateValues.price = (
    response.data.templateFieldsValues as Array<any>
  ).find(
    (fieldValue) =>
      fieldValue.fieldId ===
      (response.data.templateFields as Array<any>).find(
        (field) => field.name === "price"
      ).id
  ).value;

  contract.templateValues.supply = (
    response.data.templateFieldsValues as Array<any>
  ).find(
    (fieldValue) =>
      fieldValue.fieldId ===
      (response.data.templateFields as Array<any>).find(
        (field) => field.name === "supply"
      ).id
  ).value;
}

function setImageUrl(
  response: ApiResponse<any>,
  imgURL: { url: null | string }
) {
  const ipfsImageMetaData = (
    response.data.templateFieldsValues as Array<any>
  ).find(
    (field) =>
      field.fieldId ===
      (response.data.templateFields as Array<any>).find(
        (field) => field.name === "image"
      ).id
  ).value;
  const ipfsMetadataCUID = (ipfsImageMetaData as string).replace("ipfs://", "");
  axios
    .get("https://gateway.pinata.cloud/ipfs/" + ipfsMetadataCUID)
    .then((res) => {
      imgURL.url =
        "https://gateway.pinata.cloud/ipfs/" + res.data.image.replace("ipfs://", "");
    })
    .catch((err) => {
      console.log(err);
    });
}