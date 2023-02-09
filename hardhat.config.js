require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity : {
    compilers:[
      {
        version:"0.8.0"
      },
      {
        version:"0.7.0"
      },
      {
        version:"0.8.6"
      },
    ]
  },
  networks:{
    mumbai:{
      url:'https://polygon-mumbai.infura.io/v3/a2d512999ccc4e8fa4c183b6d1d6ad9a',
      accounts:['a6b0c53ef59d726db7d93c422ad34c3cfb27ba2da641dddb8db64d1108c58536']
    }
  },
  etherscan:{
    apiKey:{
      polygonMumbai: 'AHPBY8XEIBYK11W5PKNQTAD3QX3UPS2SD7'
  }
}
  
};
