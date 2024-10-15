import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useWallet } from "@manahippo/aptos-wallet-adapter";
import { AptosClient, TokenClient } from "aptos";

const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");
const tokenClient = new TokenClient(client);

const HomeScreen = ({ navigation }) => {
  const [nfts, setNfts] = useState([]);
  const { account, signAndSubmitTransaction } = useWallet();

  useEffect(() => {
    if (account) {
      fetchNFTs();
    }
  }, [account]);

  const fetchNFTs = async () => {
    try {
      const resources = await client.getAccountResources(account.address);
      const collectionResource = resources.find(
        (r) => r.type === `${account.address}::marketplace::MarketplaceData`
      );

      if (collectionResource) {
        const listings = collectionResource.data.listings;
        const nftData = await Promise.all(
          Object.entries(listings).map(async ([tokenId, listing]) => {
            const tokenData = await tokenClient.getTokenData(tokenId);
            return {
              id: tokenId,
              name: tokenData.name,
              image: tokenData.uri,
              price: listing.price,
            };
          })
        );
        setNfts(nftData);
      }
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      Alert.alert("Error", "Failed to fetch NFTs. Please try again.");
    }
  };

  const mintNFT = async () => {
    try {
      const payload = {
        type: "entry_function_payload",
        function: `${account.address}::marketplace::mint_nft`,
        type_arguments: [],
        arguments: [
          "New NFT",
          "A description of the new NFT",
          "https://example.com/nft.jpg",
        ],
      };
      await signAndSubmitTransaction(payload);
      Alert.alert("Success", "NFT minted successfully!");
      fetchNFTs();
    } catch (error) {
      console.error("Error minting NFT:", error);
      Alert.alert("Error", "Failed to mint NFT. Please try again.");
    }
  };

  const renderNFTItem = ({ item }) => (
    <TouchableOpacity
      style={styles.nftItem}
      onPress={() => navigation.navigate("NFTDetails", { nft: item })}
    >
      <Image source={{ uri: item.image }} style={styles.nftImage} />
      <Text style={styles.nftName}>{item.name}</Text>
      <Text style={styles.nftPrice}>{item.price} APT</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NFT Marketplace</Text>
      <TouchableOpacity style={styles.mintButton} onPress={mintNFT}>
        <Text style={styles.mintButtonText}>Mint New NFT</Text>
      </TouchableOpacity>
      <FlatList
        data={nfts}
        renderItem={renderNFTItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  nftItem: {
    flex: 1,
    margin: 5,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  nftImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
  nftName: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  nftPrice: {
    fontSize: 14,
    color: "#666",
  },
  mintButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  mintButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HomeScreen;
