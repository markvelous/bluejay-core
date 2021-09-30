/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  DSProxyFactory,
  DSProxyFactoryInterface,
} from "../DSProxyFactory";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "proxy",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "cache",
        type: "address",
      },
    ],
    name: "Created",
    type: "event",
  },
  {
    inputs: [],
    name: "build",
    outputs: [
      {
        internalType: "address payable",
        name: "proxy",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "build",
    outputs: [
      {
        internalType: "address payable",
        name: "proxy",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "cache",
    outputs: [
      {
        internalType: "contract DSProxyCache",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "isProxy",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5060405161001d9061007f565b604051809103906000f080158015610039573d6000803e3d6000fd5b50600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555061008c565b61039a8061207183390190565b611fd68061009b6000396000f3fe60806040523480156200001157600080fd5b5060043610620000525760003560e01c806329710388146200005757806360c7d295146200008d5780638e1a55fc14620000af578063f3701da214620000d1575b600080fd5b6200007560048036038101906200006f919062000339565b62000107565b60405162000084919062000410565b60405180910390f35b6200009762000127565b604051620000a691906200042d565b60405180910390f35b620000b96200014d565b604051620000c89190620003c6565b60405180910390f35b620000ef6004803603810190620000e9919062000339565b6200015f565b604051620000fe9190620003c6565b60405180910390f35b60006020528060005260406000206000915054906101000a900460ff1681565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60006200015a336200015f565b905090565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16604051620001929062000314565b6200019e9190620003a9565b604051809103906000f080158015620001bb573d6000803e3d6000fd5b5090508173ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f259b30ca39885c6d801a0b5dbc988640f3c25e2f37531fe138c5c5af8955d41b83600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1660405162000241929190620003e3565b60405180910390a38073ffffffffffffffffffffffffffffffffffffffff166313af4035836040518263ffffffff1660e01b8152600401620002849190620003a9565b600060405180830381600087803b1580156200029f57600080fd5b505af1158015620002b4573d6000803e3d6000fd5b5050505060016000808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff021916908315150217905550919050565b611ac080620004e183390190565b6000813590506200033381620004c6565b92915050565b6000602082840312156200034c57600080fd5b60006200035c8482850162000322565b91505092915050565b62000370816200045e565b82525050565b62000381816200044a565b82525050565b620003928162000472565b82525050565b620003a3816200049e565b82525050565b6000602082019050620003c0600083018462000376565b92915050565b6000602082019050620003dd600083018462000365565b92915050565b6000604082019050620003fa600083018562000376565b62000409602083018462000376565b9392505050565b600060208201905062000427600083018462000387565b92915050565b600060208201905062000444600083018462000398565b92915050565b600062000457826200047e565b9050919050565b60006200046b826200047e565b9050919050565b60008115159050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000620004ab82620004b2565b9050919050565b6000620004bf826200047e565b9050919050565b620004d1816200044a565b8114620004dd57600080fd5b5056fe60806040523480156200001157600080fd5b5060405162001ac038038062001ac0833981810160405281019062000037919062000486565b33600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055503373ffffffffffffffffffffffffffffffffffffffff167fce241d7ca1f669fee44b6fc00b8eba2df3bb514eed0f6f668f8f89096e81ed9460405160405180910390a2620000cc81620000d460201b60201c565b505062000787565b60006200010c336000357fffffffff00000000000000000000000000000000000000000000000000000000166200029a60201b60201c565b6200014e576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016200014590620005cf565b60405180910390fd5b600080600060043592506024359150349050600073ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff161415620001d3576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401620001ca90620005f1565b60405180910390fd5b84600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506001935081833373ffffffffffffffffffffffffffffffffffffffff166000357fffffffff00000000000000000000000000000000000000000000000000000000167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916846000366040516200028a9392919062000613565b60405180910390a4505050919050565b60003073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415620002db576001905062000452565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614156200033c576001905062000452565b600073ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614156200039c576000905062000452565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663b70096138430856040518463ffffffff1660e01b8152600401620003fb9392919062000592565b60206040518083038186803b1580156200041457600080fd5b505afa15801562000429573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906200044f9190620004b2565b90505b92915050565b600081519050620004698162000753565b92915050565b60008151905062000480816200076d565b92915050565b6000602082840312156200049957600080fd5b6000620004a98482850162000458565b91505092915050565b600060208284031215620004c557600080fd5b6000620004d5848285016200046f565b91505092915050565b620004e9816200066b565b82525050565b620004fa816200068b565b82525050565b60006200050e838562000649565b93506200051d838584620006e1565b6200052883620006f0565b840190509392505050565b6000620005426014836200065a565b91506200054f8262000701565b602082019050919050565b600062000569601f836200065a565b915062000576826200072a565b602082019050919050565b6200058c81620006d7565b82525050565b6000606082019050620005a96000830186620004de565b620005b86020830185620004de565b620005c76040830184620004ef565b949350505050565b60006020820190508181036000830152620005ea8162000533565b9050919050565b600060208201905081810360008301526200060c816200055a565b9050919050565b60006040820190506200062a600083018662000581565b81810360208301526200063f81848662000500565b9050949350505050565b600082825260208201905092915050565b600082825260208201905092915050565b60006200067882620006b7565b9050919050565b60008115159050919050565b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b82818337600083830152505050565b6000601f19601f8301169050919050565b7f64732d617574682d756e617574686f72697a6564000000000000000000000000600082015250565b7f64732d70726f78792d63616368652d616464726573732d726571756972656400600082015250565b6200075e816200066b565b81146200076a57600080fd5b50565b62000778816200067f565b81146200078457600080fd5b50565b61132980620007976000396000f3fe60806040526004361061007f5760003560e01c80637a9e5e4b1161004e5780637a9e5e4b1461013d5780638da5cb5b14610166578063948f507614610191578063bf7e214f146101ce57610086565b806313af4035146100885780631cff79cd146100b15780631f6a1eb9146100e157806360c7d2951461011257610086565b3661008657005b005b34801561009457600080fd5b506100af60048036038101906100aa9190610c1b565b6101f9565b005b6100cb60048036038101906100c69190610c6d565b61030f565b6040516100d89190610f45565b60405180910390f35b6100fb60048036038101906100f69190610cea565b6104cb565b604051610109929190610efa565b60405180910390f35b34801561011e57600080fd5b50610127610674565b6040516101349190610f82565b60405180910390f35b34801561014957600080fd5b50610164600480360381019061015f9190610d56565b61069a565b005b34801561017257600080fd5b5061017b6107ad565b6040516101889190610ea8565b60405180910390f35b34801561019d57600080fd5b506101b860048036038101906101b39190610c1b565b6107d3565b6040516101c59190610f2a565b60405180910390f35b3480156101da57600080fd5b506101e3610989565b6040516101f09190610f67565b60405180910390f35b610227336000357fffffffff00000000000000000000000000000000000000000000000000000000166109ad565b610266576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161025d90610f9d565b60405180910390fd5b80600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167fce241d7ca1f669fee44b6fc00b8eba2df3bb514eed0f6f668f8f89096e81ed9460405160405180910390a250565b606061033f336000357fffffffff00000000000000000000000000000000000000000000000000000000166109ad565b61037e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161037590610f9d565b60405180910390fd5b600080600060043592506024359150349050600073ffffffffffffffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff161415610400576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103f790610fbd565b60405180910390fd5b600080865160208801896113885a03f43d6040519550601f19601f6020830101168601604052808652806000602088013e81156001811461044057610447565b8160208801fd5b50505081833373ffffffffffffffffffffffffffffffffffffffff166000357fffffffff00000000000000000000000000000000000000000000000000000000167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916846000366040516104ba93929190610ffd565b60405180910390a450505092915050565b60006060600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16638bf4515c856040518263ffffffff1660e01b815260040161052a9190610f45565b60206040518083038186803b15801561054257600080fd5b505afa158015610556573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061057a9190610c44565b9150600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141561066157600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16637ed0c3b2856040518263ffffffff1660e01b815260040161060c9190610f45565b602060405180830381600087803b15801561062657600080fd5b505af115801561063a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061065e9190610c44565b91505b61066b828461030f565b90509250929050565b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6106c8336000357fffffffff00000000000000000000000000000000000000000000000000000000166109ad565b610707576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106fe90610f9d565b60405180910390fd5b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f1abebea81bfa2637f28358c371278fb15ede7ea8dd28d2e03b112ff6d936ada460405160405180910390a250565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000610803336000357fffffffff00000000000000000000000000000000000000000000000000000000166109ad565b610842576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161083990610f9d565b60405180910390fd5b600080600060043592506024359150349050600073ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff1614156108c4576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016108bb90610fdd565b60405180910390fd5b84600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506001935081833373ffffffffffffffffffffffffffffffffffffffff166000357fffffffff00000000000000000000000000000000000000000000000000000000167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19168460003660405161097993929190610ffd565b60405180910390a4505050919050565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60003073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614156109ec5760019050610b59565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415610a4b5760019050610b59565b600073ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161415610aa95760009050610b59565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663b70096138430856040518463ffffffff1660e01b8152600401610b0693929190610ec3565b60206040518083038186803b158015610b1e57600080fd5b505afa158015610b32573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b569190610cc1565b90505b92915050565b6000610b72610b6d84611054565b61102f565b905082815260208101848484011115610b8a57600080fd5b610b95848285611180565b509392505050565b600081359050610bac816112ae565b92915050565b600081519050610bc1816112ae565b92915050565b600081519050610bd6816112c5565b92915050565b600082601f830112610bed57600080fd5b8135610bfd848260208601610b5f565b91505092915050565b600081359050610c15816112dc565b92915050565b600060208284031215610c2d57600080fd5b6000610c3b84828501610b9d565b91505092915050565b600060208284031215610c5657600080fd5b6000610c6484828501610bb2565b91505092915050565b60008060408385031215610c8057600080fd5b6000610c8e85828601610b9d565b925050602083013567ffffffffffffffff811115610cab57600080fd5b610cb785828601610bdc565b9150509250929050565b600060208284031215610cd357600080fd5b6000610ce184828501610bc7565b91505092915050565b60008060408385031215610cfd57600080fd5b600083013567ffffffffffffffff811115610d1757600080fd5b610d2385828601610bdc565b925050602083013567ffffffffffffffff811115610d4057600080fd5b610d4c85828601610bdc565b9150509250929050565b600060208284031215610d6857600080fd5b6000610d7684828501610c06565b91505092915050565b610d88816110b2565b82525050565b610d97816110c4565b82525050565b610da6816110d0565b82525050565b6000610db88385611090565b9350610dc5838584611180565b610dce83611222565b840190509392505050565b6000610de482611085565b610dee8185611090565b9350610dfe81856020860161118f565b610e0781611222565b840191505092915050565b610e1b81611138565b82525050565b610e2a8161115c565b82525050565b6000610e3d6014836110a1565b9150610e4882611233565b602082019050919050565b6000610e606020836110a1565b9150610e6b8261125c565b602082019050919050565b6000610e83601f836110a1565b9150610e8e82611285565b602082019050919050565b610ea28161112e565b82525050565b6000602082019050610ebd6000830184610d7f565b92915050565b6000606082019050610ed86000830186610d7f565b610ee56020830185610d7f565b610ef26040830184610d9d565b949350505050565b6000604082019050610f0f6000830185610d7f565b8181036020830152610f218184610dd9565b90509392505050565b6000602082019050610f3f6000830184610d8e565b92915050565b60006020820190508181036000830152610f5f8184610dd9565b905092915050565b6000602082019050610f7c6000830184610e12565b92915050565b6000602082019050610f976000830184610e21565b92915050565b60006020820190508181036000830152610fb681610e30565b9050919050565b60006020820190508181036000830152610fd681610e53565b9050919050565b60006020820190508181036000830152610ff681610e76565b9050919050565b60006040820190506110126000830186610e99565b8181036020830152611025818486610dac565b9050949350505050565b600061103961104a565b905061104582826111c2565b919050565b6000604051905090565b600067ffffffffffffffff82111561106f5761106e6111f3565b5b61107882611222565b9050602081019050919050565b600081519050919050565b600082825260208201905092915050565b600082825260208201905092915050565b60006110bd8261110e565b9050919050565b60008115159050919050565b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b6000611107826110b2565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b60006111438261114a565b9050919050565b60006111558261110e565b9050919050565b60006111678261116e565b9050919050565b60006111798261110e565b9050919050565b82818337600083830152505050565b60005b838110156111ad578082015181840152602081019050611192565b838111156111bc576000848401525b50505050565b6111cb82611222565b810181811067ffffffffffffffff821117156111ea576111e96111f3565b5b80604052505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6000601f19601f8301169050919050565b7f64732d617574682d756e617574686f72697a6564000000000000000000000000600082015250565b7f64732d70726f78792d7461726765742d616464726573732d7265717569726564600082015250565b7f64732d70726f78792d63616368652d616464726573732d726571756972656400600082015250565b6112b7816110b2565b81146112c257600080fd5b50565b6112ce816110c4565b81146112d957600080fd5b50565b6112e5816110fc565b81146112f057600080fd5b5056fea2646970667358221220707ed14b04f4d225681a6f13ed76f3e05e31cfc6fb2403177813652e1f73f97f64736f6c63430008040033a2646970667358221220f1d7b286c9c6eee24b7c96dd296f35e4d1bde5db1cc768ec17739f44806a8eb564736f6c63430008040033608060405234801561001057600080fd5b5061037a806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80637ed0c3b21461003b5780638bf4515c1461006b575b600080fd5b610055600480360381019061005091906101d1565b61009b565b6040516100629190610221565b60405180910390f35b610085600480360381019061008091906101d1565b610121565b6040516100929190610221565b60405180910390f35b60008151602083016000f09050803b15600181146100b8576100bd565b600080fd5b506000828051906020012090508160008083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050919050565b6000808280519060200120905060008082815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16915050919050565b600061017c61017784610261565b61023c565b90508281526020810184848401111561019457600080fd5b61019f8482856102c4565b509392505050565b600082601f8301126101b857600080fd5b81356101c8848260208601610169565b91505092915050565b6000602082840312156101e357600080fd5b600082013567ffffffffffffffff8111156101fd57600080fd5b610209848285016101a7565b91505092915050565b61021b81610292565b82525050565b60006020820190506102366000830184610212565b92915050565b6000610246610257565b905061025282826102d3565b919050565b6000604051905090565b600067ffffffffffffffff82111561027c5761027b610304565b5b61028582610333565b9050602081019050919050565b600061029d826102a4565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b82818337600083830152505050565b6102dc82610333565b810181811067ffffffffffffffff821117156102fb576102fa610304565b5b80604052505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6000601f19601f830116905091905056fea2646970667358221220b68e425f85fbf681c6ad43d4b1875242e974d5e239abd0a9240553c6a4a8664b64736f6c63430008040033";

export class DSProxyFactory__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<DSProxyFactory> {
    return super.deploy(overrides || {}) as Promise<DSProxyFactory>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): DSProxyFactory {
    return super.attach(address) as DSProxyFactory;
  }
  connect(signer: Signer): DSProxyFactory__factory {
    return super.connect(signer) as DSProxyFactory__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): DSProxyFactoryInterface {
    return new utils.Interface(_abi) as DSProxyFactoryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): DSProxyFactory {
    return new Contract(address, _abi, signerOrProvider) as DSProxyFactory;
  }
}
