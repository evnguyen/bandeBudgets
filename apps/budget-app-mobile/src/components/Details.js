import { StyleSheet, Text, View } from "react-native";
import { Button } from "@rneui/themed";

export default function Details(props) {
  const { navigation } = props;
  return (
    <View style={styles.container}>
      <Text>Details</Text>
      <Button
        onPress={() => {
          navigation.navigate("home");
        }}
      >
        Button2
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
