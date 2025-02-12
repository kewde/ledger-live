import React, { PureComponent } from "react";
import { withTranslation, TFunction } from "react-i18next";
import styled from "styled-components";
import { repairChoices } from "@ledgerhq/live-common/hw/firmwareUpdate-repair";
import { MCUNotGenuineToDashboard } from "@ledgerhq/errors";
import TrackPage from "~/renderer/analytics/TrackPage";
import { track } from "~/renderer/analytics/segment";
import Button from "~/renderer/components/Button";
import Box from "~/renderer/components/Box";
import Text from "~/renderer/components/Text";
import ProgressCircle from "~/renderer/components/ProgressCircle";
import { urls } from "~/config/urls";
import { openURL } from "~/renderer/linking";
import FlashMCU from "~/renderer/components/FlashMCU";
import Modal, { ModalBody } from "~/renderer/components/Modal";
import ErrorDisplay from "~/renderer/components/ErrorDisplay";
import IconCheck from "~/renderer/icons/Check";
import { colors } from "~/renderer/styles/theme";
const Container = styled(Box).attrs(() => ({
  alignItems: "center",
  fontSize: 4,
  color: "palette.text.shade100",
}))``;
const ChoiceBox = styled.div<{ selected?: boolean }>`
  display: flex;
  flex-direction: row;
  border-radius: 4px;
  box-shadow: ${props => (props.selected ? "0 2px 4px 0 rgba(0, 0, 0, 0.08)" : null)};
  border: solid 1px
    ${props => (props.selected ? props.theme.colors.wallet : props.theme.colors.palette.divider)};
  height: 48px;
  padding: 0 24px;
  margin-bottom: 8px;
  align-items: center;
  justify-content: space-between;
`;
type ChoiceOption = {
  forceMCU: string;
  label: string;
  id: string;
};
type ChoiceProps = {
  selected: boolean;
  onSelect: (a?: ChoiceOption | null) => void;
  choice: ChoiceOption;
};
const ChoiceLocal = ({ selected, choice, onSelect }: ChoiceProps) => (
  <ChoiceBox selected={selected} onClick={() => onSelect(selected ? null : choice)}>
    <Text ff="Inter|SemiBold" fontSize={4}>
      {choice.label}
    </Text>
    {selected ? (
      <Box color="wallet">
        <IconCheck size={16} />
      </Box>
    ) : null}
  </ChoiceBox>
);
const Choice = React.memo(ChoiceLocal);
const DisclaimerStep = ({ desc }: { desc?: React.ReactNode }) => (
  <Box px={2}>
    {desc ? (
      <Box ff="Inter" color="palette.text.shade80" fontSize={4} textAlign="center" mb={2}>
        {desc}
      </Box>
    ) : null}
  </Box>
);
const FlashStep = ({
  progress,
  t,
  isAlreadyBootloader,
}: {
  progress: number;
  t: TFunction;
  isAlreadyBootloader?: boolean;
}) =>
  progress === 0 && !isAlreadyBootloader ? (
    <Container>
      <FlashMCU />
    </Container>
  ) : (
    <Box>
      <Box mx={7} alignItems="center">
        <ProgressCircle size={64} progress={progress} />
      </Box>
      <Box mx={7} mt={3} mb={2} ff="Inter|Regular" color="palette.text.shade100" textAlign="center">
        {t(`manager.modal.steps.flash`)}
      </Box>
      <Box mx={7} mt={2} mb={2}>
        <Text ff="Inter|Regular" textAlign="center" color="palette.text.shade80" fontSize={4}>
          {t("manager.modal.mcuPin")}
        </Text>
      </Box>
    </Box>
  );
const ErrorStep = ({ error }: { error: Error }) => (
  <ErrorDisplay error={error} withExportLogs list />
);
type Props = {
  isOpened?: boolean;
  isDanger?: boolean;
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  desc: React.ReactNode;
  renderIcon?: Function;
  confirmText?: string;
  cancelText?: string;
  onReject: (_?: { needHelp?: boolean }) => void;
  repair: (a?: string | null) => void;
  t: TFunction;
  isLoading?: boolean;
  analyticsName: string;
  cancellable?: boolean;
  progress: number;
  error?: Error | null;
  isAlreadyBootloader?: boolean;
  enableSomethingElseChoice?: boolean;
};
type State = {
  selectedOption: ChoiceOption | null | undefined;
  availableRepairChoices: Array<ChoiceOption>;
};
class RepairModal extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    const availableRepairChoices = [...repairChoices];
    if (props.enableSomethingElseChoice) {
      availableRepairChoices.push({
        forceMCU: "",
        label: this.props.t("connectTroubleshooting.steps.4.repair.somethingElse"),
        id: "somethingElse",
      });
    }
    this.state = {
      selectedOption: null,
      availableRepairChoices,
    };
  }

  onSelectOption = (selectedOption: ChoiceOption | null | undefined) => {
    this.setState({
      selectedOption,
    });
    track(`${this.props.analyticsName}SelectOption`, {
      selectedOption,
    });
  };

  onSubmit = () => {
    const { selectedOption } = this.state;
    const { onReject, repair } = this.props;
    if (!selectedOption) {
      return;
    }
    if (selectedOption.id === "somethingElse") {
      onReject({
        needHelp: true,
      });
    } else {
      repair(selectedOption.forceMCU);
    }
  };

  render() {
    const {
      cancellable,
      isOpened,
      title,
      desc,
      isDanger,
      onReject,
      isLoading,
      t,
      analyticsName,
      progress,
      error,
      isAlreadyBootloader,
      ...props
    } = this.props;
    const { selectedOption, availableRepairChoices } = this.state;
    const onClose = !cancellable && isLoading ? undefined : onReject;
    const disableRepair =
      isLoading || !selectedOption || !!(error && error instanceof MCUNotGenuineToDashboard);
    return (
      <Modal
        isOpened={isOpened}
        centered
        preventBackdropClick={isLoading}
        onClose={onClose}
        {...props}
      >
        <TrackPage category="Modal" name={analyticsName} />
        <ModalBody
          title={title}
          onClose={onClose}
          noScroll
          render={() => (
            <Box>
              {error ? (
                <ErrorStep error={error} />
              ) : isLoading ? (
                <FlashStep t={t} progress={progress} isAlreadyBootloader={isAlreadyBootloader} />
              ) : (
                <DisclaimerStep desc={desc} />
              )}

              {!isLoading && !error ? (
                <Box py={2} px={5} color="palette.text.shade100" fontSize={4}>
                  {availableRepairChoices.map(choice => (
                    <Choice
                      key={choice.id}
                      onSelect={this.onSelectOption}
                      selected={choice === selectedOption}
                      choice={choice}
                    />
                  ))}
                </Box>
              ) : null}
            </Box>
          )}
          renderFooter={() =>
            !isLoading ? (
              <Box horizontal alignItems="center" flow={2} flex={1}>
                <Button onClick={() => openURL(urls.troubleshootingUSB)} textColor={colors.wallet}>
                  {t("common.help")}
                </Button>
                <div
                  style={{
                    flex: 1,
                  }}
                />
                <Button onClick={onReject}>{t(`common.${error ? "close" : "cancel"}`)}</Button>
                <Button
                  onClick={this.onSubmit}
                  primary={!isDanger}
                  danger={isDanger}
                  isLoading={isLoading}
                  disabled={disableRepair}
                >
                  {selectedOption?.id === "somethingElse"
                    ? t("common.continue")
                    : t("settings.repairDevice.button")}
                </Button>
              </Box>
            ) : null
          }
        />
      </Modal>
    );
  }
}
export default withTranslation()(RepairModal);
