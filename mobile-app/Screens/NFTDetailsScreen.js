import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useWallet } from "@manahippo/aptos-wallet-adapter";
import { AptosClient } from "aptos";

const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");

const NFTDetailsScreen = ({ route, navigation }) => {
  const { nft } = route.params;
  const { account, signAndSubmitTransaction } = useWallet();

  const listNFT = async () => {
    try {
      const payload = {
        type: "entry_function_payload",
        function: `${account.address}::marketplace::list_nft`,
        type_arguments: [],
        arguments: [nft.id, nft.price],
      };
      await signAndSubmitTransaction(payload);
      Alert.alert("Success", "NFT listed successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error listing NFT:", error);
      Alert.alert("Error", "Failed to list NFT. Please try again.");
    }
  };

  const buyNFT = async () => {
    try {
      const payload = {
        type: "entry_function_payload",
        function: `${account.address}::marketplace::buy_nft`,
        type_arguments: [],
        arguments: [nft.id],
      };
      await signAndSubmitTransaction(payload);
      Alert.alert("Success", "NFT purchased successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error buying NFT:", error);
      Alert.alert("Error", "Failed to buy NFT. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: nft.image }} style={styles.nftImage} />
      <Text style={styles.nftName}>{nft.name}</Text>
      <Text style={styles.nftPrice}>{nft.price} APT</Text>
      <TouchableOpacity style={styles.actionButton} onPress={listNFT}>
        <Text style={styles.actionButtonText}>List NFT</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={buyNFT}>
        <Text style={styles.actionButtonText}>Buy NFT</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  nftImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  nftName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  nftPrice: {
    fontSize: 18,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default NFTDetailsScreen;
