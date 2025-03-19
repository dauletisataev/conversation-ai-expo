import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepIndicator: {
    width: 30,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 2,
  },
  activeStep: {
    backgroundColor: "#4ADE80",
  },
  inactiveStep: {
    backgroundColor: "#475569",
  },
  skipText: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#E2E8F0",
  },
  categoryLabel: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 1,
  },
  quizCard: {
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  questionText: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#94A3B8",
    marginBottom: 16,
  },
  contentText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 24,
    color: "white",
    marginBottom: 24,
  },
  highlightedWord: {
    color: "#F87171",
  },
  feedbackContainer: {
    marginBottom: 24,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  userIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#475569",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  userText: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    color: "#94A3B8",
  },
  correctFeedback: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4ADE80",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  correctText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 18,
    color: "#4ADE80",
  },
  explanationText: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#94A3B8",
    lineHeight: 24,
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionsGrid: {
    marginTop: 8,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  option: {
    flex: 1,
    backgroundColor: "#334155",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  emptyOption: {
    flex: 1,
    marginHorizontal: 4,
  },
  optionItem: {
    minHeight: 56,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: "relative",
  },
  selectedOption: {
    flex: 1,
    backgroundColor: "#4ADE80",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  correctOption: {
    flex: 1,
    backgroundColor: "#4ADE80",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  incorrectOption: {
    flex: 1,
    backgroundColor: "#EF4444",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  optionText: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    color: "white",
    textAlign: "center",
  },
  selectedOptionText: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    color: "#0F172A",
    textAlign: "center",
  },
  actionButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginBottom: 20,
  },
  enabledButton: {
    backgroundColor: "#4ADE80",
  },
  disabledButton: {
    backgroundColor: "#334155",
  },
  actionButtonText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: "#0F172A",
  },
  bottomText: {
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  instructionContainer: {
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 20,
  },
  instructionText: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#94A3B8",
  },
  tryAgainText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: "#EF4444",
    marginBottom: 16,
  },
  optionCheckIconContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4ADE80",
    alignItems: "center",
    justifyContent: "center",
  },

  // Microphone button styles
  microphoneContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  microphoneButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  recordingButton: {
    backgroundColor: "#DC2626",
  },
  correctButton: {
    backgroundColor: "#15803D",
  },
  incorrectButton: {
    backgroundColor: "#B91C1C",
  },
  microphoneText: {
    marginTop: 10,
    color: "#94A3B8",
    fontFamily: "Inter-Medium",
    fontSize: 14,
  },

  // Transcription result styles
  transcriptionContainer: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#0F172A",
    marginBottom: 20,
  },
  transcriptionLabel: {
    color: "#94A3B8",
    fontFamily: "Inter-Medium",
    fontSize: 14,
    marginBottom: 4,
  },
  transcriptionText: {
    color: "#F1F5F9",
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    marginBottom: 12,
  },
  transcriptionNormalizedText: {
    color: "#94A3B8",
    fontFamily: "Inter-Regular",
    fontSize: 13,
    marginTop: -8,
    marginBottom: 12,
    fontStyle: "italic",
  },
  processingText: {
    color: "#94A3B8",
    fontFamily: "Inter-Medium",
    fontSize: 14,
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "#B91C1C20",
    borderColor: "#B91C1C",
    borderWidth: 1,
  },
  errorText: {
    color: "#B91C1C",
    fontFamily: "Inter-Medium",
    fontSize: 14,
    textAlign: "center",
  },

  // Retry button styles
  retryButton: {
    backgroundColor: "#334155",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: "flex-end",
    marginBottom: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontFamily: "Inter-Medium",
    fontSize: 14,
  },

  // Pronunciation playback styles
  pronunciationPlaybackContainer: {
    width: "100%",
    backgroundColor: "#0F172A",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  pronunciationPlaybackTitle: {
    color: "#94A3B8",
    fontFamily: "Inter-Medium",
    fontSize: 14,
    marginBottom: 12,
  },
  playButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonText: {
    color: "#FFFFFF",
    fontFamily: "Inter-Medium",
    fontSize: 16,
    marginLeft: 8,
  },

  // Audio playback styles
  audioPlaybackWrapper: {
    marginVertical: 10,
  },
  audioPlaybackButton: {
    backgroundColor: "#3E4758",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  audioPlaybackText: {
    color: "#FFFFFF",
    fontFamily: "Inter-Medium",
    fontSize: 14,
    marginRight: 8,
  },
  audioPlaybackIcon: {
    marginLeft: 4,
  },
  audioPlaybackContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
    gap: 10,
  },
});
