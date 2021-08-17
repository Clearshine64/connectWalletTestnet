import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { DAppProvider, ChainId } from '@usedapp/core';

const config = {
  supportedChains: [ChainId.Rinkeby],
  readOnlyUrls: {
    [ChainId.Rinkeby]: `https://rinkeby.infura.io/v3/ae7e51244f7141848b377da95a776361`,
   },
}


ReactDOM.render(
  <DAppProvider config={ config }>
    <App />
  </DAppProvider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
