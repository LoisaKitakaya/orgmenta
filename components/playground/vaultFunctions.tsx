import  { useState } from "react";
import { View, StyleSheet, TextInput, Button, Text } from "react-native";
import { VaultAddSecret, VaultGetSecret } from "../../utils/vault";

// A component to test the supabase db functions implemented using RPC

const InsertComponent = () => {
  const [secretName, setSecretName] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [res, setRes] = useState("");

  const addKeyToVault = async (name: string, secret: string) => {
    const response = await VaultAddSecret(name, secret);
    setRes(response);
  };

  return (
    <View
      style={{
        padding: 10,
        backgroundColor: "green",
        right: 0,
        bottom: 0,
      }}
    >
      <Text style={{ textAlign: "center" }}>Insert Secret - Testing Area</Text>
      <TextInput
        style={styles.input}
        onChangeText={setSecretName}
        value={secretName}
        placeholder="secret name"
        // keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        onChangeText={setSecretKey}
        value={secretKey}
        placeholder="secret key"
        // keyboardType="numeric"
      />
      <Text>{res && `uuid: ${res}`}</Text>
      <Button
        onPress={() => addKeyToVault(secretName, secretKey)}
        title="Insert Secret"
      />
    </View>
  );
};

const GetComponent = () => {
  const [secretName, setSecretName] = useState("");
  const [res, setRes] = useState("");

  const getKeyFromVault = async (secret_name: string) => {
    const response = await VaultGetSecret(secret_name);
    setRes(response);
  };

  return (
    <View
      style={{
        padding: 10,
        backgroundColor: "yellow",
        right: 0,
        bottom: 0,
      }}
    >
      <Text style={{ textAlign: "center" }}>Get Secret - Testing Area</Text>
      <TextInput
        style={styles.input}
        onChangeText={setSecretName}
        value={secretName}
        placeholder="secret name"
        // keyboardType="numeric"
      />
      <Text>{res && `secret: ${res}`}</Text>
      <Button onPress={() => getKeyFromVault(secretName)} title="Get Secret" />
    </View>
  );
};

const VaultFunctions = () => {
  const [operations, setOperations] = useState("insert");
  return (
    <View style={{margin:10, minHeight:300, backgroundColor:'orange'}}>
      <View style={{ flexDirection: "row", gap: 5, backgroundColor:'red',
        margin: 10, }}>
        <Button
          onPress={() => setOperations("insert")}
          title="Insert Secret View"
        />
        <Button onPress={() => setOperations("get")} title="Get Secret View" />
        {/* <Button
          onPress={() => setOperations("delete")}
          title="Delete Secret View"
        /> */}
      </View>

      <View style={{ flexDirection: "row", gap: 5, backgroundColor:'red' }}>
        {operations === "insert" ? <InsertComponent /> : null}
        {operations === "get" ? <GetComponent /> : null}
        {/* {operations === "delete" ? <DeleteComponent /> : null} */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});

export default VaultFunctions;
