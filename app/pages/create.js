// import 'react' from "react";
import { useState,useEffect } from 'react';
import {Web3Auth} from "@web3auth/modal";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { LOGIN_MODAL_EVENTS } from "@web3auth/ui";
import { useRouter} from 'next/router';
import { ethers } from "ethers";
import 'bootstrap/dist/css/bootstrap.min.css';
import {abi} from "../../artifacts/contracts/Escrow.sol/Escrow.json";
const url ='https://polygon-mumbai.infura.io/v3/a2d512999ccc4e8fa4c183b6d1d6ad9a'
const address = "0xBe01d58293950b747381EFE5973ACc126231e8BD ";
function CreateContract() {
    // check that web3Auth is available here after connection on front page
    const router = useRouter()
    let[web3auth,setWeb3Auth] = useState(null)
  // let[address,setAddress] = useState('');
  const [provider, setProvider] = useState(null)
  const [contract,setContract] = useState(null)
  // const [account,setAccount] = useState(null);
  const [userAddress, setUserAddress] = useState(null)
  const [otherParty,setOtherParty] = useState('')
  const [data,setData] = useState({})
  const [balance, setBalance] = useState(null);

useEffect(() =>{

    const users = async() =>{

        if (typeof window !== 'undefined') {

            console.log('You are on the browser,You are good to go')

            const web3auth = new Web3Auth({
              clientId: "BI_GwSoSJDmsAS4Wf8nJ54lfFb3al54YeBoNFxyA5z6c2dLyEQ-a-kfV7P4MQtiWCNryg2Zh5IZtiCk3IIkp3JY",
              authMode: 'DAPP',
              sessionTime:20,
              chainConfig: {
                chainNamespace: CHAIN_NAMESPACES.EIP155,
                chainId: "0x13881",
                rpcTarget: url, // This is the mainnet RPC we have added, please pass on your own endpoint while creating an app
              },
            });

            await web3auth.initModal();
            await web3auth.connect();
            const provider = new ethers.providers.Web3Provider(web3auth.provider);
            setProvider(provider)

            const signer = provider.getSigner()
            const address = await signer.getAddress()

            setUserAddress(address)
            
            // fetch the user data form database
            // try{
            //     let value = await fetch(`/api/?address=${address}`,{
            //       method:'GET',
            //       headers : {
            //         "Content-Type" : "application/json"
            //       }
            //     })
            //   value = await value.json()
            //   if(value.data.length === 0){
            //     console.log("account doesn't exist")
            //     // create a new account for the user
            //     let obj = {
            //       "address" : address
            //     }
            //     try{
            //       await fetch(`/api/`,{
            //         method:'POST',
            //         headers : {
            //           "Content-Type" : "application/json"
            //         },
            //         body:JSON.stringify(obj)
            //       })
            //     }catch(err){
            //       console.log(err)
            //     }
            //   }else{
            //     console.log("account exist")
            //   }
            // }catch(err){
            //   console.log(err)
            // }
            } else {
            console.log('You are on the server,Cannot execute')
           }
    }
    users()
},[])

async function signAndSend() {
    console.log("SIgn")
    // timestamp 
    const blockNumber = 1; // number of the block you want to get timestamp of
    const timestamp = new Date().valueOf()
    const msg = "I Agree to terms and conditions";
    // get message hash using signatures contract
    const signer = provider.getSigner()
    const contract = new ethers.Contract(address,abi,signer)
    let msgHash_client = await contract.getMessageHash(address,msg,(timestamp+(60*60)))
    console.log(msgHash_client)
   // signature will be valid for next 1 hour [This can be changed]

}


const handleChange = e => {
    setOtherParty(e.target.value)
  }
console.log(otherParty)
    return(
        <>
            <h4> The address is : {userAddress}</h4>  
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
                </div>
                </div>
        </>
    )
}

export default CreateContract;