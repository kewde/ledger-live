// @flow
import React, { useState, useCallback, useEffect } from "react";
import type { TFunction } from "react-i18next";

import { getAccountUnit } from "@ledgerhq/live-common/account/index";
import { debounce } from "lodash";

import styled from "styled-components";
import Box from "~/renderer/components/Box";
import Text from "~/renderer/components/Text";
import ScrollLoadingList from "../ScrollLoadingList";
import { Trans } from "react-i18next";
import IconAngleDown from "~/renderer/icons/AngleDown";
import ValidatorRow from "./ValidatorRow";
import type { ThemedComponent } from "~/renderer/styles/StyleProvider";
import type { Account } from "@ledgerhq/types-live";
import type { TransactionStatus } from "@ledgerhq/live-common/generated/types";
import type { StakePool } from "@ledgerhq/live-common/families/cardano/api/api-types";
import {
  fetchPoolList,
  fetchPoolDetails,
} from "@ledgerhq/live-common/families/cardano/api/getPools";

import ValidatorSearchInput from "~/renderer/components/Delegation/ValidatorSearchInput";
import { LEDGER_POOL_IDS } from "@ledgerhq/live-common/families/cardano/utils";

type Props = {
  t: TFunction,
  account: Account,
  status: TransactionStatus,
  delegation: StakePool,
  onChangeValidator: ({ address: string }) => void,
  selectedPoolId: string,
};

const ValidatorField = ({
  account,
  status,
  t,
  delegation,
  onChangeValidator,
  selectedPoolId,
}: Props) => {
  const [search, setSearch] = useState("");
  const [ledgerPools, setLedgerPools] = useState([]);
  const unit = getAccountUnit(account);
  const [validators, setValidators] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [showAll, setShowAll] = useState(
    LEDGER_POOL_IDS.length === 0 ||
      (LEDGER_POOL_IDS.length === 1 && delegation.poolId === LEDGER_POOL_IDS[0]),
  );

  const fetchPoolsFromNextPage = async () => {
    if (search === "" || validators.length === pageNo * 50) {
      setPageNo(pageNo + 1);
      await fetchPools();
    }
  };

  const poolIdsToFilterFromAllPools = [...LEDGER_POOL_IDS];
  if (delegation.poolId) {
    poolIdsToFilterFromAllPools.push(delegation.poolId);
  }

  const fetchPools = async () => {
    const apiRes = await fetchPoolList(account.currency, search, pageNo, 50);
    if (pageNo === 1) {
      setValidators([...apiRes.pools.filter(p => !poolIdsToFilterFromAllPools.includes(p.poolId))]);
    } else {
      setValidators([
        ...validators,
        ...apiRes.pools.filter(p => !poolIdsToFilterFromAllPools.includes(p.poolId)),
      ]);
    }
  };

  const debouncedFetchPools = debounce(fetchPools, 1000);

  useEffect(() => {
    setPageNo(1);
    debouncedFetchPools();
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSearch = useCallback(evt => setSearch(evt.target.value), [setSearch]);

  useEffect(() => {
    if (LEDGER_POOL_IDS.length) {
      fetchPoolDetails(account.currency, LEDGER_POOL_IDS).then(apiRes => {
        setLedgerPools(apiRes.pools);
      });
    }
  }, [account]);

  const renderItem = (validator: StakePool, validatorIdx: number) => {
    return (
      <ValidatorRow
        currency={account.currency}
        key={validatorIdx + validator.poolId}
        pool={validator}
        unit={unit}
        active={selectedPoolId === validator.poolId || validator.poolId === delegation.poolId}
        onClick={onChangeValidator}
      ></ValidatorRow>
    );
  };
  return (
    <>
      {showAll && <ValidatorSearchInput noMargin={true} search={search} onSearch={onSearch} />}
      <ValidatorsFieldContainer>
        <Box p={1}>
          <ScrollLoadingList
            data={showAll ? validators : ledgerPools}
            style={{ flex: showAll ? "1 0 256px" : "1 0 64px", marginBottom: 0, paddingLeft: 0 }}
            renderItem={renderItem}
            noResultPlaceholder={null}
            fetchPoolsFromNextPage={fetchPoolsFromNextPage}
            search={search}
          />
        </Box>
        {LEDGER_POOL_IDS.length ? (
          <SeeAllButton expanded={showAll} onClick={() => setShowAll(shown => !shown)}>
            <Text color="wallet" ff="Inter|SemiBold" fontSize={4}>
              <Trans i18nKey={showAll ? "distribution.showLess" : "distribution.showAll"} />
            </Text>
            <IconAngleDown size={16} />
          </SeeAllButton>
        ) : null}
      </ValidatorsFieldContainer>
    </>
  );
};

const ValidatorsFieldContainer: ThemedComponent<{}> = styled(Box)`
  border: 1px solid ${p => p.theme.colors.palette.divider};
  border-radius: 4px;
`;

const SeeAllButton: ThemedComponent<{ expanded: boolean }> = styled.div`
  display: flex;
  color: ${p => p.theme.colors.wallet};
  align-items: center;
  justify-content: center;
  border-top: 1px solid ${p => p.theme.colors.palette.divider};
  height: 40px;
  cursor: pointer;

  &:hover ${Text} {
    text-decoration: underline;
  }

  > :nth-child(2) {
    margin-left: 8px;
    transform: rotate(${p => (p.expanded ? "180deg" : "0deg")});
  }
`;

export default ValidatorField;
