import { Dispatch, SetStateAction } from "react";
import { AlertType } from "./components/Alert";

export const showAlert = (
  message: string,
  alertType: AlertType,
  setAlert: Dispatch<SetStateAction<string>>,
  setOpenAlert: Dispatch<SetStateAction<boolean>>,
  setAlertType: Dispatch<SetStateAction<AlertType>>,
) => {
  setAlert(message);
  setAlertType(alertType);
  setOpenAlert(true);
  if (alertType !== "loading") {
    setTimeout(() => setOpenAlert(false), 3000);
  }
};
