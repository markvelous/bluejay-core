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
| dai      | debt                            |
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
| heal     | settleUnbackedDebt              |
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
- Removed `isLive` requirement on `grantAuthorization` & `revokeAuthorization`


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



| ExponentialDecrease | ExponentialDecreaseCalculator |
| ------------------- | ----------------------------- |
| Abacus              | DiscountCalculator            |
| rely                | grantAuthorization            |
| deny                | revokeAuthorization           |
| auth                | isAuthorized                  |
| cut                 | factorPerStep                 |
| file (cut)          | updateFactorPerStep           |
| file (step)         | updateStep                    |
| top                 | initialPrice                  |
| dur                 | timeElapsed                   |
| price               | discountPrice                 |



| Vow            | AccountingEngine              |
| -------------- | ----------------------------- |
| FlopLike       | DebtAuctionLike               |
| flopper        | debtAuction                   |
| FlapLike       | SurplusAuctionLike            |
| flapper        | surplusAuction                |
| VatLike        | CoreEngineLike                |
| vat            | coreEngine                    |
| rely           | grantAuthorization            |
| deny           | revokeAuthorization           |
| auth           | isAuthorized                  |
| sin            | debtQueue                     |
| Sin            | totalQueuedDebt               |
| Ash            | totalDebtOnAuction            |
| wait           | popDebtDelay                  |
| dump           | intialDebtAuctionBid          |
| sump           | debtAuctionLotSize            |
| bump           | surplusLotSize                |
| hump           | surplusBuffer                 |
| fess           | pushDebtToQueue               |
| flog           | popDebtFromQueue              |
| heal           | settleUnbackedDebt            |
| kiss           | settleUnbackedDebtFromAuction |
| flap           | auctionSurplus                |
| flop           | auctionDebt                   |
| kick           | startAuction                  |
| file (wait)    | updatePopDebtDelay            |
| file (bump)    | updateSurplusAuctionLotSize   |
| file (hump)    | updateSurplusBuffer           |
| file (sump)    | updateDebtAuctionLotSize      |
| file (dump)    | updateIntialDebtAuctionBid    |
| file (flapper) | updateSurplusAuction          |
| file (flopper) | updateDebtAuction             |

- remove `add` and `sub`
- added a way to list queued debts


| Dog         | LiquidationEngine                    |
| ----------- | ------------------------------------ |
| VatLike     | CoreEngineLike                       |
| ClipperLike | LiquidationAuctionLike               |
| ilks        | collateralTypes                      |
| Ilk.Art     | normalizedDebt                       |
| Ilk.rate    | accumulatedRate                      |
| Ilk.spot    | safetyPrice                          |
| Ilk.line    | debtCeiling                          |
| Ilk.dust    | debtFloor                            |
| urns        | positions                            |
| Urn.ink     | lockedCollateral                     |
| Urn.art     | normalizedDebt                       |
| grab        | confiscateCollateralAndDebt          |
| hope        | grantAllowance                       |
| nope        | revokeAllowance                      |
| vat         | coreEngine                           |
| VowLike     | AccountingEngineLike                 |
| fess        | pushDebtToQueue                      |
| rely        | grantAuthorization                   |
| deny        | revokeAuthorization                  |
| auth        | isAuthorized                         |
| cage        | shutdown                             |
| clip        | liquidator                           |
| hole        | maxDebtRequiredForActiveAuctions     |
| hole        | maxDebtForActiveAuctions             |
| dirt        | debtRequiredForActiveAuctions        |
| Hole        | globalMaxDebtForActiveAuctions       |
| Dirt        | globalDebtRequiredForActiveAuctions  |
| file(vow)   | updateAccountingEngine               |
| file(Hole)  | updateGlobalMaxDebtForActiveAuctions |
| file(chop)  | updateLiquidatonPenalty              |
| file(hole)  | updateMaxDebtForActiveAuctions       |
| file(clip)  | updateLiquidationAuction             |
| digs        | removeDebtFromLiquidation            |
| Dig         | DebtRemoved                          |
| kick        | startAuction                         |
| Kick        | StartAuction                         |
| urn         | position                             |
| kpr         | keeper                               |
| due         | debtConfiscated                      |
| bark        | liquidatePosition                    |
| yank        | cancelAuction                        |
| Yank        | CancelAuction                        |
| chost       | minDebtForReward                     |
| upchost     | updateMinDebtForReward               |
| take        | bidOnAuction                         |
| Take        | BidOnAuction                         |
| _remove     | removeAuction                        |
| count       | countActiveAuctions                  |
| list        | listActiveAuctions                   |
| status      | auctionStatus                        |
| getStatus   | getAuctionStatus                     |
| Bark        | LiquidatePosition                    |
| Cage        | Shutdown                             |

- removed math




| Clipper       | LiquidationAuction        |
| ------------- | ------------------------- |
| VatLike       | CoreEngineLike            |
| flux          | transferCollateral        |
| PipLike       | OracleLike                |
| SpotterLike   | OracleRelayerLike         |
| peek          | getPrice                  |
| par           | redemptionPrice           |
| ilks          | collateralTypes           |
| DogLike       | LiquidationEngineLike     |
| chop          | liquidatonPenalty         |
| clipperCall   | liquidationCallback       |
| AbacusLike    | DiscountCalculatorLike    |
| price         | discountPrice             |
| rely          | grantAuthorization        |
| deny          | revokeAuthorization       |
| auth          | isAuthorized              |
| ilk           | collateralType            |
| vow           | accountingEngine          |
| spotter       | oracleRelayer             |
| tail          | maxAuctionDuration        |
| cusp          | maxPriceDiscount          |
| ilk           | collateralType            |
| tip           | keeperIncentive           |
| kicks         | auctionCount              |
| active        | activeAuctions            |
| Sale.pos      | index                     |
| Sale.tab      | debtToRaise               |
| Sale.usr      | position                  |
| Sale.lot      | collateralToSell          |
| Sale.tic      | startTime                 |
| Sale.top      | startingPrice             |
| lock          | reentrancyGuard           |
| kick          | startAuction              |
| buf           | startingPriceFactor       |
| chip          | keeperRewardFactor        |
| redo          | restartAuction            |
| Redo          | RestartAuction            |
| id            | auctionId                 |
| who           | liquidatorAddress         |
| amt           | maxCollateralToBuy        |
| mac           | maxPrice                  |
| file(buf)     | updateStartingPriceFactor |
| file(tail)    | updateMaxAuctionDuration  |
| file(cusp)    | updateMaxPriceDiscount    |
| file(chip)    | updateKeeperRewardFactor  |
| file(tip)     | updateKeeperIncentive     |
| file(stopped) | updateStopped             |
| file(spotter) | updateOracleRelayer       |
| file(dog)     | updateLiquidationEngine   |
| file(vow)     | updateAccountingEngine    |
| file(calc)    | updateDiscountCalculator  |
| File          | UpdateParameter           |
| Sale          | Auction                   |
| sale          | auction                   |

- removed math
- remove overflow guard for auction id


| Flapper   | SurplusAuction           |
| --------- | ------------------------ |
| VatLike   | CoreEngineLike           |
| vat       | coreEngine               |
| vat.move  | transferDebt             |
| GemLike   | TokenLike                |
| gem       | governanceToken          |
| gem.move  | transferFrom             |
| now       | block.timestamp          |
| rely      | grantAuthorization       |
| deny      | revokeAuthorization      |
| auth      | isAuthorized             |
| Bid.bid   | Bid.bidAmount            |
| Bid.lot   | Bid.debtToSell           |
| Bid.guy   | Bid.highestBidder        |
| Bid.tic   | Bid.bidExpiry            |
| Bid.end   | Bid.auctionExpiry        |
| beg       | minBidIncrement          |
| ttl       | maxBidDuration           |
| tau       | maxAuctionDuration       |
| kicks     | auctionCount             |
| Kick      | StartAuction             |
| kick      | startAuction             |
| tick      | restartAuction           |
| cage      | shutdown                 |
| yank      | emergencyBidWithdrawal   |
| deal      | settleAuction            |
| tend      | placeBid                 |
| file(beg) | updateMinBidIncrement    |
| file(ttl) | updateMaxBidDuration     |
| file(tau) | updateMaxAuctionDuration |

- changed `burn(address,uint256)` to `burn(uint256)` 
- removed overflow protection for kicks
- removed `add` and `mul`



| Flopper   | DebtAuction               |
| --------- | ------------------------- |
| VatLike   | CoreEngineLike            |
| VowLike   | AccountingEngineLike      |
| vat       | coreEngine                |
| vat.move  | transferDebt              |
| vat.suck  | createUnbackedDebt        |
| vow       | accountingEngine          |
| GemLike   | TokenLike                 |
| gem       | governanceToken           |
| rely      | grantAuthorization        |
| deny      | revokeAuthorization       |
| auth      | isAuthorized              |
| now       | block.timestamp           |
| Bid.bid   | Bid.debtLotSize           |
| Bid.lot   | Bid.governanceTokenToMint |
| Bid.guy   | Bid.highestBidder         |
| Bid.tic   | Bid.bidExpiry             |
| Bid.end   | Bid.auctionExpiry         |
| beg       | minBidIncrement           |
| ttl       | maxBidDuration            |
| tau       | maxAuctionDuration        |
| kicks     | auctionCount              |
| Kick      | StartAuction              |
| kick      | startAuction              |
| tick      | restartAuction            |
| dent      | placeBid                  |
| deal      | settleAuction             |
| yank      | emergencyBidWithdrawal    |
| cage      | shutdown                  |
| pad       | restartMultiplier         |
| file(beg) | updateMinBidIncrement     |
| file(pad) | updateRestartMultiplier   |
| file(ttl) | updateMaxBidDuration      |
| file(tau) | updateMaxAuctionDuration  |

- removed overflow protection for kicks
