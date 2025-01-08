import { Dispatch, SetStateAction } from "react";

export const showAlert = (
  message: string,
  alertType: string,
  setAlert: Dispatch<SetStateAction<string>>,
  setOpenAlert: Dispatch<SetStateAction<boolean>>,
  setAlertType: Dispatch<SetStateAction<string>>,
) => {
  setAlert(message);
  setAlertType(alertType);
  setOpenAlert(true);
  if (alertType !== "loading") {
    setTimeout(() => setOpenAlert(false), 3000);
  }
};
