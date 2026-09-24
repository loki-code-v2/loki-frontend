import {
  Resource,
  component$,
  useResource$,
  useSignal,
  useStylesScoped$,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { useNavigate } from "@builder.io/qwik-city";
import LokiPage from "~/components/loki-page/loki-page";
import { CreateOrganizationButton } from "~/components/organization-page/createOrganizationButton";
import { ManageOrganizations } from "~/components/organization-page/manageOrganizations";
import {
  OrganizationService,
  type OrganizationData,
} from "~/services/organizationService";
import { UserService } from "~/services/userService";
import { UserSubscriptionService } from "~/services/userSubscriptionService";
import styles from "./organization.scss?inline";

export const onRequest: RequestHandler = async (event: any) => {
  // make a request to the backend to figure if the user is logged in
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

  // TODO: delete this
  // useVisibleTask$(() => {
  //   const dialog = document.querySelector("#subscribe-dialog");

  //   dialog?.addEventListener("sl-request-close", (event) => {
  //     if ((event as any).detail.source === "overlay") {
  //       event.preventDefault();
  //     }
  //   });
  // });

  // The main purpose of this Signal is to cause the organizationPageData resource to re-fetch.
  const organizationUpdated = useSignal<number>(0);

  const organizationPageData = useResource$<{
    isUserOwnerOfOrganization: boolean;
    isUserSubscribed: boolean;
    organizationData: OrganizationData[];
    subscription: any;
  }>(async ({ track }) => {
    track(() => organizationUpdated.value);
    let activeSubscriptionData: any = false;
    try {
      activeSubscriptionData =
        await UserSubscriptionService.hasActiveSubscription();
    } catch (error) {
      console.log("error", error);
    }
    const hasActiveSubscription: boolean = activeSubscriptionData.data
      ? true
      : false;
    const response = await OrganizationService.listOrganizations();
    const isUserOwnerOfOrganization = response.data.some(
      (org: any) => org.userRole === "admin"
    );
    return {
      isUserOwnerOfOrganization: isUserOwnerOfOrganization,
      isUserSubscribed: hasActiveSubscription,
      organizationData: response.data,
      subscription: activeSubscriptionData.data,
    };
  });

  return (
    <LokiPage title="ORGANIZATION">
      <div q:slot="header">
        <Resource
          value={organizationPageData}
          onResolved={(orgs) => {
            if (orgs.isUserSubscribed && !orgs.isUserOwnerOfOrganization) {
              return (
                <CreateOrganizationButton
                  label="New organization"
                  subscription={orgs.subscription}
                  organizationUpdated={organizationUpdated}
                />
              );
            }
          }}
        />
      </div>
      <div q:slot="content" class="organizations-main-content">
        <Resource
          value={organizationPageData}
          onPending={() => <div>Loading organizations...</div>}
          onRejected={() => (
            <sl-card>
              <div>Failed to load organizations</div>
            </sl-card>
          )}
          onResolved={(orgs) => {
            // TODO: Actually if they are in an organization that they were added to, but not an owner of, they should still be able to see the organization
            if (!orgs.isUserSubscribed) {
              return (
                <div class="create-org-container">
                  <div style="font-size: 60px;">
                    <sl-icon src="/icons/i-loki-organization-big.svg"></sl-icon>
                  </div>
                  <h3 class="create-org-title">
                    Upgrade to Loki Pro to create organizations
                  </h3>
                  <div class="create-org-description">
                    You may still be added to organizations by other Loki Pro
                    users.
                  </div>
                  <div class="ftr-btns">
                    <sl-button
                      variant="primary"
                      onClick$={() => {
                        nav("/subscribe");
                      }}
                    >
                      Upgrade
                    </sl-button>
                    <sl-button
                      variant="primary"
                      outline
                      onClick$={() => {
                        window.open(
                          "https://loki-code.gitbook.io/loki.code-docs/quick-start-guide/collaborate-with-your-organization",
                          "_blank",
                          "noopener,noreferrer"
                        );
                      }}
                    >
                      Learn more
                    </sl-button>
                    {/* <sl-button>Learn about Organizations</sl-button> */}
                  </div>
                </div>
              );
            } else if (
              orgs.isUserSubscribed &&
              orgs.organizationData.length <= 0
            ) {
              return (
                <div class="create-org-container">
                  <div style="font-size: 60px;">
                    <sl-icon src="/icons/i-loki-organization-big.svg"></sl-icon>
                  </div>
                  <h3 class="create-org-title">
                    You don't have an organization
                  </h3>
                  <div class="create-org-description">
                    Create one or ask your admin to invite you.
                  </div>

                  <CreateOrganizationButton
                    label="Create organization"
                    subscription={orgs.subscription}
                    organizationUpdated={organizationUpdated}
                  />
                </div>
              );
            } else {
              return (
                <ManageOrganizations
                  organizations={orgs.organizationData}
                  organizationUpdated={organizationUpdated}
                />
              );
            }
          }}
        />
      </div>
    </LokiPage>
  );
});

export const head: DocumentHead = {
  title: "Organization",
};
