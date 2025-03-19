import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./navigation/types";
import HomeScreen from "./screens/HomeScreen";
import ChitChatScreen from "./screens/ChitChatScreen";
import QuizGameScreen from "./screens/QuizGameScreen";
import ConversationSituationsScreen from "./screens/ConversationSituationsScreen";
import ConversationSimulatorScreen from "./screens/ConversationSimulatorScreen";
import PodcastScreen from "./screens/PodcastScreen";
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({
    "Inter-Regular": Inter_400Regular,
    "Inter-Bold": Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0F172A" },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ChitChat" component={ChitChatScreen} />
        <Stack.Screen name="Quiz" component={QuizGameScreen} />
        <Stack.Screen
          name="ConversationSituations"
          component={ConversationSituationsScreen}
        />
        <Stack.Screen
          name="ConversationSimulator"
          component={ConversationSimulatorScreen}
        />
        <Stack.Screen name="Podcast" component={PodcastScreen} />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
