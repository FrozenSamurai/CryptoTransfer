/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import './global';

import React from 'react';
// import type {PropsWithChildren} from 'react';
const Web3 = require('web3');
import {
  Button,
  SafeAreaView,
  Text,
  // StyleSheet,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const [trxn, setTrxn] = React.useState('');
  const [reciever, setReciever] = React.useState('');

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  async function Main(recieverAdd, value) {
    // Configuring the connection to an Ethereum node
    const network = 'sepolia';
    const web3 = new Web3(
      new Web3.providers.HttpProvider(
        'https://sepolia.infura.io/v3/4c37afbbaa224d3fa8e4bb42c3116706',
      ),
    );
    // Creating a signing account from a private key
    const signer = web3.eth.accounts.privateKeyToAccount(
      'd2f2930cddbba23cb8af0bbcef675126226e12c2b3314730d06b2d0c93626ec1',
    );
    web3.eth.accounts.wallet.add(signer);
    console.log('Sending to ' + recieverAdd + ' ' + value + ' ETH');
    // Estimatic the gas limit
    var limit = await web3.eth.estimateGas({
      from: signer.address,
      to: recieverAdd,
      value: web3.utils.toWei(value),
    });
    // .then(console.log);

    // Creating the transaction object
    const tx = {
      from: signer.address,
      to: recieverAdd,
      value: web3.utils.numberToHex(web3.utils.toWei(value, 'ether')),
      gas: web3.utils.toHex(limit),
      nonce: await web3.eth.getTransactionCount(signer.address),
      maxPriorityFeePerGas: web3.utils.toHex(web3.utils.toWei('2', 'gwei')),
      chainId: 11155111,
      // chain: 'sepolia',
      type: 0x2,
    };

    console.log(signer.privateKey);

    const signedTx = await web3.eth.accounts.signTransaction(
      tx,
      signer.privateKey,
    );
    console.log('Raw transaction data: ' + signedTx.rawTransaction);

    // Sending the transaction to the network
    try {
      // const receipt = await web3.eth
      //   .sendSignedTransaction(signedTx.rawTransaction ?? '')
      //   .once('transactionHash', txhash => {
      //     console.log(`Mining transaction ...`);
      //     console.log(`https://${network}.etherscan.io/tx/${txhash}`);
      //   });
      // The transaction is now on chain!
      fetch('https://sepolia.infura.io/v3/4c37afbbaa224d3fa8e4bb42c3116706', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_sendRawTransaction',
          params: [signedTx.rawTransaction],
          id: 1,
        }),
      })
        .then(response => response.json())
        .then(data => {
          console.log('Success:', data);
        })
        .catch(error => {
          console.error('Error:', error);
        });

      // console.log(`Mined in block ${receipt.blockNumber}`);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <SafeAreaView
      style={{
        ...backgroundStyle,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 50,
        height: '100%',
      }}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 10,
          gap: 10,
        }}>
        <Text>Enter the value of the transaction :</Text>
        <TextInput
          editable
          keyboardType="numeric"
          onChangeText={e => {
            console.log('onChangeText');
            setTrxn(e);
          }}
          value={trxn}
          style={{
            padding: 10,
            width: '30%',
            borderColor: 'gray',
            borderWidth: 1,
          }}
        />
      </View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '80%',
        }}>
        <Text>Enter the reciever's address :</Text>
        <TextInput
          editable
          keyboardType="default"
          onChangeText={e => {
            console.log('onChangeText');
            setReciever(e);
          }}
          value={reciever}
          style={{
            padding: 10,
            width: '100%',
            borderColor: 'gray',
            borderWidth: 1,
            margin: 10,
          }}
        />
      </View>
      <View
        style={{
          width: '50%',
        }}>
        <Button
          onPress={() => {
            Main(reciever, trxn);
            console.log('onPress');
          }}
          title="Submit"
          color="#841584"
        />
      </View>
    </SafeAreaView>
  );
}

// const styles = StyleSheet.create({
//   sectionContainer: {
//     marginTop: 32,
//     paddingHorizontal: 24,
//   },
//   sectionTitle: {
//     fontSize: 24,
//     fontWeight: '600',
//   },
//   sectionDescription: {
//     marginTop: 8,
//     fontSize: 18,
//     fontWeight: '400',
//   },
//   highlight: {
//     fontWeight: '700',
//   },
// });

export default App;
