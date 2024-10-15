import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { WalletProvider } from "@manahippo/aptos-wallet-adapter";

import LoginScreen from "./Screens/Login";
import HomeScreen from "./Screens/HomeScreen";
import ARmodeScreen from "./Screens/ARmodeScreen";
import NFTDetailsScreen from "./Screens/NFTDetailsScreen";

const Stack = createStackNavigator();

const App = () => {
  return (
    <WalletProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ARmode" component={ARmodeScreen} />
          <Stack.Screen name="NFTDetails" component={NFTDetailsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </WalletProvider>
  );
};

export default App;
