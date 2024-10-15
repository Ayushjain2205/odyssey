import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useWallet, WalletReadyState } from "@manahippo/aptos-wallet-adapter";

const Login = ({ navigation }) => {
  const { connect, account, wallets } = useWallet();

  useEffect(() => {
    if (account) {
      navigation.replace("Home");
    }
  }, [account, navigation]);

  const handleConnect = async (wallet) => {
    try {
      await connect(wallet.adapter.name);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      Alert.alert("Error", "Failed to connect wallet. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect your Aptos Wallet</Text>
      {wallets.map((wallet) => (
        <TouchableOpacity
          key={wallet.adapter.name}
          style={styles.walletButton}
          onPress={() => handleConnect(wallet)}
          disabled={wallet.readyState !== WalletReadyState.Installed}
        >
          <Text style={styles.walletButtonText}>
            {wallet.adapter.name}{" "}
            {wallet.readyState !== WalletReadyState.Installed &&
              "(Not Installed)"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  walletButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  walletButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Login;
