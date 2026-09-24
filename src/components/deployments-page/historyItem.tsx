import { component$, Slot, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./history-item.scss?inline";

/**
 * `HistoryItem`
 * is a Qwik component that renders a history item.
 * It provides the baseline for the other history item components.
 * It provides basic styling and the Deployer Component.
 * @component
 * @example
 * // Usage of the HistoryItem component
 * <HistoryItem />
 */
export default component$(() => {
  useStylesScoped$(styles);

  return (
    <div class="history-item">
      <Slot></Slot>
    </div>
  );
});
