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
  Alert,
  Button,
  Keyboard,
  Linking,
  LogBox,
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
  const [ready, setReady] = React.useState(false);

  const [trxn, setTrxn] = React.useState('');
  const [reciever, setReciever] = React.useState('');
  const [status, setStatus] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  async function SendTransaction(recieverAdd, value) {
    // Configuring the connection to an Ethereum node
    //check if valid reciever address
    if (!recieverAdd.startsWith('0x')) {
      setPressed(false);
      Alert.alert('Failure', 'Invalid Reciever Address');
    } else if (parseFloat(value) > 1) {
      setPressed(false);
      Alert.alert(
        'Warning',
        "You can't send more than 1 ETH because of insufficient funds in the account",
        [
          {
            text: 'Contact Raj',
            onPress: () => {
              Linking.openURL('tel:+91-9167126442');
            },
            style: 'cancel',
          },

          {
            text: 'OK',
            onPress: () => {
              setPressed(false);
            },
            style: 'cancel',
          },
        ],
      );
    } else {
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
      var limit = await web3.eth
        .estimateGas({
          from: signer.address,
          to: recieverAdd,
          value: web3.utils.toWei(value),
        })
        .then(async () => {
          console.log('going in for tx');
          console.log('Gas limit: ' + limit);
          // Creating the transaction object
          const tx = {
            from: signer.address,
            to: recieverAdd,
            value: web3.utils.numberToHex(web3.utils.toWei(value, 'ether')),
            gas: web3.utils.toHex(limit),
            nonce: await web3.eth.getTransactionCount(signer.address),
            maxPriorityFeePerGas: web3.utils.toHex(
              web3.utils.toWei('2', 'gwei'),
            ),
            chainId: 11155111,
            gasLimit: web3.utils.toHex(21000),
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
            fetch(
              'https://sepolia.infura.io/v3/4c37afbbaa224d3fa8e4bb42c3116706',
              {
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
              },
            )
              .then(response => response.json())
              .then(data => {
                Alert.alert(
                  'Success',
                  'Please Wait for the transaction to be mined',
                );
                console.log('Success:', data);
                let hash = data.result;
                const id = setInterval(() => {
                  web3.eth.getTransactionReceipt(hash).then(res => {
                    console.log(res);
                    if (res !== null) {
                      Alert.alert(
                        'Success',
                        'Transaction Mined successfully. Please check your wallet in Sepolia Test Network.',
                      );
                      setStatus(true);
                      clearInterval(id);
                    }
                  });
                }, 1000);
              })
              .catch(error => {
                console.error('EError: ', error);
                Alert.alert('Failure: Contact Raj to fix', error.message, [
                  {
                    text: 'Contact Raj',
                    onPress: () => {
                      Linking.openURL('tel:+91-9167126442');
                    },
                    style: 'cancel',
                  },
                ]);
              });

            // console.log(`Mined in block ${receipt.blockNumber}`);
          } catch (error) {
            console.log(error);
            Alert.alert('Failure: Contact Raj to fix', error.message, [
              {
                text: 'Contact Raj',
                onPress: () => {
                  Linking.openURL('tel:+91-9167126442');
                },
                style: 'cancel',
              },
            ]);
          }
        })
        .catch(error => {
          console.log(error);
          setPressed(false);
          setStatus(false);
          if (
            error.message.includes('insufficient funds for gas * price + value')
          ) {
            Alert.alert(
              'Failure: Contact Raj to fix',
              'Error: Insufficient funds for gas * price + value, Please Contact me at +91-9167126442',
              [
                {
                  text: 'Contact Raj',
                  onPress: () => {
                    Linking.openURL('tel:+91-9167126442');
                  },
                  style: 'cancel',
                },
              ],
            );
          } else {
            Alert.alert('Failure: Contact Raj to fix', error.message, [
              {
                text: 'Contact Raj',
                onPress: () => {
                  Linking.openURL('tel:+91-9167126442');
                },
                style: 'cancel',
              },
            ]);
          }

          // Alert.alert('Failure: Contact Raj to fix', error);
        });
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
      {ready ? (
        <>
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 10,
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
                  setPressed(false);
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
            <Text
              style={{
                color: 'red',
              }}>
              Enter amount less than 1 ETH.
            </Text>
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
                setPressed(false);
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
                SendTransaction(reciever, trxn);
                setPressed(true);
                setStatus(false);
                Keyboard.dismiss();
              }}
              title="Submit"
              color="#841584"
            />
          </View>
        </>
      ) : (
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            gap: 15,
          }}>
          <Text
            style={{
              fontSize: 25,
              fontWeight: 'bold',
              color: 'yellow',
            }}>
            Instructions
          </Text>
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}>
            <Text>
              Please switch to{' '}
              <Text
                style={{
                  fontWeight: 'bold',
                  color: 'green',
                }}>
                Sepolia Test Network
              </Text>{' '}
              before initiating.
            </Text>
            <Text>
              Keep the Transfer Amount less than 1 ETH to avoid insufficient
              Funds Error.
            </Text>
            <Text>
              If u face any issues please contact me on{' '}
              <Text
                style={{
                  fontWeight: 'bold',
                  color: 'green',
                }}
                onPress={() => {
                  Linking.openURL('tel:+91-9167126442');
                }}>
                9167126442
              </Text>
            </Text>
            <Text>
              Wait for the transaction to be mined and the status to be
              displayed.
            </Text>
          </View>
          <View
            style={{
              width: '80%',
              marginTop: 20,
            }}>
            <Button
              onPress={() => {
                setReady(true);
                console.log("I'm ready");
              }}
              title="Lets Go..."
              color="#841584"
            />
          </View>
        </View>
      )}

      {pressed && (
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {!status && <Text> Please wait patiently.</Text>}
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
            }}>
            <Text
              style={{
                fontSize: 20,
              }}>
              Transaction Status:{' '}
            </Text>
            {status ? (
              <Text
                style={{
                  color: 'green',
                  fontSize: 20,
                  fontWeight: 'bold',
                }}>
                Completed
              </Text>
            ) : (
              <Text
                style={{
                  color: 'yellow',
                  fontSize: 20,
                  fontWeight: 'bold',
                }}>
                pending
              </Text>
            )}
          </View>
        </View>
      )}
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
