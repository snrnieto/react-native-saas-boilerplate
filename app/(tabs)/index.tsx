import { StyleSheet, Text } from "react-native";

import { View } from "@/components/Themed";
import { SupabaseAuthTest } from "@/src/adapters/supabase/__test-component";

export default function TabOneScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-4">
      {/* <Head>
        <title>Tab One</title>
      </Head>

      <Text className="text-2xl font-bold !text-green-600">Tab One</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" /> 
      <EditScreenInfo path="app/(tabs)/index.tsx" />*/}

      <Text className="text-3xl font-bold !text-red-500 bg-red-300 p-10 rounded-full">
        Welcome to Nativewind!
      </Text>
      <SupabaseAuthTest />
    </View>
  );
}

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  // title: {
  //   fontSize: 20,
  //   fontWeight: 'bold',
  // },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
