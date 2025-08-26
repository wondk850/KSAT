import { QuestionType } from './types';

export const QUESTION_TYPES: QuestionType[] = [
  QuestionType.MainIdea,
  QuestionType.Comprehension,
  QuestionType.FillInTheBlank,
  QuestionType.Grammar,
  QuestionType.Vocabulary,
  QuestionType.SentenceInsertion,
  QuestionType.ReorderParagraph,
  QuestionType.SummaryCompletion,
  QuestionType.WordScramble,
];

export const DEMO_TEXT = `Cognitive biases are systematic patterns of deviation from norm or rationality in judgment. They are often studied in psychology and behavioral economics. Although the reality of most of these biases is confirmed by replicable research, there are often controversies about how to classify them or how to explain them. Some are effects of information-processing rules (i.e., mental shortcuts), called heuristics, that the brain uses to produce decisions or judgments. Such effects are called cognitive biases. Biases have a variety of forms and appear as cognitive "cold" bias, such as confirmation bias, or "hot" motivational or emotional bias, such as the tendency for people under stress to be more likely to believe threatening information. Both effects can lead to perceptual distortion, inaccurate judgment, illogical interpretation, or what is broadly called irrationality.`;