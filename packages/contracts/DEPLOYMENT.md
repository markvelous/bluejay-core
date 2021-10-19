
## Deploying Test Collateral

```
hh deployTestCollateral --deployment-cache d.txt --transaction-cache t.txt --name USDT --network local 
```

## Deploying Test Governance Token

```
hh deployTestGovernanceToken --deployment-cache d.txt --transaction-cache t.txt --network local
```

## Deploying Core Infrastructure

Edit the deployment plan first. A sample can be found at `./example/deploymentPlan.json`.

```
hh deployCdp --deployment-cache d.txt --transaction-cache t.txt --deployment-plan ./example/deploymentPlan.json  --network local
```

Note that the deployment cache need to have both the governance token and collaterals defined first. A sample is provided below:

```json
{
  "local": {
    "Collateral[USDT]": "0xD94A92749C0bb33c4e4bA7980c6dAD0e3eFfb720",
    "GovernanceToken": "0xDf951d2061b12922BFbF22cb17B17f3b39183570"
  }
}
```

## Update Oracle Price

```
hh updateOraclePrice --oracle-address 0x984f797d26d3da2E9b9f8Ae4eeFEACC60fCAA90C --price 2000000000000000000000 --network local
```
