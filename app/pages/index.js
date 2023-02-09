import Head from 'next/head';
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { Web3Button, 
        useAccount,
        useContract,
        useSignMessage,
        useContractWrite,
        useProvider,
        useSigner,
        Web3Modal} from '@web3modal/react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ethers } from "ethers";
import { useState,useEffect } from 'react';
import {Web3Auth} from "@web3auth/modal";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { LOGIN_MODAL_EVENTS } from "@web3auth/ui";
import { useRouter} from 'next/router';

// import {abi} from '../../artifacts/contracts/NFT.sol/BtechProejctNFT.json'
import {abi} from "../../artifacts/contracts/factory.sol/EscrowFactory.json";
// import {abi} from "../../artifacts/contracts/Escrow.sol/Escrow.json";
const url ='https://polygon-mumbai.infura.io/v3/a2d512999ccc4e8fa4c183b6d1d6ad9a'

const address = "0x73BFBAb33088fa7F404808370F892eC9cd4EE7BD";

export default function Home() {

  const router = useRouter()

  const [user,setUser] = useState({
    address:null,
    balance : null,
    web3auth : null,
    provider : null,
    data : [{}]
  })

  const [otherParty,setOtherParty] = useState('')

async function disconnect(){
      await user.web3auth.logout()
      setUser({...user,balance:null,address:null,data:null})

} 

// wallet to initiate the connection
//  1. Connect wallet, get provider.
//  2. get user data.
//  3. Filter contract ids from user data.
//  4. Get contracts from database using their Ids
//  5. update the user object

async function initWallet(){

  if (typeof window !== 'undefined') {
    console.log('You are on the browser,You are good to go')

    const web3auth = new Web3Auth({
      clientId: "BI_GwSoSJDmsAS4Wf8nJ54lfFb3al54YeBoNFxyA5z6c2dLyEQ-a-kfV7P4MQtiWCNryg2Zh5IZtiCk3IIkp3JY",
      authMode: 'DAPP',
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0x13881",
        rpcTarget: url, // This is the mainnet RPC we have added, please pass on your own endpoint while creating an app
      },
      web3AuthNetwork:"testnet"
    });

    await web3auth.initModal();
    await web3auth.connect();

    const provider = new ethers.providers.Web3Provider(web3auth.provider);
    const signer = provider.getSigner()
    const Uaddress = await signer.getAddress()

    // check if the user with the address exist or not
    await checkUser(Uaddress);

    let bal = await provider.getBalance(Uaddress)
    bal= bal.toString()

    // get the user data
    let data; 
    try{
      let value = await fetch(`/api/?address=${Uaddress}`,{
        method:'GET',
        headers : {
          "Content-Type" : "application/json"
        }
      })
    value = await value.json()
    data = value.data[0]
    }
    catch(err){
      console.log(err)
    }

    // get all the contracts data for the user
    let user_contracts = []
    for(let i = 0; i < data.contracts.length; ++i){
      try{
        let value = await fetch(`/api/contracts/${data.contracts[i]}`,{
          method:'GET',
          headers : {
            "Content-Type" : "application/json"
          }
        })
      value = await value.json()
      user_contracts.push(value.data)
      }
      catch(err){
        console.log(err)
      }
    }

    setUser({...user,balance:bal,address:Uaddress,data:user_contracts,web3auth:web3auth,provider:provider})
    } else {
    console.log('You are on the server,Cannot execute')
   }
}
console.log(user)

async function CreateContract(id){
    // get the data from the database

    let data;
    try{
      data = await fetch(`/api/contracts/${id}`,{
        method:'GET',
        headers : {
          "Content-Type" : "application/json"
        }      
      })
      data = await data.json()
      data = data.data;
    }catch(err){
      console.log(err)
    }

    // check both parties have signed 
    let IsClient = false;
    let IsFreelancer = false;

    if(data.client.signature !== ""){IsClient = true}
    if(data.client.signature !== ""){IsFreelancer = true}

    if(IsClient && IsFreelancer){
      console.log("Both parties have signed")
      // construct the data 
      // send it to the smart contract
      const msg = "I Agree to terms and conditions";
      // get message hash using signatures contract
    const signer = user.provider.getSigner();

    const contract = new ethers.Contract(address,abi,signer);
    const _amount = ethers.utils.parseEther('0.000001').toString();

    const tx = await contract.createContract(
      data.client.address,
      data.freelancer.address,
      _amount,
      "none",
      msg,
      data.client.signature,
      data.client.signatureTimestamp,
      data.freelancer.signature,
      data.freelancer.signatureTimestamp,
      {value : _amount}
    )

    let receipt = await tx.wait()
    console.log(receipt)
    // save the contract address to the contract in the database using it's id.
    const contractAddress = receipt.logs[2].address;
    console.log("deployed contract address",contractAddress)

    try{
        await fetch(`/api/contracts/${id}`,{
        method:'PUT',
        headers : {
          "Content-Type" : "application/json"
        },
        body:JSON.stringify({
          address : contractAddress
        })      
      })
    }catch(err){
      console.log(err)
    }

    }else{
      console.log("Not signed")
    }
}

// assuming client is creating the contract.
//  1. Get timestamp, and the message signed by the user.
//  2. get the address of other party.
//  3. check if the other party exist, if not create a user account for it.
async function signAndSend() {
  console.log("SIgn")
  const timestamp = new Date().valueOf()
  const msg = "I Agree to terms and conditions";
  // get message hash using signatures contract
  const signer = user.provider.getSigner();

  const contract = new ethers.Contract(address,abi,signer)
  let msgHash_client = await contract.getMessageHash(user.address,msg,(timestamp+(60*60)))
  const signable_msg = ethers.utils.arrayify(msgHash_client)

  const signature = await signer.signMessage(signable_msg)
//  contract object
    let obj = {
    client : {
    address : user.address,
    signature : signature,
    signatureTimestamp : (timestamp+(60*60))
    },
    freelancer : {
      address : otherParty,
      signature : "",
      signatureTimestamp : null
    }
  }
  const verify = await contract.verify(
    user.address,
    msg,
    timestamp+(60*60),
    signature
  )
  console.log(verify)

  let object_id
  // push the data into contracts 
  try{
      let data = await fetch('/api/contracts/',{
      method:'POST',
      headers : {
        "Content-Type" : "application/json"
      },
      body:JSON.stringify(obj)
      })
      data = await data.json()
    object_id = data.data._id
  }catch(err){
    console.log(err)
  }

  // push the object id in both users's profile
  try{
      await fetch(`/api/?address=${user.address}`,{
      method:'PUT',
      headers : {
        "Content-Type" : "application/json"
      },
      body:JSON.stringify(object_id)
    })
    console.log("successfully updated")
  }catch(err){
    console.log(err)
  }
  
  // check whether other party exist or not, if not create an account for it.
  await checkUser(otherParty);
  // push the data to another party
  try{
    await fetch(`/api/?address=${otherParty}`,{
    method:'PUT',
    headers : {
      "Content-Type" : "application/json"
    },
    body:JSON.stringify(object_id)
    })
      console.log("successfully updated")
  }catch(err){
    console.log(err)
  }
  console.log("successfully data updated")
}

async function ApproveAndSign(id){

  // load the data of the send id contract.
  let data;
  try{
    data = await fetch(`/api/contracts/${id}`,{
    method:'GET',
    headers : {
      "Content-Type" : "application/json"
    }
    })
    data = await data.json()
    data = data.data
  }catch(err){
  console.log(err)
  } 

  const timestamp = new Date().valueOf()
  const msg = "I Agree to terms and conditions";
  // get message hash using signatures contract
  const signer = user.provider.getSigner();

  const contract = new ethers.Contract(address,abi,signer)
  let msgHash_client = await contract.getMessageHash(user.address,msg,(timestamp+(60*60)))
  const signable_msg = ethers.utils.arrayify(msgHash_client)

  const signature = await signer.signMessage(signable_msg)
  console.log(signature)

  const verify = await contract.verify(
    user.address,
    msg,
    timestamp+(60*60),
    signature
  )
  console.log(verify)

    if(data.client.address === user.address){
      console.log("You are the client")
    }else{
      const obj = {
        freelancer:{
          address : user.address,
          signature : signature,
          signatureTimestamp : timestamp+(60*60)
        }
      }
      try{
        await fetch(`/api/contracts/${id}`,{
        method:'PUT',
        headers : {
          "Content-Type" : "application/json"
        },
        body : JSON.stringify(obj)
        })
        console.log("successfully signed")
      }catch(err){
      console.log(err)
      } 
    }
  
}


const handleChange = e => {
  setOtherParty(e.target.value)
}
console.log(user)
// check the user exist or not if not create it.
const checkUser = async(userAddress) =>{
  // fetch the user data form database
  console.log("User Address :",userAddress)
        try{
            let value = await fetch(`/api/?address=${userAddress}`,{
              method:'GET',
              headers : {
                "Content-Type" : "application/json"
              }
            })
          value = await value.json()
          console.log("value : ",value)
          if(value.data.length === 0){
            console.log("account doesn't exist")
            // create a new account for the user
            let obj = {
              "address" : userAddress
            }
            try{
              await fetch(`/api/`,{
                method:'POST',
                headers : {
                  "Content-Type" : "application/json"
                },
                body:JSON.stringify(obj)
              })
            }catch(err){
              console.log(err)
            }
          }else{
            console.log("account exist")
          }
        }catch(err){
          console.log(err)
        }
}
  if(user.address === null){
    return(
      <>
      <Head>
        <title>Layers Protocol</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    <nav className="navbar navbar-expand-lg navbar-light bg-dark d-flex flex-row-reverse">
        <button className='btn btn-primary' onClick={initWallet}>Connect</button>
    </nav>
    <div className='container'>
      <div className='row justify-content-md-center'>
      <h2>Connect your wallet</h2>
      </div>
    </div>

    </>
    )
  }else{
    return(
      <>
      <Head>
        <title>Layers Protocol</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className="navbar navbar-expand-lg navbar-light bg-dark d-flex flex-row-reverse">
          <button className='btn btn-danger' onClick={disconnect}>Disconnect</button>
      </nav>
      <h4> The address is : {user.address}</h4>  
      <h6>Balance : {user.balance}</h6>
            <div className="container">
                <div className="row justify-content-md-center">
                    <div className='col col-lg-2'>
                        <input className="form-control" type="text" placeholder="Wallet Address of other party"
                            onChange={handleChange}
                        />
                    </div>

                    <div className='col col-lg-2'>
                        <button className='btn btn-primary' onClick={signAndSend}>Sign & Send</button>
                    </div>
                    <table className='table bg-light'>
                      <thead>
                        <tr>
                          <th scope='col'>client</th>
                          <th scope='col'>Freelancer</th>
                          <th scope='col'>Status</th>
                        </tr>
                      </thead>
                        <tbody>
                          {user.data.map((data) =>
                            <tr key={Object.keys(data)[0]}>
                            <td>{Object.values(data)[0].address}</td>
                            <td>{Object.values(data)[1].address}</td>
                            <td>{Object.values(data)[4]}</td>
                            <td>
                            <button className='btn btn-danger' onClick={()=>ApproveAndSign(Object.values(data)[2])}>Approve</button>
                            <button className='btn btn-warning' onClick={()=>CreateContract(Object.values(data)[2])}>Create</button>
                            </td>
                          </tr>
                          )
                          }
                        </tbody>
                    </table>
                </div>
                </div>
      <br/>      
      </>
      )
  }
  
}
