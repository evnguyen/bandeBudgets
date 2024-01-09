import { StyleSheet, Text, View } from "react-native";
import { Button } from "@rneui/themed";
import { useStore, useDispatch, useSelector } from "react-redux";
import { useAuth0 } from "react-native-auth0";
import { isLoading } from "../redux/budget/budgetSlice";
import { useState } from "react";

export default function Home(props) {
  const { navigation } = props;
  const store = useStore();
  const dispatch = useDispatch();
  console.log(store.getState());
  const loading = useSelector((state) => state.budget.isLoading);
  const [authorized, SetAuthorized] = useState(false);
  const { authorize } = useAuth0();

  const LoginButton = () => {
    const onPress = async () => {
      try {
        await authorize();
        SetAuthorized(true);
      } catch (e) {
        console.log(e);
      }
    };

    return <Button onPress={onPress} title="Log in" />;
  };

  if (!authorized) {
    return LoginButton();
  }
  return (
    <View style={styles.container}>
      <Text>testest</Text>
      <Button
        onPress={() => {
          // navigation.navigate("details");
          dispatch(isLoading(true));
        }}
      >
        Button
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
