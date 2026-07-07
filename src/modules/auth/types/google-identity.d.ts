type GoogleCredentialResponse = {
  credential: string;
  select_by: string;
};

type GoogleIdConfiguration = {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  hd?: string;
  ux_mode?: "popup" | "redirect";
  use_fedcm_for_button?: boolean;
};

type GoogleButtonConfiguration = {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
  locale?: string;
};

type GoogleIdentityServices = {
  accounts: {
    id: {
      initialize: (configuration: GoogleIdConfiguration) => void;
      renderButton: (
        parent: HTMLElement,
        configuration: GoogleButtonConfiguration,
      ) => void;
      disableAutoSelect: () => void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleIdentityServices;
    __flowzyGoogleInitialized?: boolean;
    __flowzyGoogleCredentialHandler?: (
      response: GoogleCredentialResponse,
    ) => void;
  }
}

export {};
