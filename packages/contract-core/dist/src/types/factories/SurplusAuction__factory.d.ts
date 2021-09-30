import { Signer, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { SurplusAuction, SurplusAuctionInterface } from "../SurplusAuction";
export declare class SurplusAuction__factory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): Promise<SurplusAuction>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string | Promise<string>;
    }): TransactionRequest;
    attach(address: string): SurplusAuction;
    connect(signer: Signer): SurplusAuction__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b50612dad806100206000396000f3fe608060405234801561001057600080fd5b50600436106101585760003560e01c8063571a26a0116100c3578063957aa58c1161007c578063957aa58c146103b85780639b93c039146103d6578063b48028e3146103f2578063c13e80a21461040e578063d25ccf531461042a578063f96dae0a1461044657610158565b8063571a26a0146102e15780635e62be2514610316578063778cdf3d14610332578063790d8596146103505780638f2fdb4214610380578063938f12ac1461039c57610158565b8063335b115e11610115578063335b115e1461021f5780633442f0cf1461023d578063485cc9551461025957806348c9581e146102755780634fee13fc1461029357806356397c35146102c357610158565b8063083759e01461015d57806324ba5884146101795780632ad71573146101a95780632e993611146101c75780633124e684146101e3578063316483d914610201575b600080fd5b610177600480360381019061017291906121b9565b610464565b005b610193600480360381019061018e9190612154565b610547565b6040516101a091906126ff565b60405180910390f35b6101b161055f565b6040516101be91906126ff565b60405180910390f35b6101e160048036038101906101dc91906121b9565b610565565b005b6101eb6108ba565b6040516101f891906127cd565b60405180910390f35b6102096108d2565b60405161021691906126ff565b60405180910390f35b6102276108df565b60405161023491906126ff565b60405180910390f35b610257600480360381019061025291906121b9565b6108e5565b005b610273600480360381019061026e919061217d565b6109e5565b005b61027d610c2e565b60405161028a91906127cd565b60405180910390f35b6102ad60048036038101906102a891906121e2565b610c44565b6040516102ba91906126ff565b60405180910390f35b6102cb610f6b565b6040516102d89190612549565b60405180910390f35b6102fb60048036038101906102f691906121b9565b610f91565b60405161030d9695949392919061271a565b60405180910390f35b610330600480360381019061032b919061221e565b611011565b005b61033a611685565b6040516103479190612527565b60405180910390f35b61036a600480360381019061036591906121b9565b6116dd565b60405161037791906126ff565b60405180910390f35b61039a60048036038101906103959190612154565b611701565b005b6103b660048036038101906103b191906121b9565b61180c565b005b6103c0611a7b565b6040516103cd91906126ff565b60405180910390f35b6103f060048036038101906103eb91906121b9565b611a81565b005b61040c60048036038101906104079190612154565b611b9e565b005b610428600480360381019061042391906121b9565b611caa565b005b610444600480360381019061043f91906121b9565b611dab565b005b61044e611f49565b60405161045b9190612564565b60405180910390f35b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054146104e5576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104dc906125bf565b60405180910390fd5b806005819055507f6d696e426964496e6372656d656e7400000000000000000000000000000000007f6354bf2f326add2b7d9ab868f775f65442dd9a1b9049117fbb95f29acd75819c8260405161053c91906126ff565b60405180910390a250565b60016020528060005260406000206000915090505481565b60075481565b6001600954146105aa576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105a1906126df565b60405180910390fd5b60006002600083815260200190815260200160002060030160149054906101000a900465ffffffffffff1665ffffffffffff16141580156106545750426002600083815260200190815260200160002060030160149054906101000a900465ffffffffffff1665ffffffffffff16108061065357504260026000838152602001908152602001600020600301601a9054906101000a900465ffffffffffff1665ffffffffffff16105b5b610693576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161068a906125df565b60405180910390fd5b600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663fe37d7be306002600085815260200190815260200160002060030160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1660026000868152602001908152602001600020600201546040518463ffffffff1660e01b815260040161073e939291906124f0565b600060405180830381600087803b15801561075857600080fd5b505af115801561076c573d6000803e3d6000fd5b50505050600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166342966c6860026000848152602001908152602001600020600101546040518263ffffffff1660e01b81526004016107e191906126ff565b600060405180830381600087803b1580156107fb57600080fd5b505af115801561080f573d6000803e3d6000fd5b5050505061081c81611f6f565b6002600082815260200190815260200160002060030160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16817fdc7c0653afc6b17d0d1697ab2d10a1b853d2f7ddba6c3f730a1e43d1d1adbc8560026000858152602001908152602001600020600101546040516108af91906126ff565b60405180910390a350565b600660009054906101000a900465ffffffffffff1681565b6000600880549050905090565b60055481565b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205414610966576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161095d906125bf565b60405180910390fd5b806006806101000a81548165ffffffffffff021916908365ffffffffffff1602179055507f6d617841756374696f6e4475726174696f6e00000000000000000000000000007f6354bf2f326add2b7d9ab868f775f65442dd9a1b9049117fbb95f29acd75819c826040516109da91906126ff565b60405180910390a250565b600060019054906101000a900460ff1680610a0b575060008054906101000a900460ff16155b610a4a576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a41906125ff565b60405180910390fd5b60008060019054906101000a900460ff161590508015610a9a576001600060016101000a81548160ff02191690831515021790555060016000806101000a81548160ff0219169083151502179055505b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555082600360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555081600460006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060016009819055503373ffffffffffffffffffffffffffffffffffffffff167ff68e81b76a46eee883f370815faeeac60926d964ac05f6d7db0cfe7dabad1f8860405160405180910390a2670e92596fd6290000600581905550612a30600660006101000a81548165ffffffffffff021916908365ffffffffffff1602179055506202a3006006806101000a81548165ffffffffffff021916908365ffffffffffff1602179055508015610c295760008060016101000a81548160ff0219169083151502179055505b505050565b60068054906101000a900465ffffffffffff1681565b600060018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205414610cc7576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610cbe906125bf565b60405180910390fd5b600160095414610d0c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d03906126df565b60405180910390fd5b600760008154610d1b906129db565b919050819055905060088190806001815401808255809150506001900390600052602060002001600090919091909150556001600880549050610d5e91906128ff565b6002600083815260200190815260200160002060000181905550816002600083815260200190815260200160002060010181905550826002600083815260200190815260200160002060020181905550336002600083815260200190815260200160002060030160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060068054906101000a900465ffffffffffff1642610e219190612869565b60026000838152602001908152602001600020600301601a6101000a81548165ffffffffffff021916908365ffffffffffff160217905550600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663fe37d7be3330866040518463ffffffff1660e01b8152600401610eb8939291906124f0565b600060405180830381600087803b158015610ed257600080fd5b505af1158015610ee6573d6000803e3d6000fd5b505050503373ffffffffffffffffffffffffffffffffffffffff16817f12debc2e95b4855c4501785a964ecc023c4e0ef8bcacc733f72647820048a5b360026000858152602001908152602001600020600301601a9054906101000a900465ffffffffffff168686604051610f5d939291906127e8565b60405180910390a392915050565b600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60026020528060005260406000206000915090508060000154908060010154908060020154908060030160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16908060030160149054906101000a900465ffffffffffff169080600301601a9054906101000a900465ffffffffffff16905086565b600160095414611056576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161104d906126df565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff166002600085815260200190815260200160002060030160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614156110fc576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016110f39061261f565b60405180910390fd5b426002600085815260200190815260200160002060030160149054906101000a900465ffffffffffff1665ffffffffffff16118061116a575060006002600085815260200190815260200160002060030160149054906101000a900465ffffffffffff1665ffffffffffff16145b6111a9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016111a09061263f565b60405180910390fd5b4260026000858152602001908152602001600020600301601a9054906101000a900465ffffffffffff1665ffffffffffff161161121b576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016112129061265f565b60405180910390fd5b60026000848152602001908152602001600020600201548214611273576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161126a9061267f565b60405180910390fd5b600260008481526020019081526020016000206001015481116112cb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016112c29061259f565b60405180910390fd5b60026000848152602001908152602001600020600101546005546112ef91906128a5565b670de0b6b3a76400008261130391906128a5565b1015611344576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161133b9061269f565b60405180910390fd5b6002600084815260200190815260200160002060030160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146114e057600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166323b872dd336002600087815260200190815260200160002060030160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1660026000888152602001908152602001600020600101546040518463ffffffff1660e01b8152600401611458939291906124f0565b600060405180830381600087803b15801561147257600080fd5b505af1158015611486573d6000803e3d6000fd5b50505050336002600085815260200190815260200160002060030160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505b600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166323b872dd333060026000888152602001908152602001600020600101548561154291906128ff565b6040518463ffffffff1660e01b8152600401611560939291906124f0565b600060405180830381600087803b15801561157a57600080fd5b505af115801561158e573d6000803e3d6000fd5b50505050806002600085815260200190815260200160002060010181905550600660009054906101000a900465ffffffffffff16426115cd9190612869565b6002600085815260200190815260200160002060030160146101000a81548165ffffffffffff021916908365ffffffffffff1602179055503373ffffffffffffffffffffffffffffffffffffffff16837fce69dd32ee2150c424e3dd98f17a87a76fa00be1093b6869432dbc30f69607b983856002600089815260200190815260200160002060030160149054906101000a900465ffffffffffff166040516116789392919061277b565b60405180910390a3505050565b606060088054806020026020016040519081016040528092919081815260200182805480156116d357602002820191906000526020600020905b8154815260200190600101908083116116bf575b5050505050905090565b600881815481106116ed57600080fd5b906000526020600020016000915090505481565b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205414611782576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611779906125bf565b60405180910390fd5b60018060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508073ffffffffffffffffffffffffffffffffffffffff167ff68e81b76a46eee883f370815faeeac60926d964ac05f6d7db0cfe7dabad1f8860405160405180910390a250565b600060095414611851576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611848906126bf565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff166002600083815260200190815260200160002060030160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614156118f7576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016118ee9061261f565b60405180910390fd5b600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166323b872dd306002600085815260200190815260200160002060030160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1660026000868152602001908152602001600020600101546040518463ffffffff1660e01b81526004016119a2939291906124f0565b600060405180830381600087803b1580156119bc57600080fd5b505af11580156119d0573d6000803e3d6000fd5b505050506119dd81611f6f565b6002600082815260200190815260200160002060030160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16817fca7f97cc0a5d5eb4062fce90ef5942adab540674cc663c2afd64ab0e2157c5d06002600085815260200190815260200160002060010154604051611a7091906126ff565b60405180910390a350565b60095481565b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205414611b02576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611af9906125bf565b60405180910390fd5b6000600981905550600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663fe37d7be3033846040518463ffffffff1660e01b8152600401611b69939291906124f0565b600060405180830381600087803b158015611b8357600080fd5b505af1158015611b97573d6000803e3d6000fd5b5050505050565b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205414611c1f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611c16906125bf565b60405180910390fd5b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508073ffffffffffffffffffffffffffffffffffffffff167ff1fb81a1db01a30a631ba89f5c83a43f2c9273aad05ec220f22ce42c02c1684860405160405180910390a250565b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205414611d2b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611d22906125bf565b60405180910390fd5b80600660006101000a81548165ffffffffffff021916908365ffffffffffff1602179055507f6d61784269644475726174696f6e0000000000000000000000000000000000007f6354bf2f326add2b7d9ab868f775f65442dd9a1b9049117fbb95f29acd75819c82604051611da091906126ff565b60405180910390a250565b4260026000838152602001908152602001600020600301601a9054906101000a900465ffffffffffff1665ffffffffffff1610611e1d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611e14906125df565b60405180910390fd5b60006002600083815260200190815260200160002060030160149054906101000a900465ffffffffffff1665ffffffffffff1614611e90576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611e879061257f565b60405180910390fd5b60068054906101000a900465ffffffffffff1642611eae9190612869565b60026000838152602001908152602001600020600301601a6101000a81548165ffffffffffff021916908365ffffffffffff160217905550807f10a109258779eb298071adf16637b95f8d7cf00e49595711da10eeb90e6e8e9460026000848152602001908152602001600020600301601a9054906101000a900465ffffffffffff16604051611f3e91906127b2565b60405180910390a250565b600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600060086001600880549050611f8591906128ff565b81548110611fbc577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b90600052602060002001549050808214612051576000600260008481526020019081526020016000206000015490508160088281548110612026577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b9060005260206000200181905550806002600084815260200190815260200160002060000181905550505b6008805480612089577f4e487b7100000000000000000000000000000000000000000000000000000000600052603160045260246000fd5b6001900381819060005260206000200160009055905560026000838152602001908152602001600020600080820160009055600182016000905560028201600090556003820160006101000a81549073ffffffffffffffffffffffffffffffffffffffff02191690556003820160146101000a81549065ffffffffffff021916905560038201601a6101000a81549065ffffffffffff021916905550505050565b60008135905061213981612d49565b92915050565b60008135905061214e81612d60565b92915050565b60006020828403121561216657600080fd5b60006121748482850161212a565b91505092915050565b6000806040838503121561219057600080fd5b600061219e8582860161212a565b92505060206121af8582860161212a565b9150509250929050565b6000602082840312156121cb57600080fd5b60006121d98482850161213f565b91505092915050565b600080604083850312156121f557600080fd5b60006122038582860161213f565b92505060206122148582860161213f565b9150509250929050565b60008060006060848603121561223357600080fd5b60006122418682870161213f565b93505060206122528682870161213f565b92505060406122638682870161213f565b9150509250925092565b600061227983836124b4565b60208301905092915050565b61228e81612933565b82525050565b600061229f8261282f565b6122a98185612847565b93506122b48361281f565b8060005b838110156122e55781516122cc888261226d565b97506122d78361283a565b9250506001810190506122b8565b5085935050505092915050565b6122fb81612981565b82525050565b61230a816129a5565b82525050565b600061231d602183612858565b915061232882612a53565b604082019050919050565b6000612340601d83612858565b915061234b82612aa2565b602082019050919050565b6000612363601d83612858565b915061236e82612acb565b602082019050919050565b6000612386601b83612858565b915061239182612af4565b602082019050919050565b60006123a9602e83612858565b91506123b482612b1d565b604082019050919050565b60006123cc602483612858565b91506123d782612b6c565b604082019050919050565b60006123ef602983612858565b91506123fa82612bbb565b604082019050919050565b6000612412602383612858565b915061241d82612c0a565b604082019050919050565b6000612435602683612858565b915061244082612c59565b604082019050919050565b6000612458602483612858565b915061246382612ca8565b604082019050919050565b600061247b601983612858565b915061248682612cf7565b602082019050919050565b600061249e601783612858565b91506124a982612d20565b602082019050919050565b6124bd81612965565b82525050565b6124cc81612965565b82525050565b6124db816129c9565b82525050565b6124ea8161296f565b82525050565b60006060820190506125056000830186612285565b6125126020830185612285565b61251f60408301846124c3565b949350505050565b600060208201905081810360008301526125418184612294565b905092915050565b600060208201905061255e60008301846122f2565b92915050565b60006020820190506125796000830184612301565b92915050565b6000602082019050818103600083015261259881612310565b9050919050565b600060208201905081810360008301526125b881612333565b9050919050565b600060208201905081810360008301526125d881612356565b9050919050565b600060208201905081810360008301526125f881612379565b9050919050565b600060208201905081810360008301526126188161239c565b9050919050565b60006020820190508181036000830152612638816123bf565b9050919050565b60006020820190508181036000830152612658816123e2565b9050919050565b6000602082019050818103600083015261267881612405565b9050919050565b6000602082019050818103600083015261269881612428565b9050919050565b600060208201905081810360008301526126b88161244b565b9050919050565b600060208201905081810360008301526126d88161246e565b9050919050565b600060208201905081810360008301526126f881612491565b9050919050565b600060208201905061271460008301846124c3565b92915050565b600060c08201905061272f60008301896124c3565b61273c60208301886124c3565b61274960408301876124c3565b6127566060830186612285565b61276360808301856124e1565b61277060a08301846124e1565b979650505050505050565b600060608201905061279060008301866124c3565b61279d60208301856124c3565b6127aa60408301846124d2565b949350505050565b60006020820190506127c760008301846124d2565b92915050565b60006020820190506127e260008301846124e1565b92915050565b60006060820190506127fd60008301866124d2565b61280a60208301856124c3565b61281760408301846124c3565b949350505050565b6000819050602082019050919050565b600081519050919050565b6000602082019050919050565b600082825260208201905092915050565b600082825260208201905092915050565b60006128748261296f565b915061287f8361296f565b92508265ffffffffffff0382111561289a57612899612a24565b5b828201905092915050565b60006128b082612965565b91506128bb83612965565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04831182151516156128f4576128f3612a24565b5b828202905092915050565b600061290a82612965565b915061291583612965565b92508282101561292857612927612a24565b5b828203905092915050565b600061293e82612945565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b600065ffffffffffff82169050919050565b600061298c82612993565b9050919050565b600061299e82612945565b9050919050565b60006129b0826129b7565b9050919050565b60006129c282612945565b9050919050565b60006129d48261296f565b9050919050565b60006129e682612965565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff821415612a1957612a18612a24565b5b600182019050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f537572706c757341756374696f6e2f6269642d616c72656164792d706c61636560008201527f6400000000000000000000000000000000000000000000000000000000000000602082015250565b7f537572706c757341756374696f6e2f6269642d6e6f742d686967686572000000600082015250565b7f537572706c757341756374696f6e2f6e6f742d617574686f72697a6564000000600082015250565b7f537572706c757341756374696f6e2f6e6f742d66696e69736865640000000000600082015250565b7f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160008201527f647920696e697469616c697a6564000000000000000000000000000000000000602082015250565b7f537572706c757341756374696f6e2f686967686573744269646465722d6e6f7460008201527f2d73657400000000000000000000000000000000000000000000000000000000602082015250565b7f537572706c757341756374696f6e2f616c72656164792d66696e69736865642d60008201527f6269644578706972790000000000000000000000000000000000000000000000602082015250565b7f537572706c757341756374696f6e2f616c72656164792d66696e69736865642d60008201527f656e640000000000000000000000000000000000000000000000000000000000602082015250565b7f537572706c757341756374696f6e2f64656274546f53656c6c2d6e6f742d6d6160008201527f746368696e670000000000000000000000000000000000000000000000000000602082015250565b7f537572706c757341756374696f6e2f696e73756666696369656e742d696e637260008201527f6561736500000000000000000000000000000000000000000000000000000000602082015250565b7f537572706c757341756374696f6e2f7374696c6c2d6c69766500000000000000600082015250565b7f537572706c757341756374696f6e2f6e6f742d6c697665000000000000000000600082015250565b612d5281612933565b8114612d5d57600080fd5b50565b612d6981612965565b8114612d7457600080fd5b5056fea26469706673582212204a9f89f0975f561d149db1c91d4b800c09a694c077aafe484c165106217de94264736f6c63430008040033";
    static readonly abi: ({
        anonymous: boolean;
        inputs: {
            indexed: boolean;
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
        outputs?: undefined;
        stateMutability?: undefined;
    } | {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
        anonymous?: undefined;
    })[];
    static createInterface(): SurplusAuctionInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): SurplusAuction;
}
