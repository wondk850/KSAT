import { QuestionType } from './types';

export const QUESTION_TYPES: QuestionType[] = [
  QuestionType.MainIdea,
  QuestionType.Mood,
  QuestionType.Claim,
  QuestionType.InferentialMeaning,
  QuestionType.Comprehension,
  QuestionType.Grammar,
  QuestionType.Vocabulary,
  QuestionType.PronounReference,
  QuestionType.FillInTheBlank,
  QuestionType.IrrelevantSentence,
  QuestionType.ReorderParagraph,
  QuestionType.SentenceInsertion,
  QuestionType.SummaryCompletion,
  QuestionType.WordScramble,
];

export const DEMO_TEXTS = [
  `Cognitive biases are systematic patterns of deviation from norm or rationality in judgment. They are often studied in psychology and behavioral economics. Although the reality of most of these biases is confirmed by replicable research, there are often controversies about how to classify them or how to explain them. Some are effects of information-processing rules (i.e., mental shortcuts), called heuristics, that the brain uses to produce decisions or judgments. Such effects are called cognitive biases. Biases have a variety of forms and appear as cognitive "cold" bias, such as confirmation bias, or "hot" motivational or emotional bias, such as the tendency for people under stress to be more likely to believe threatening information. Both effects can lead to perceptual distortion, inaccurate judgment, illogical interpretation, or what is broadly called irrationality.`,
  `The gut-brain axis is a bidirectional communication network that links the central nervous system (brain and spinal cord) with the enteric nervous system (the gut's intrinsic nervous system). This connection isn't just about digestion; it significantly influences mood, cognition, and mental health. The gut microbiota, the trillions of microorganisms residing in our intestines, play a crucial role in this communication. They produce neurotransmitters like serotonin and dopamine, which are vital for mood regulation. An imbalance in gut bacteria, known as dysbiosis, has been linked to conditions like anxiety, depression, and even neurodegenerative diseases. Therefore, maintaining a healthy gut through diet and lifestyle could be a key strategy for promoting brain health.`,
  `The concept of "dark matter" arose from a discrepancy between the observed gravitational effects in the universe and the amount of visible matter that could account for them. In the 1930s, astronomer Fritz Zwicky noticed that galaxies in the Coma Cluster were moving much faster than expected based on their visible mass, implying the presence of unseen mass providing extra gravitational pull. This mysterious, non-luminous substance was termed dark matter. It does not emit or reflect any electromagnetic radiation, making it impossible to observe directly with telescopes. Scientists infer its existence through its gravitational influence on stars and galaxies. It's estimated that dark matter constitutes about 27% of the universe's mass-energy content, while ordinary matter makes up less than 5%.`,
];
