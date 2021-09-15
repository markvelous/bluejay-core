# Bluejay-core

## Naming Transition

| Vat      | Core                            |
| -------- | ------------------------------- |
| add      | addInt                          |
| sub      | subInt                          |
| mul      | mulInt                          |
| init     | initializeCollateralType        |
| wards    | authorizedAccounts              |
| rely     | grantAuthorization              |
| deny     | revokeAuthorization             |
| auth     | isAuthorized                    |
| Ilk      | CollateralType                  |
| Ilk.Art  | normalizedDebt                  |
| Ilk.rate | accumulatedRate                 |
| Ilk.spot | safetyPrice                     |
| Ilk.line | debtCeiling                     |
| Ilk.dust | debtFloor                       |
| Urn      | Position                        |
| Urn.ink  | lockedCollateral                |
| Urn.art  | normalizedDebt                  |
| ilks     | collateralTypes                 |
| ilk      | collateralType                  |
| urns     | positions                       |
| file     | updateParameter                 |
| what     | parameterName                   |
| sin      | unbackedStablecoin              |
| debt     | totalDebt                       |
| vice     | totalUnbackdeDebt               |
| cage     | shutdown                        |
| slip     | modifyCollateral                |
| flux     | transferCollateral              |
| move     | transferDebt                    |
| frob     | modifyPositionCollateralization |
| fork     | transferCollateralAndDebt       |
| dtab     | adjustedDebtDelta               |
| tab      | totalDebtOfPosition             |
| can      | allowed                         |
| wish     | allowedToModifyDebtOrCollateral |
| hope     | grantAllowance                  |
| nope     | revokeAllowance                 |
| heal     | settleDebt                      |
| suck     | createUnbackedDebt              |
| fold     | updateAccumulatedRate           |
| grab     | confiscateCollateralAndDebt     |
| file     | updateTotalDebtCeiling          |
| file     | updateSafetyPrice               |
| file     | updateDebtCeiling               |
| file     | updateDebtFloor                 |

- Removed safe math operations
- Refactored `isLive`
- Split `file` into multiple function
- `allowedToModifyDebtOrCollateral` given additional admin permission



| DaiJoin     | StablecoinJoin      |
| ----------- | ------------------- |
| VatLike     | CoreEngineLike      |
| DSTokenLike | TokenLike           |
| dai         | stablecoin          |
| wards       | authorizedAccounts  |
| rely        | grantAuthorization  |
| deny        | revokeAuthorization |
| auth        | isAuthorized        |
| cage        | shutdown            |

- Removed `mul`




| GemJoin     | CollateralJoin      |
| ----------- | ------------------- |
| VatLike     | CoreEngineLike      |
| DSTokenLike | TokenLike           |
| dai         | stablecoin          |
| wards       | authorizedAccounts  |
| rely        | grantAuthorization  |
| deny        | revokeAuthorization |
| auth        | isAuthorized        |
| cage        | shutdown            |
| ilk         | collateralType      |
| dec         | decimals            |
| gem         | collateral          |





| Spot          | OracleRelayer                |
| ------------- | ---------------------------- |
| VatLike       | CoreEngineLike               |
| PipLike       | OracleLike                   |
| file(spot)    | updateSafetyPrice            |
| wards         | authorizedAccounts           |
| rely          | grantAuthorization           |
| deny          | revokeAuthorization          |
| auth          | isAuthorized                 |
| cage          | shutdown                     |
| Ilk           | CollateralType               |
| ilk           | collateralType               |
| poke          | updateCollateralPrice        |
| Poke          | UpdateCollateralPrice        |
| pip           | oracle                       |
| mat           | collateralizationRatio       |
| peek          | getPrice                     |
| par           | redemptionPrice              |
| file (oracle) | updateOracle                 |
| file (par)    | updateRedemptionPrice        |
| file (mat)    | updateCollateralizationRatio |



| Pot        | SavingsAccount         |
| ---------- | ---------------------- |
| VatLike    | CoreEngineLike         |
| vat        | coreEngine             |
| wards      | authorizedAccounts     |
| rely       | grantAuthorization     |
| deny       | revokeAuthorization    |
| auth       | isAuthorized           |
| now        | block.timestamp        |
| suck       | createUnbackedDebt     |
| move       | transferDebt           |
| pie        | savings                |
| Pie        | totalSavings           |
| dsr        | savingsRate            |
| chi        | accumulatedRates       |
| vow        | accountingEngine       |
| rho        | lastUpdated            |
| file (dsr) | updateSavingsRate      |
| file (vow) | updateAccountingEngine |
| cage       | shutdown               |
| drip       | updateAccumulatedRate  |

- Added `updateAccumulatedRate` to `updateSavingsRate`& `join`



| Jug         | FeesEngine               |
| ----------- | ------------------------ |
| VatLike     | CoreEngineLike           |
| var         | coreEngine               |
| vow         | accountingEngine         |
| ilks        | collateralTypes          |
| ilk         | collateralType           |
| Ilk         | CollateralType           |
| fold        | updateAccumulatedRate    |
| wards       | authorizedAccounts       |
| rely        | grantAuthorization       |
| deny        | revokeAuthorization      |
| auth        | isAuthorized             |
| now         | block.timestamp          |
| base        | globalStabilityFee       |
| rho         | lastUpdated              |
| duty        | stabilityFee             |
| file (duty) | updateStabilityFee       |
| file (base) | updateGlobalStabilityFee |
| file (vow)  | updateAccountingEngine   |
| drip        | updateAccumulatedRate    |

- Move `updateAccumulatedRate` into `updateStabilityFee`