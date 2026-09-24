import { $, component$, useSignal, useStylesScoped$ } from "@builder.io/qwik";
import { StripeService } from "~/services/stripeService";
import styles from "./subscription-button.scss?inline";

export default component$(({ isPro = false }: { isPro: boolean }) => {
  useStylesScoped$(styles);
  const loading = useSignal(false);

  const createStripeSession = $(async () => {
    try {
      loading.value = true;
      const response = await StripeService.getSession();
      const data = response.data;

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else {
        alert("Subscription is not configured yet. Billing setup is pending on this deployment.");
      }
    } catch (error: any) {
      console.error("Error:", error);
      // Surface real errors instead of silently bouncing the user home
      const detail = error?.response?.data?.message || error?.message || "Unknown error";
      alert("Could not start the subscription flow: " + detail);
    } finally {
      loading.value = false;
    }
  });

  return (
    <sl-button
      // variant={isPro ? "primary" : "success"}
      variant="primary"
      onClick$={() => createStripeSession()}
      disabled={loading.value}
      class="sub-btn"
    >
      {isPro ? "Manage Subscription" : "Start free trial"}
    </sl-button>
  );
});
