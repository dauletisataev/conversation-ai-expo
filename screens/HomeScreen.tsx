import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  Flame,
  Mic,
  BarChart2,
  Calendar,
  User,
  MessageSquare,
  Radio,
} from "lucide-react-native";

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const [fontsLoaded] = useFonts({
    "Inter-Regular": Inter_400Regular,
    "Inter-Bold": Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#0F172A", "#1E293B"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Text style={styles.planTitle}>Your Today's Plan</Text>
        <View style={styles.streakContainer}>
          <Flame color="#FFA500" size={24} />
          <Text style={styles.streakText}>0</Text>
        </View>
      </View>

      <View style={styles.timelineContainer}>
        {/* Timeline line that runs through the entire container */}
        <View style={styles.timelineTrack}>
          <View style={styles.continuousLine} />
        </View>

        {/* Profile and message */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: "https://randomuser.me/api/portraits/women/44.jpg",
                }}
                style={styles.avatar}
              />
            </View>
          </View>
          <View style={styles.messageContainer}>
            <Text style={styles.message}>
              Night, Dolet!{"\n"}
              Choose a feature to start your language journey!
            </Text>
          </View>
        </View>

        {/* Quiz button */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineLeft}></View>
          <TouchableOpacity
            style={styles.featureButton}
            onPress={() => navigation.navigate("Quiz")}
          >
            <Text style={styles.featureButtonText}>Start quiz</Text>
          </TouchableOpacity>
        </View>

        {/* Speaking practice section */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <View style={styles.speakingIconContainer}>
              <Mic color="#E2E8F0" size={20} />
            </View>
          </View>
          <Text style={styles.speakingText}>
            Practice your speaking skills with AI tutor
          </Text>
        </View>

        {/* Speaking Zone card */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineLeft}></View>
          <TouchableOpacity
            style={styles.speakingZoneCard}
            onPress={() => navigation.navigate("ChitChat")}
          >
            <View style={styles.cardContent}>
              <Image
                source={{
                  uri: "https://randomuser.me/api/portraits/women/68.jpg",
                }}
                style={styles.cardAvatar}
              />
              <View style={styles.cardTextContent}>
                <Text style={styles.cardTitle}>Speaking Zone</Text>
                <Text style={styles.cardSubtitle}>Practice with Stacy</Text>
              </View>
              <View style={styles.cardIcon}>
                <Mic color="#FFFFFF" size={20} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Conversation Practice section */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <View style={styles.conversationIconContainer}>
              <MessageSquare color="#E2E8F0" size={20} />
            </View>
          </View>
          <Text style={styles.speakingText}>
            Practice real-life conversation scenarios
          </Text>
        </View>

        {/* Conversation Practice card */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineLeft}></View>
          <TouchableOpacity
            style={styles.speakingZoneCard}
            onPress={() => navigation.navigate("ConversationSituations")}
          >
            <View style={styles.cardContent}>
              <Image
                source={{
                  uri: "https://randomuser.me/api/portraits/men/32.jpg",
                }}
                style={styles.cardAvatar}
              />
              <View style={styles.cardTextContent}>
                <Text style={styles.cardTitle}>Conversation Practice</Text>
                <Text style={styles.cardSubtitle}>Real-life scenarios</Text>
              </View>
              <View style={styles.cardIcon}>
                <MessageSquare color="#FFFFFF" size={20} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Podcast Mode section */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <View style={styles.podcastIconContainer}>
              <Radio color="#E2E8F0" size={20} />
            </View>
          </View>
          <Text style={styles.speakingText}>
            Practice by joining a podcast with famous personalities
          </Text>
        </View>

        {/* Podcast Mode card */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineLeft}></View>
          <TouchableOpacity
            style={styles.speakingZoneCard}
            onPress={() => navigation.navigate("Podcast")}
          >
            <View style={styles.cardContent}>
              <Image
                source={{
                  uri: "https://randomuser.me/api/portraits/men/65.jpg",
                }}
                style={styles.cardAvatar}
              />
              <View style={styles.cardTextContent}>
                <Text style={styles.cardTitle}>Podcast Mode</Text>
                <Text style={styles.cardSubtitle}>
                  Talk with industry leaders
                </Text>
              </View>
              <View style={styles.cardIcon}>
                <Radio color="#FFFFFF" size={20} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIconActive}>
            <Mic color="#4B9EF9" size={24} />
          </View>
          <Text style={styles.navTextActive}>Practice</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <BarChart2 color="#94A3B8" size={24} />
          <Text style={styles.navText}>Progress</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Calendar color="#94A3B8" size={24} />
          <Text style={styles.navText}>Meetings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <User color="#94A3B8" size={24} />
          <Text style={styles.navText}>Account</Text>
        </TouchableOpacity>
      </View>

      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  planTitle: {
    fontFamily: "Inter-Bold",
    fontSize: 24,
    color: "white",
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 165, 0, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  streakText: {
    fontFamily: "Inter-Bold",
    fontSize: 18,
    color: "#FFA500",
    marginLeft: 4,
  },
  timelineContainer: {
    flex: 1,
    paddingHorizontal: 24,
    position: "relative",
  },
  timelineTrack: {
    position: "absolute",
    left: 43, // Center of the avatar (24px padding + 20px to center of avatar)
    top: 40, // Start after the avatar
    bottom: 20, // Some spacing at the bottom
    width: 2,
    zIndex: 1,
  },
  continuousLine: {
    width: 2,
    height: "100%",
    backgroundColor: "#2D3748",
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 16,
    position: "relative",
    zIndex: 2,
  },
  timelineLeft: {
    width: 40,
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#64748B",
  },
  messageContainer: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    flex: 1,
    marginLeft: 12,
  },
  message: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "white",
    lineHeight: 24,
  },
  featureButton: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    flex: 1,
    marginLeft: 12,
  },
  featureButtonText: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "#0F172A",
  },
  lockIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
  },
  speakingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4B9EF9",
    alignItems: "center",
    justifyContent: "center",
  },
  lockIconText: {
    fontSize: 20,
  },
  speakingText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#E2E8F0",
    marginLeft: 12,
    alignSelf: "center",
  },
  lockedText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#94A3B8",
    marginLeft: 12,
    alignSelf: "center",
  },
  speakingZoneCard: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    flex: 1,
    marginLeft: 12,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#64748B",
    marginRight: 12,
  },
  cardTextContent: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "white",
  },
  cardSubtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#94A3B8",
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2D3748",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    width: width / 4,
  },
  navIconActive: {
    backgroundColor: "rgba(75, 158, 249, 0.1)",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  navTextActive: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#4B9EF9",
    marginTop: 4,
  },
  navText: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
  },
  conversationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  podcastIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
  },
});
