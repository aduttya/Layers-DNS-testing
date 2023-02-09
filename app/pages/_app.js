import '../styles/globals.css';
import { chains, providers } from '@web3modal/ethereum'

import {Web3Modal} from '@web3modal/react';

const config = {
  projectId: '0ee81dbd3aa911fafc82e4688ea899e7',
  theme: 'dark',
  accentColor: 'default',
  ethereum: {
    appName: 'B.tech Project',
    chains:[
      chains.polygonMumbai
    ]
    // providers: [providers.walletConnectProvider({ projectId: '0ee81dbd3aa911fafc82e4688ea899e7'})]

  }
}


function MyApp({ Component, pageProps }) {
  
  return(
  <> <Component {...pageProps} />
  <Web3Modal config={config} />
  </>
  )
}

export default MyApp
