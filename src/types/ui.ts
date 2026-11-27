// UI component state shapes.

/** WelcomePopup state: `data` is the raw /popup-dialogs payload (unvalidated). */
export type WelcomePopupState = {
  data: unknown;
  show: boolean;
  visible: boolean;
};
