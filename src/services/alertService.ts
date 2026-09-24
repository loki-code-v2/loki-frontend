// enum for alert variants

export enum AlertVariant {
  primary = "primary",
  success = "success",
  info = "info",
  warning = "warning",
  danger = "danger",
}

export class AlertService {
  static escapeHtml(html: string) {
    if (typeof document !== "undefined") {
      const div = document.createElement("div");
      div.textContent = html;
      return div.innerHTML;
    }
    return html; // Return raw HTML string in SSR environments
  }

  // Custom function to emit toast notifications
  static notify(
    message: string,
    variant: AlertVariant = AlertVariant.primary,
    icon = "info-circle",
    duration = 3000
  ) {
    if (typeof document !== "undefined") {
      const convertedVariant = variant.toString();
      const alert = Object.assign(document.createElement("sl-alert"), {
        convertedVariant,
        closable: true,
        duration: duration,
        innerHTML: `
          <sl-icon name="${icon}" slot="icon"></sl-icon>
          ${AlertService.escapeHtml(message)}
        `,
      });

      document.body.append(alert);
      return alert.toast();
    }
    return null; // Return null in SSR environments
  }

  static notifyError(message: string, icon = "info-circle", duration = 3000) {
    return AlertService.notify(message, AlertVariant.danger, icon, duration);
  }
}
