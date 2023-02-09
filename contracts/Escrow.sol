// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;
import './Initializable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import "hardhat/console.sol";
import "./Signature.sol";

contract Escrow is Initializable,Ownable,Signature{


    event ContractCreated(address indexed _from, address indexed _to,uint _amount);

    address payable public disputer;
     enum Status{
        in_progress,
        done,
        dispute
    }

    struct Parties{
        address client;
        address freelancer;
    }

     
    struct Escrow_account{
        Parties parties;
        uint amount;
        string content_id;
        Status status;
      }

    Escrow_account public account_info;


    // initlilaze the escrow account
    function initialize(
        address _client,
        address _freelancer,
        uint _amount,
        string memory cid,
        string memory _msg,
        bytes memory _clientSig,
        uint _clientSigTimestamp,
        bytes memory _freelancerSig,
        uint _freelancerSigTimestamp

    ) public payable{
        require(verify(_client,_msg,_clientSigTimestamp,_clientSig),"Client is not agreeing");

        // check that client is agreeing with the agreement
        require(verify(_freelancer,_msg,_freelancerSigTimestamp,_freelancerSig),"freelancer is not agreeing");

        // check address aren't zero/same
        // check inittime < endtime
        // check amount != 0 && amount = msg.value
        // check content_id is not null

        require(_client != _freelancer,"address can't be same !");
        require(_client != address(0) && _freelancer != address(0),"addresses can't be zero");
        require(msg.value >= _amount && _amount > 0,"can't be less");
        // create the account object with send values and default ones

        account_info.parties.client = _client;
        account_info.parties.freelancer = _freelancer;
        account_info.content_id = cid;
        account_info.amount = msg.value;
        account_info.status = Status.in_progress;
        
        emit ContractCreated(_client, _freelancer, msg.value);
    }

        
        function update_work_status(Status _status) external{
            require(msg.sender == account_info.parties.client || msg.sender == account_info.parties.freelancer,"Not a valid party");
            require(account_info.status != Status.dispute,"Marked disputed !");
            // only client of the work can update the status mark done
            if(account_info.parties.client == msg.sender){
                account_info.status = _status;
                return;
            }   
            require(_status != Status.done,"only client can mark the work done");
            account_info.status = _status;
        }

        function withdraw() public {
        // check the status of the id, should be done by client
        require(account_info.status == Status.done, "Not marked done");
          // send the money to the freelancer
           (bool sent, bytes memory data) = 
            payable(account_info.parties.freelancer).call{value:account_info.amount}("");
            require(sent, "Failed to send Ether");

            // destory the contract and free the memory

    }

        function set_disputer(
            address _client,
            address _freelancer,
            address payable _disputer,
            string memory _msg,
            bytes memory _clientSig,
            uint _clientSigTimestamp,
            bytes memory _freelancerSig,
            uint _freelancerSigTimestamp
            ) external{
        // check that both are the real parties
        require(account_info.parties.client == _client, "not the real client");
        require(verify(_client,_msg,_clientSigTimestamp,_clientSig),"Client is not agreeing");
        // check that client is agreeing with the agreement

        require(account_info.parties.freelancer == _freelancer, "not the real freelancer");
        require(verify(_freelancer,_msg,_freelancerSigTimestamp,_freelancerSig),"freelancer is not agreeing");
        require(account_info.status == Status.dispute,"Not Disputed");
        disputer = _disputer;
      }

    // pay whole amount to one party (except the disputer fee)
    //   function settle_dispute(address _addr1) external{
    //     require(msg.sender == disputer,"Not disputer");
    //     require(account_info.status == Status.dispute,"Not in dispute");
    //     require(_addr1 == account_info.parties.client || _addr1 == account_info.parties.freelancer,"Not valid Party");

    //     // pay x % to the disputer (proper checksums needs to be added)
    //     uint _disputerPay = (account_info.amount*5)/100;
    //     // pay to the party
    //         (bool sent1,) = 
    //         payable(_addr1).call{value:(account_info.amount-_disputerPay)}("");
    //         require(sent1, "Failed to send Ether");
            
    //         // pay to disputer
    //         (bool sent2,) = 
    //         payable(msg.sender).call{value:(_disputerPay)}("");
    //         require(sent2, "Failed to send Ether");

    //   }

      // split the amount between two parties (except the disputer fee)
      // the passed gas fee may not be accurate
      function settle_dispute(
          address _addr1, 
          uint _amount1,
          address _addr2,
          uint _amount2
          ) external{
        require(msg.sender == disputer,"not disputer");
        require(account_info.status == Status.dispute,"Not in dispute");
        require(_addr1 == account_info.parties.client || _addr1 == account_info.parties.freelancer,"Not valid Party");
        require(_addr2 == account_info.parties.client || _addr2 == account_info.parties.freelancer,"Not valid Party");

        require(_amount1+_amount2 == account_info.amount, "amount exceeded");

        // pay x % to the disputer
        uint _disputerPay1 = (_amount1*3)/100;
        uint _disputerPay2 = (_amount1*3)/100;
        
        require(
            (_amount1 + _amount2) == account_info.amount,"Not valid Amounts"
        );

            (bool sent1,) = 
            payable(_addr1).call{value:_amount1-_disputerPay1}("");
            require(sent1, "Failed to send Ether");

            (bool sent2,) = 
            payable(_addr2).call{value:(_amount2-_disputerPay2)}("");
            require(sent2, "Failed to send Ether");

            (bool sent3,) = 
            payable(msg.sender).call{value:(_disputerPay1+_disputerPay2)}("");
            require(sent3, "Failed to send Ether");
      } 

}

