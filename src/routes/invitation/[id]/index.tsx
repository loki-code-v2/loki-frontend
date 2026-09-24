import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { RequestHandler, useLocation, useNavigate } from "@builder.io/qwik-city";
import { AlertService } from "~/services/alertService";
import { LokiProjectUserService } from "~/services/loki-project-user";
import { UserService } from "~/services/userService";

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

  const invitationReuestLoading = useSignal(true);
  const loc = useLocation();

  const nav = useNavigate();


  useVisibleTask$(async () => {
    LokiProjectUserService.verifyInvitation(loc.params.id).then(() => {
      invitationReuestLoading.value = false;
      AlertService.notify("Invitation accepted");
    }).catch(() => {
      invitationReuestLoading.value = false;
      AlertService.notifyError("Error while accepting invitation");
    });
  });


  return (
    <>
      <h1>
        Accepting invitation
      </h1>
      {
        invitationReuestLoading.value && (
          <div>
            Validating
            <sl-spinner></sl-spinner>
          </div>
        )
      }
    </>
  );
});
