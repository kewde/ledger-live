import React from "react";
import { Trans } from "react-i18next";
import { useRoute } from "@react-navigation/native";
import { HeaderCloseButtonAdvanced } from "../../components/HeaderCloseButton";

const routesWithConfirmation = ["AddAccountsAccounts"];
export default function AddAccountsHeaderRightClose() {
  const route = useRoute();
  return (
    <HeaderCloseButtonAdvanced
      withConfirmation={routesWithConfirmation.includes(route.name)}
      confirmationTitle={<Trans i18nKey="addAccounts.quitConfirmation.title" />}
      confirmationDesc={<Trans i18nKey="addAccounts.quitConfirmation.desc" />}
    />
  );
}
