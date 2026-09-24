import type { QRL } from '@builder.io/qwik';
import { $, component$, useSignal, useStylesScoped$, useVisibleTask$ } from '@builder.io/qwik';
import type { Network } from '~/services/chainService';
import { ChainService, NetworkNames } from '~/services/chainService';

import type { SlSelect } from '@shoelace-style/shoelace';
import styles from "./network-selector.scss?inline";

type NetworkSelectProps = {
  onNetworkChange$: QRL<(network: Network | NetworkNames) => void>;
  enableBuildBear?: boolean;
  required?: boolean;
  chainId?: number;
};

export const NetworkSelect = component$<NetworkSelectProps>(({ onNetworkChange$, enableBuildBear = false, required = false, chainId = null }) => {

  useStylesScoped$(styles);

  const selectedNetwork = useSignal<Network | undefined>(undefined);
  const selectorState = useSignal<"expanded" | "collapsed">("collapsed");
  const enableBB = useSignal<boolean>(enableBuildBear);
  const chainIdSignal = useSignal<number | null>(chainId);
  const uniqueSelectorId = useSignal<string>(`network-selector-${Math.random().toString(36).substring(7)}`);

  const handleNetworkChange = $((networkName: NetworkNames) => {
    if (networkName === NetworkNames.Buildbear) {
      onNetworkChange$(networkName);
    }
    const n = ChainService.getNetworkByName(networkName)
    selectedNetwork.value = n;
    onNetworkChange$(n!);
  });

  useVisibleTask$(() => {
    const networkSelector = document.getElementById(uniqueSelectorId.value) as SlSelect;
    if (networkSelector) {
      networkSelector.addEventListener("sl-show", () => {
        selectorState.value = "expanded";
      });
      networkSelector.addEventListener("sl-hide", () => {
        selectorState.value = "collapsed";
      });
      networkSelector.addEventListener("sl-change", () => {
        handleNetworkChange(networkSelector.value as NetworkNames);
      });
    }
    if (chainIdSignal.value !== null) {
      const chain = ChainService.getNetworkByChainId(chainIdSignal.value);
      if (chain && chain.name) {
        selectedNetwork.value = chain;
        networkSelector.value = ChainService.getDisplayName(chain.name)!;
        handleNetworkChange(chain.name);
      }
    }
  });

  const mainnets = ChainService.getAllMainnets();
  const testnets = ChainService.getAllTestnets();

  return (
    <sl-select
      id={uniqueSelectorId.value}
      class={`loki-network-selector`}
      required={required}
      hoist
      placeholder={`Network`}
    >
      <div slot="expand-icon">
        {selectedNetwork.value && selectedNetwork.value.isTestnet && (
          <sl-icon
            class="testnet-tag"
            src="/icons/i-loki-testnet-tag.svg"
          ></sl-icon>
        )}
        <sl-icon
          class={`loki-network-selector-expand-icon ${selectorState.value === "expanded" ? "rotated" : ""}`}
          name="chevron-down"
          aria-hidden="true"
        ></sl-icon>
      </div>
      <small>Mainnets</small>
      {mainnets.map((network) => (
        <sl-option key={`${network.displayName}`} class="network-selector-option" value={network.name}>
          {network.displayName}
        </sl-option>
      ))}
      <sl-divider></sl-divider>
      <small>Testnets</small>
      {
        enableBB.value && (
          <sl-option key="Buildbear" class="network-selector-option" value="Buildbear">
            {`Buildbear`}
          </sl-option>
        )
      }
      {testnets.map((network: Network) => (
        <sl-option key={`${network.displayName}`} class="network-selector-option" value={network.name}>
          {network.displayName}
          <div slot="suffix">
            <sl-icon
              class="testnet-tag"
              src="/icons/i-loki-testnet-tag.svg"
            ></sl-icon>
          </div>

        </sl-option>
      ))}
    </sl-select>
  );
});