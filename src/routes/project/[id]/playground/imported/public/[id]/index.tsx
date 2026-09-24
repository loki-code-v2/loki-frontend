import {
  Resource,
  component$,
  useResource$,
  useSignal,
  useStore,
  useStylesScoped$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";

import { configureChains, createConfig } from "@wagmi/core";

import type { Abi, AbiFunction } from "abitype";
import { FuncCard } from "~/components/func-card/func-card";
import { JsCard } from "~/components/js-card/js-card";
import LokiPage from "~/components/loki-page/loki-page";
import { PlaygroundSearchBar } from "~/components/playground-search-bar/playground-search-bar";
import { LokiProjectDeploymentsService } from "~/services/LokiProjectDeploymentsService";
import { NetworkNames } from "~/services/chainService";
import styles from "../../../public/[id]/playground.scss?inline";
import Web3Service from "~/services/web3Service";

export default component$(() => {
  useStylesScoped$(styles);
  const loc = useLocation();
  const address = useSignal<`0x${string}`>(`0x${"0"}`);
  const network = useSignal("");
  const contractName = useSignal("");
  const abi = useStore<{ value: Array<any> }>({ value: [] });
  const abiFuncs = useStore<{ value: Array<any> }>({ value: [] });
  const abiFuncsFiltered = useStore<{ value: Array<any> }>({ value: [] });
  const library = useSignal<"web3" | "ethers" | "viem">("ethers");

  const deploymentResource = useResource$(async () => {
    const projectID = loc.url.toString().split("project/")[1].split("/")[0];
    const deploymentIdInt = parseInt(loc.params.id);
    const response =
      await LokiProjectDeploymentsService.fetchImportedDeploymentPublic(
        projectID,
        deploymentIdInt.toString()
      );

    address.value = response.data.address;
    network.value = response.data.network;
    contractName.value = response.data.contractName;
    abi.value = response.data.abi;
    abiFuncs.value = abi.value.filter((i) => (i as any).type === "function");

    // This is to give the inputs a unique name if they don't have one, used for giving a unique id to attached the event listener in arg-input.tsx to.
    abiFuncs.value = abiFuncs.value.map((func) => {
      func.inputs.forEach((input: any, index: any) => {
        if (!input.name) {
          input.name = `${func.name}-input-${index + 1}`;
        }
      });

      return func;
    });

    // This is so that when the original playground is rendered, all the functions are shown.
    // The "filtered" here is referring to filtering the functions displayed when using the search bar.
    abiFuncsFiltered.value = abiFuncs.value;
  });

  useVisibleTask$(async () => {
    await Web3Service.getInstance()
    await Web3Service.openIfDisconnected();
  });

  return (
    <>
      <div class="invisible">Playground</div>
      <LokiPage
        title="Playground"
        projectNavigationMenu={true}
        showNavigationMenu={false}
        showSidebar={false}
        projectId={loc.url.toString().split("project/")[1].split("/")[0]}
      >
        <div q:slot="header">
          <div class="header-buttons">
            <w3m-core-button></w3m-core-button>
          </div>
        </div>
        <div q:slot="content" class="content">
          <Resource
            value={deploymentResource}
            onPending={() => <sl-spinner />}
            onRejected={(error) => (
              <div>Error loading deployment: {error.message}</div>
            )}
            onResolved={() => {
              return (
                <>
                  <div class="left-title">
                    <h3 class="left-title-header">{contractName.value}</h3>
                    <div class="left-title-description">
                      <span class="left-title-description-icon">
                        <sl-icon name="link"></sl-icon>
                      </span>
                      <span class="left-title-description-text">
                        {network.value}
                      </span>
                      <span class="left-title-description-icon">
                        <sl-icon name="house-door"></sl-icon>
                      </span>
                      <span class="left-title-description-text">
                        {address.value}
                      </span>
                    </div>
                    <div class="search-bar">
                      <PlaygroundSearchBar
                        abiFuncs={abiFuncs}
                        abiFuncsFiltered={abiFuncsFiltered}
                      ></PlaygroundSearchBar>
                    </div>
                  </div>
                  <div class="right-title">
                    <div class="right-title-header">LIBRARY</div>
                    <div class="library-list">
                      <div
                        class="library-item"
                        onClick$={() => {
                          library.value = "web3";
                        }}
                        style={{
                          border:
                            library.value === "web3"
                              ? "1px solid gray"
                              : "none",
                          borderRadius: library.value === "web3" ? "10px" : "0",
                        }}
                      >
                        <img
                          title="Web3"
                          width="33"
                          height="32"
                          src="/assets/logos/web3.svg"
                        ></img>
                        <div class="library-name">Web3</div>
                      </div>
                      <div
                        class="library-item"
                        onClick$={() => {
                          library.value = "ethers";
                        }}
                        style={{
                          border:
                            library.value === "ethers"
                              ? "1px solid gray"
                              : "none",
                          borderRadius:
                            library.value === "ethers" ? "10px" : "0",
                        }}
                      >
                        <img
                          title="Ethers"
                          width="33"
                          height="32"
                          src="/assets/logos/ethers.svg"
                        ></img>
                        <div class="library-name">Ethers</div>
                      </div>
                      <div
                        class="library-item"
                        onClick$={() => {
                          library.value = "viem";
                        }}
                        style={{
                          border:
                            library.value === "viem"
                              ? "1px solid gray"
                              : "none",
                          borderRadius: library.value === "viem" ? "10px" : "0",
                        }}
                      >
                        <img
                          title="Viem"
                          width="33"
                          height="32"
                          src="/assets/logos/viem.svg"
                        ></img>
                        <div class="library-name">Viem</div>
                      </div>
                    </div>
                  </div>
                  {abiFuncsFiltered.value.map((func: AbiFunction, index) => (
                    <>
                      <div key={index} class="func-card">
                        <FuncCard
                          key={func.name}
                          func={func}
                          network={network.value as NetworkNames}
                          address={address.value}
                          abi={abi.value}
                        ></FuncCard>
                      </div>
                      <div key={func.name + "-js-card2"} class="js-card">
                        <JsCard
                          key={func.name + "-js-card"}
                          func={func}
                          library={library.value}
                          network={network.value}
                          address={address.value}
                          abi={abi}
                        ></JsCard>
                      </div>
                    </>
                  ))}
                </>
              );
            }}
          />
        </div>
      </LokiPage>
    </>
  );
});