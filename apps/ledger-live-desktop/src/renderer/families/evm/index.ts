import { EvmFamily } from "./types";
import { injectNftIntoTransaction, getNftTransactionProperties } from "./nft";
import AccountFooter from "./AccountFooter";
import operationDetails from "./operationDetails";
import accountHeaderManageActions from "./AccountHeaderManageActions";
import transactionConfirmFields from "./TransactionConfirmFields";
import AccountBodyHeader from "./AccountBodyHeader";
import sendAmountFields from "./SendAmountFields";
import StepSummaryNetworkFeesRow from "./StepSummaryNetworkFeesRow";
import StakeBanner from "./StakeBanner";
import { getMessageProperties } from "./helpers";

const family: EvmFamily = {
  AccountFooter,
  operationDetails,
  accountHeaderManageActions,
  transactionConfirmFields,
  AccountBodyHeader,
  sendAmountFields,
  StepSummaryNetworkFeesRow,
  StakeBanner,
  nft: {
    getNftTransactionProperties,
    injectNftIntoTransaction,
  },
  message: {
    getMessageProperties,
  },
};

export default family;
