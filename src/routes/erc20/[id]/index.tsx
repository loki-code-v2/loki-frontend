import {
  component$,
  useStore,
  useStyles$,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import {
  getAccount,
  readContract,
} from "@wagmi/core";
import { BigNumber, ethers } from "ethers";
import Header from "~/components/header/header";
import LokiPage from "~/components/loki-page/loki-page";
import { ChainService } from "~/services/chainService";
import { TemplateService } from "~/services/templateService";
import { UserService } from "~/services/userService";
import Burnable from "./Burnable";
import Mintable from "./Mintable";
import styles from "./erc20[id].scss?inline";
import Web3Service from "~/services/web3Service";

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
 * This component renders a page for managing a specific ERC20 token, after it has been created.
 */
export default component$(() => {
  useStyles$(styles);
  const nav = useNavigate();
  const loc = useLocation();
  const contract = useStore({
    contractData: {},
    templateValues: {
      isMintable: "true",
      isBurnable: "true",
    },
  });
  const totalSupplyValue = useStore({ totalSupply: "0" });

  const validRoute = useStore<{ status: boolean | "undefined" }>({
    status: "undefined",
  });

  useVisibleTask$(async () => {
    // Sets up the web3modal which allows the user to connect their wallet to interact with the contract.
    await Web3Service.getInstance()

    // Gets the ERC20 contract data from the backend, based off the id given. Then gets data from the on-chain contract, and populates the corresponding local stores.
    await TemplateService.getERC20(loc.params.id)
      .then(async (response) => {
        validRoute.status = true;

        contract.contractData = response.data.contract;
        contract.templateValues.isMintable =
          response.data.templateValues.mintable;
        contract.templateValues.isBurnable =
          response.data.templateValues.burnable;

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

        try {
          const account = getAccount();
          if (account.address === undefined) {
            console.log("User is not signed into wallet");
            await await Web3Service.openIfDisconnected();
          }
        } catch (error) {
          console.log("User is not signed into wallet");
        }
      })
      .catch((error) => {
        console.error("File error", error);
        validRoute.status = false;
        nav("/dashboard");
      });
  });

  return (
    <>
      {validRoute.status && validRoute.status !== "undefined" ? (
        <>
          <LokiPage>
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
            <div q:slot="content" class="main-card">
              <sl-card>
                <h3 class="erc20-form-header">
                  {(contract.contractData as any).name}
                </h3>
                <div class="erc20-form-body flex-column">
                  <div>
                    Contract Address:
                    <div class="caption text-accent-icon">
                      {(contract.contractData as any).address}
                    </div>
                  </div>
                  <div>
                    Total supply
                    <div class="caption text-accent-icon"></div>
                    <div>
                      {ethers.utils.formatEther(
                        BigNumber.from(totalSupplyValue.totalSupply)
                      )}
                    </div>
                  </div>
                  <div>
                    {contract.templateValues.isMintable === "true" ? (
                      <Mintable
                        totalSupplyValue={totalSupplyValue}
                        contract={contract}
                      ></Mintable>
                    ) : null}
                  </div>
                  <div>
                    {contract.templateValues.isBurnable === "true" ? (
                      <Burnable
                        totalSupplyValue={totalSupplyValue}
                        contract={contract}
                      ></Burnable>
                    ) : null}
                  </div>
                </div>
              </sl-card>
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