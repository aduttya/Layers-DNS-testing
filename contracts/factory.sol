// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import "./Escrow.sol";
import "./MinimalProxy.sol";
import "hardhat/console.sol";

// original code
// https://github.com/optionality/clone-factory/blob/master/contracts/CloneFactory.sol

contract EscrowFactory is Escrow{

        event NewContractCreated(address indexed _to);
        address public implementationContract;
        
            constructor (address _implementationContract) public {
                    implementationContract = _implementationContract;
            }

            function createContract(
                address _client,
                address _freelancer,
                uint _amount,
                string memory cid,
                string memory _msg,
                bytes memory _clientSig,
                uint _clientSigTimestamp,
                bytes memory _freelancerSig,
                uint _freelancerSigTimestamp
            ) public payable returns(address clone){
                // create the clone
                Escrow clone = Escrow(Clones.clone(implementationContract));
                // Escrow escrow = Escrow(createClone(implementationContract));
                // inililize the clone
                clone.initialize{value:msg.value}(
                    _client,
                    _freelancer,
                    _amount,
                    cid,
                    _msg,
                    _clientSig,
                    _clientSigTimestamp,
                    _freelancerSig,
                    _freelancerSigTimestamp
                  );
                console.log("account initialed");
                emit NewContractCreated(address(clone));

  }

}