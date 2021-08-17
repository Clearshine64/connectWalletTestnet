import React, { useEffect, useState } from 'react';
import styled from 'styled-components'
import './App.css';
import { ChakraProvider, useDisclosure } from '@chakra-ui/react'
import Layout from './components/Layout';
import ConnectButton from './components/ConnectButton';
import AccountModal from './components/AccountModal';
import { contractAddress } from './config/address';
import Web3 from "web3";
import { useEthers } from "@usedapp/core/";

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
const Table = styled.table`
  border-collapse: collapse;
  margin: 25px;
  font-size: 1.0em;
  font-family: sans-serif;
  min-width: 400px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  color: #009879;
  font-family: cursive;
  text-align: center;
  word-break: break-word;
`

const ContractABI = require('./config/abi.json');

function App() {

  const [walletOfOwner, setWalletOfOwner] = useState([]);
  const defaultTokenURI :any = [];
  const [tokenURI] = useState(defaultTokenURI);
  const [byAmount, setByAmount] = useState<any |null>(0);
 
  const { account } = useEthers();
  
  const web3 = new Web3(
    "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
  );
  
  const BACContract = new web3.eth.Contract(ContractABI, contractAddress);
  const getOwner = async () => {
    const owner = await BACContract.methods.owner().call();
    return owner
  }
  
  const getMint = async (byAmount:any) => {
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

  const getEachTokenURI = async (tokenId: string) => {
    const result = await BACContract.methods.tokenURI(Number(tokenId)).call();
    return result
  }

  useEffect(() => {
    getOwner().then((owner) => {
      BACContract.methods.walletOfOwner(owner).call().then((result: any) => {
        account ? setWalletOfOwner(result) : setWalletOfOwner([]);
        result.map((tokenId:string) => (
          getEachTokenURI(tokenId).then((res) => {
            defaultTokenURI.push(res);
          })
        ))
      });
    })
  });
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
        <Table className="styled-table">
          <thead>
            <tr>
              <th>WalletOfOwner</th>
              <th>TokenURI</th>
            </tr>
          </thead>
          <tbody>
            {
              walletOfOwner.map((value, index) => (
                <tr>
                  <td>{value}</td>
                  <td>{tokenURI[index]}</td>
                </tr>
              ))
            }
          </tbody>
        </Table>
        <Label>
          <Input type="number" name="number" min="0" max="20" onChange={(e)=>setByAmount(e.target.value)} placeholder="num" value={byAmount}/>
          <Button onClick={handleChange}>MINT</Button>
        </Label>
      </Layout>
    </ChakraProvider>
  );
}

export default App;
