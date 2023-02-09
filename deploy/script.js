const { ethers } = require('hardhat');
// const {ethers} = require('ethers');
// const {abi,bytecode} = require("../artifacts/contracts/Escrow.sol/Escrow.json")
const url ='https://polygon-mumbai.infura.io/v3/a2d512999ccc4e8fa4c183b6d1d6ad9a'

async function main(name,symbol){

    const provider = new ethers.providers.JsonRpcProvider(url)
  
    // const [deployer] = await provider.getSigners()
    // get the contract factory to deploy

    const Escrow = await ethers.getContractFactory('Escrow')
    const escrow = await Escrow.deploy()
    await escrow.deployed()
    
    const EscrowFactory = await ethers.getContractFactory('EscrowFactory')
    const factory = await EscrowFactory.deploy(escrow.address)
    await factory.deployed()
    console.log("deployed contract address : ",escrow.address)
    console.log("deployed contract address : ",factory.address)

    return escrow.address

}

main("B.tech Project NFT V2","VII sem")
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
//   '0x93CF0E514e4D60D0986a13D0cb95A58ec4eA0197' 
//  https://mumbai.polygonscan.com/address/0x93CF0E514e4D60D0986a13D0cb95A58ec4eA0197