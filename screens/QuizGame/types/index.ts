import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../navigation/types";

export type QuizGameScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "QuizGame"
>;

export type QuestionType = "synonyms" | "correct-word" | "pronunciation";

export interface Question {
  type: QuestionType;
  question: string;
  content: string;
  highlightedWord: string;
  options: string[];
  correctAnswers: string[];
  explanation: string;
}
