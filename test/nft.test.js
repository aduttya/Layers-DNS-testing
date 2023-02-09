const {expect} = require('chai');
const { ethers } = require('hardhat');

describe("Testing NFT contract",() =>{

    let nft;

    it("Deployment",async() => {

            const NFT = await ethers.getContractFactory("BtechProejctNFT")

            nft = await NFT.deploy("B.tech Project NFT","VII sem")

    })

    it("minting NFT",async()=>{

            let [signer,addr1] = await ethers.getSigners()
            const user = await signer.getAddress()
            const user1 = await addr1.getAddress()
            await nft.safeMint(user,"first address")
            await nft.safeMint(user1,"first address again")

            console.log(await nft.balanceOf(user))
            console.log(await nft.tokenURI(1))
            console.log(await nft.tokenURI(0))

    })
})