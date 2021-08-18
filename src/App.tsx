import React, { useEffect, useState } from 'react';
import styled from 'styled-components'
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import { ChakraProvider, useDisclosure } from '@chakra-ui/react'
import Layout from './components/Layout';
import ConnectButton from './components/ConnectButton';
import AccountModal from './components/AccountModal';
import { contractAddress } from './config/address';
import Web3 from "web3";
import { useEthers} from "@usedapp/core/";
import { Promise } from 'bluebird';

declare const window: Window &
   typeof globalThis & {
     web3: any,
     ethereum: any
   }

const Input = styled.input`
  margin: 5px;
  border: 1px solid #f2a202;
  height: 27px;
  border-radius: 10px;
  padding: 5px;
  margin-right: 10px;
`
const Button = styled.button`
  color: wheat;
  border: 1px solid;
  font-size: 15px;
  padding-left: 2px;
  padding-right: 2px;
  border-radius: 5px;
  &:hover {
    color: white;
    border: 1px solid white;
  }
`
const Label = styled.div`
  margin: 5px;
`


const ContractABI = require('./config/abi.json');

function App() {

  
  const [tokenURI, setTokenURI] = useState([]);
  const [byAmount, setByAmount] = useState<any |null>(0);
 
  const { account } = useEthers();
  
 

  const getMint = async (byAmount:any) => {
    const web3 = new Web3(
      "https://rinkeby.infura.io/v3/9bbe3db4091e4df8a7a01d24c8724c60"
    );
    
    window.web3 = new Web3(window.ethereum);
    const BACContract = new window.web3.eth.Contract(
      ContractABI, contractAddress
    );
    if(account){
      const value = web3.utils.toWei(
        (byAmount * 0.01).toString(),
        "ether"
      );
      await BACContract.methods.mint(byAmount).send({from: account, value: value});
    }
  }
  useEffect(() => {
    const web3 = new Web3(
      "https://rinkeby.infura.io/v3/9bbe3db4091e4df8a7a01d24c8724c60"
    );
    const BACContract = new web3.eth.Contract(ContractABI, contractAddress);
    let defaultTokenURI:any = [];
    if(account) {
      BACContract.methods.walletOfOwner(account).call().then((result: any) => {
        Promise.map(result, async (tokenId:any) => {
          let res = null;
          try {
            res = await BACContract.methods.tokenURI(Number(tokenId)).call();
          } catch (err) {
            console.log("web3 error:", err)
          }
          if(res) {
            let response = null;
            try {
              response = await fetch(res);
            } catch (err) {
              console.log("fetch error: ", err)
            }
            if(response) {
              try {
                let resJson = await response.json();
                defaultTokenURI.push(resJson.image);
              } catch (err) {
                console.log("json error: ", err);
                defaultTokenURI.push('notoken');
              }
            }
          }
        }).then(() => {
          setTokenURI(defaultTokenURI);
        });
      });
    } else {
      setTokenURI([]);
    }
  },[account]);

  const handleChange = () => {
    if(byAmount > 20) {
      alert('max is 20');
      setByAmount(20);
    } else 
      getMint(byAmount);
  }
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <ChakraProvider>
      <Layout>
        <ConnectButton handleOpenModal={onOpen} />
        <AccountModal isOpen={isOpen} onClose={onClose} />
        <div className="container-fluid">
          <div className="row" style={{
            justifyContent: tokenURI.length < 7 ? 'center' : ''
            }}>
          {tokenURI.map((value, index) => {
            if(value !== 'notoken') {
              return (
                <div className="img col-md-2" key={index} style={{marginTop:'10px',display: 'flex',justifyContent: 'center'}}>
                  <img className="image" src={value} alt="img" height={120} width={120} style={{borderRadius:'8px'}}/>
                </div>
              )
            } else {
              return (
                <div className="img col-md-2" key={index} style={{marginTop:'10px',display: 'flex',justifyContent: 'center'}}>
                  <div className="image" style={{height:'120px', width:'120px', borderRadius:'8px', backgroundColor:'wheat', textAlign:'center'}}><p style={{paddingTop:'50px', fontFamily:'cursive'}}>no image</p></div>
                </div>
              )
            }
          })}
          </div>
        </div>
        <Label>
          <Input type="number" name="number" min="0" max="20" onChange={(e)=>setByAmount(e.target.value)} placeholder="num" value={byAmount}/>
          <Button onClick={handleChange}>MINT</Button>
        </Label>
      </Layout>
    </ChakraProvider>
  );
}

export default App;
