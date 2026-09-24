import { component$, useStylesScoped$ } from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { useNavigate } from "@builder.io/qwik-city";
import LokiPage from "~/components/loki-page/loki-page";
import { TemplateCard } from "~/components/template-card/template-card";
import { UserService } from "~/services/userService";
import styles from "./templates.scss?inline";
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
  const nav = useNavigate();
  useStylesScoped$(styles);

  return (
    <LokiPage title="TEMPLATES">
      <div q:slot="content" class="main-content">
        <TemplateCard
          id={1}
          key={1}
          name="ERC20 Basic Token"
          description="Create your simple ERC20 token and deploy on multiple chains."
          icon="/icons/i-loki-erc20.svg"
          link="https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol"
        >
          <sl-dialog
            label="ERC20 Basic Token"
            id={`loki-dialog-${1}`}
            class="loki-dialog"
          >
            With this template you will learn how to create and deploy a basic
            ERC20 token, which is the standard for fungible tokens on Ethereum,
            as well as other blockchains. ERC20 tokens are typically used for
            airdrops, rewards, and trading, among many other use cases.
            <sl-button
              slot="footer"
              variant="primary"
              onClick$={() => {
                nav("/erc20");
              }}
              style={{ width: "100%" }}
            >
              Create contract from template
            </sl-button>
          </sl-dialog>
        </TemplateCard>
        <TemplateCard
          id={2}
          key={2}
          name="NFT Drop - ERC721"
          description="Create your unique NFT Drop"
          icon="/icons/i-loki-erc721.svg"
          link="https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol"
        >
          <sl-dialog
            label="NFT Drop - ERC721"
            id={`loki-dialog-${2}`}
            class={`loki-dialog`}
          >
            With this template you will learn how to create and deploy a NFT
            Drop. NFTs are typically used for airdrops, rewards, and trading,
            among many other use cases.
            <sl-button
              slot="footer"
              variant="primary"
              onClick$={() => {
                nav("/erc721");
              }}
              style={{ width: "100%" }}
            >
              Create contract from template
            </sl-button>
          </sl-dialog>
        </TemplateCard>
        <div class="more-templates-msg">More templates coming soon!</div>
      </div>
    </LokiPage>
  );
});

export const head: DocumentHead = {
  title: "Templates",
};
