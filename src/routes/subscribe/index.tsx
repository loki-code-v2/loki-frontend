import {
  Resource,
  component$,
  useResource$,
  useStylesScoped$,
} from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { useNavigate } from "@builder.io/qwik-city";
import LokiPage from "~/components/loki-page/loki-page";
import SubscriptionButton from "~/components/subscription-button/subscription-button";
import { StripeService } from "~/services/stripeService";
import { UserService } from "~/services/userService";
import styles from "./subscribe.scss?inline";
export const onRequest: RequestHandler = async (event: any) => {
  // make a request to the backendend to figure if the user is logged in
  try {
    await UserService.userSession();

  } catch (error) {
    console.log("Error fetching user session", error);
    throw event.redirect(302, `/`);
  }
};
export default component$(() => {
  useStylesScoped$(styles);
  const nav = useNavigate();

  const checkSubscriptionResource = useResource$(async () => {
    const response = await StripeService.checkSubscription();
    return response.data.userSubscription as boolean;
  });

  return (
    <LokiPage title="SUBSCRIPTION">
      <div q:slot="content" class="content">
        <Resource
          value={checkSubscriptionResource}
          onPending={() => <sl-spinner />}
          onRejected={(error) => (
            <div>Error loading resource: {error.message}</div>
          )}
          onResolved={(userSubscription) => {
            return (
              <div class="cards-container">
                <div class="upgrade-card">
                  <div class="upgrade-card-content">
                    <div class="header">
                      <h3 class="pro-title fw-light">Starter</h3>
                      <div class="fw-light gray">Best for getting started</div>
                      <div class="price">
                        <h3>FREE</h3>
                      </div>
                    </div>
                    <div class="perk-list">
                      <div class="list-item">
                        <img
                          title="check-circle-icon"
                          src="/icons/i-loki-check-circle.svg"
                          width="24"
                          height="24"
                        />
                        <div class="list-item-text">
                          Deploy on Multiple networks
                        </div>
                      </div>
                      <div class="list-item">
                        <img
                          title="check-circle-icon"
                          src="/icons/i-loki-check-circle.svg"
                          width="24"
                          height="24"
                        />
                        <div class="list-item-text">Connect your Github</div>
                      </div>
                      <div class="list-item">
                        <img
                          title="check-circle-icon"
                          src="/icons/i-loki-check-circle.svg"
                          width="24"
                          height="24"
                        />
                        <div class="list-item-text">Compile Solidity files</div>
                      </div>
                      <div class="list-item">
                        <img
                          title="check-circle-icon"
                          src="/icons/i-loki-check-circle.svg"
                          width="24"
                          height="24"
                        />
                        <div class="list-item-text">Deployment history</div>
                      </div>
                      <div class="list-item">
                        <img
                          title="check-circle-icon"
                          src="/icons/i-loki-check-circle.svg"
                          width="24"
                          height="24"
                        />
                        <div class="list-item-text">
                          Smart contracts playground
                        </div>
                      </div>
                      <div class="list-item">
                        <img
                          title="x-icon"
                          src="/icons/i-loki-x.svg"
                          width="24"
                          height="24"
                        />
                        <div class="list-item-text">Team management</div>
                      </div>
                      <div class="list-item">
                        <img
                          title="x-icon"
                          src="/icons/i-loki-x.svg"
                          width="24"
                          height="24"
                        />
                        <div class="list-item-text">Create organization</div>
                      </div>
                      <div class="list-item">
                        <img
                          title="x-icon"
                          src="/icons/i-loki-x.svg"
                          width="24"
                          height="24"
                        />
                        <div class="list-item-text">Custom features</div>
                      </div>
                    </div>
                    <div class="footer">
                      <sl-button variant="primary" outline class="normal-btn">
                        Go to Dashboard
                      </sl-button>
                    </div>
                  </div>
                </div>
                <div class="upgrade-card">
                  <div class="upgrade-card-content">
                    <div class="header">
                      <h3 class="pro-title fw-light">Pro</h3>
                      <div class="fw-light gray">Get the most out of teams</div>
                      <div class="price">
                        <h3>$49</h3>
                        <div class="price-subtext">
                          <div class="gray fw-light">per user/month</div>
                          <div class="gray fw-light price-subtext-parenthesis">
                            (volume discounts offered to teams)
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="perk-list">
                      <div class="list-item">
                        <img
                          title="check-circle-icon"
                          src="/icons/i-loki-check-circle.svg"
                          width="24"
                          height="24"
                        />
                        <div class="list-item-text">
                          Deploy on Multiple networks
                        </div>
                      </div>
                      <div class="list-item">
                        <img
                          title="check-circle-icon"
                          src="/icons/i-loki-check-circle.svg"
                          width="24"
                          height="24"
                        />
                        <div class="list-item-text">Connect your Github</div>
                      </div>
                      <div class="list-item">
                        <img
                          title="check-circle-icon"
                          src="/icons/i-loki-check-circle.svg"
                          width="24"
                          height="24"
                        />
                        <div class="list-item-text">Compile Solidity files</div>
                      </div>
                      <div class="list-item">
                        <img
                          title="check-circle-icon"
                          src="/icons/i-loki-check-circle.svg"
                          width="24"
                          height="24"
                        />
                        <div class="list-item-text">Deployment history</div>
                      </div>
                      <div class="list-item">
                        <img
                          title="check-circle-icon"
                          src="/icons/i-loki-check-circle.svg"
                          width="24"
                          height="24"
                        />
                        <div class="list-item-text">
                          Smart contracts playground
                        </div>
                      </div>
                      <div class="list-item">
                        <img
                          title="check-circle-icon"
                          src="/icons/i-loki-check-circle.svg"
                          width="24"
                          height="24"
                        />
                        <div class="list-item-text">Team management</div>
                      </div>
                      <div class="list-item">
                        <img
                          title="check-circle-icon"
                          src="/icons/i-loki-check-circle.svg"
                          width="24"
                          height="24"
                        />
                        <div class="list-item-text">Create organization</div>
                      </div>
                      <div class="list-item">
                        <img
                          title="x-icon"
                          src="/icons/i-loki-x.svg"
                          width="24"
                          height="24"
                        />
                        <div class="list-item-text">Custom features</div>
                      </div>
                    </div>
                    <div class="footer">
                      <SubscriptionButton isPro={userSubscription} />
                    </div>
                  </div>
                </div>
                <div class="upgrade-card">
                  <div class="upgrade-card-content">
                    <div class="header">
                      <h3 class="pro-title fw-light">Enterprise</h3>
                      <div class="fw-light gray">Best for specific needs</div>
                      <div class="price">
                        <h3>Custom</h3>
                      </div>
                    </div>
                    <div class="perk-list">
                      <div class="list-item">
                        <img
                          title="check-circle-icon"
                          src="/icons/i-loki-check-circle.svg"
                          width="24"
                          height="24"
                        />
                        <div class="list-item-text">
                          Deploy on Multiple networks
                        </div>
                      </div>
                      <div class="list-item">
                        <img
                          title="check-circle-icon"
                          src="/icons/i-loki-check-circle.svg"
                          width="24"
                          height="24"
                        />
                        <div class="list-item-text">Connect your Github</div>
                      </div>
                      <div class="list-item">
                        <img
                          title="check-circle-icon"
                          src="/icons/i-loki-check-circle.svg"
                          width="24"
                          height="24"
                        />
                        <div class="list-item-text">Compile Solidity files</div>
                      </div>
                      <div class="list-item">
                        <img
                          title="check-circle-icon"
                          src="/icons/i-loki-check-circle.svg"
                          width="24"
                          height="24"
                        />
                        <div class="list-item-text">Deployment history</div>
                      </div>
                      <div class="list-item">
                        <img
                          title="check-circle-icon"
                          src="/icons/i-loki-check-circle.svg"
                          width="24"
                          height="24"
                        />
                        <div class="list-item-text">
                          Smart contracts playground
                        </div>
                      </div>
                      <div class="list-item">
                        <img
                          title="check-circle-icon"
                          src="/icons/i-loki-check-circle.svg"
                          width="24"
                          height="24"
                        />
                        <div class="list-item-text">Team management</div>
                      </div>
                      <div class="list-item">
                        <img
                          title="check-circle-icon"
                          src="/icons/i-loki-check-circle.svg"
                          width="24"
                          height="24"
                        />
                        <div class="list-item-text">Create organization</div>
                      </div>
                      <div class="list-item">
                        <img
                          title="check-circle-icon"
                          src="/icons/i-loki-check-circle.svg"
                          width="24"
                          height="24"
                        />
                        <div class="list-item-text">Custom features</div>
                      </div>
                    </div>
                    <div class="footer">
                      <a href="mailto:adam@lokicode.io">
                        <sl-button variant="primary" outline class="normal-btn">
                          Contact us
                        </sl-button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          }}
        />
      </div>
    </LokiPage>
  );
});

export const head: DocumentHead = {
  title: "Stripe",
};
