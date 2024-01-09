import { Provider } from "react-redux";
import Home from "./src/components";
import { Auth0Provider } from "react-native-auth0";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Details from "./src/components/Details";
import { store } from "./src/redux/store";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Auth0Provider
      domain={"dev-893eqfsg.us.auth0.com"}
      clientId={"Oz2XDBZITzy7vEFd5ytR97cvbK5u7MUK"}
    >
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="home">
            <Stack.Screen name="home" component={Home} />
            <Stack.Screen name="details" component={Details} />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>
    </Auth0Provider>
  );
}
