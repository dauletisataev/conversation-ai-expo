import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { ArrowLeft } from "lucide-react-native";
import api, { Situation } from "../utils/api";

type ConversationSituationsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ConversationSituations"
>;

export default function ConversationSituationsScreen() {
  const navigation =
    useNavigation<ConversationSituationsScreenNavigationProp>();
  const [situations, setSituations] = useState<Situation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch situations from the API
  const fetchSituations = async () => {
    try {
      setLoading(true);
      const data = await api.generateSituations();
      setSituations(data);
      setError(null);
    } catch (err) {
      setError("Failed to load situations. Please try again.");
      console.error("Error fetching situations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSituations();
  }, []);

  const getLevelColor = (level: Situation["level"]) => {
    switch (level) {
      case "beginner":
        return "#4ADE80";
      case "intermediate":
        return "#FACC15";
      case "advanced":
        return "#F87171";
      default:
        return "#94A3B8";
    }
  };

  const renderSituationItem = ({ item }: { item: Situation }) => (
    <TouchableOpacity
      style={styles.situationCard}
      onPress={() =>
        navigation.navigate("ConversationSimulator", { situationId: item.id })
      }
    >
      <View style={styles.cardContent}>
        <Image source={{ uri: item.imageUrl }} style={styles.cardAvatar} />
        <View style={styles.cardTextContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{item.description}</Text>
          <View
            style={[
              styles.levelBadge,
              { backgroundColor: `${getLevelColor(item.level)}20` },
            ]}
          >
            <Text
              style={[styles.levelText, { color: getLevelColor(item.level) }]}
            >
              {item.level.charAt(0).toUpperCase() + item.level.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#0F172A", "#1E293B"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="#E2E8F0" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Conversation Situations</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Choose a situation to practice your English speaking skills
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4B9EF9" />
            <Text style={styles.loadingText}>Loading situations...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchSituations}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={situations}
            keyExtractor={(item) => item.id}
            renderItem={renderSituationItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Inter-Bold",
    fontSize: 18,
    color: "white",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  subtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#94A3B8",
    marginBottom: 24,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#E2E8F0",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  errorText: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#F87171",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#4B9EF9",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: "white",
  },
  listContent: {
    paddingBottom: 24,
  },
  situationCard: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#64748B",
    marginRight: 16,
  },
  cardTextContent: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: "Inter-Bold",
    fontSize: 18,
    color: "white",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 8,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  levelText: {
    fontFamily: "Inter-Bold",
    fontSize: 12,
  },
});
