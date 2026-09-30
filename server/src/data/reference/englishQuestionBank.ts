import { Question } from '@shared/types';

export const ENGLISH_QUESTIONS: Question[] = [
  // =========================================================================
  // 1. GRAMMAR - SUBJECT-VERB AGREEMENT, TENSES, ARTICLES, PREPOSITIONS
  // =========================================================================
  {
    id: 'ENG-GRAM-001',
    subject: 'English',
    category: 'Grammar',
    topic: 'Subject-verb agreement',
    difficulty: 'easy',
    format: 'free_response',
    question: 'A student wrote the sentence: "She go to school every day." What grammatical error is present, and what is the corrected sentence?',
    expectedAnswer: 'Subject-verb agreement error. Third-person singular subjects (she, he, it) require the verb to end in -s/-es in the simple present tense. Correction: "She goes to school every day."',
    concept: 'third_person_singular_agreement',
    concepts: ['subject_verb_agreement', 'singular_subject', 'simple_present_inflection'],
    misconceptionTags: ['Subject-verb agreement error', 'Third-person singular inflection omission'],
    prompt: 'Identify the error in "She go to school every day." and articulate the grammatical rule for third-person singular subjects.',
    instructions: 'Specify the mismatch between the subject pronoun and the verb form.',
    referenceSolutionSteps: [
      'Identify the subject "She" as third-person singular.',
      'In standard present tense, singular third-person subjects take the verb form with an -s or -es suffix ("goes").',
      'The base form "go" is used for plural subjects (they, we) or first/second person (I, you).',
      'Correct sentence: "She goes to school every day."'
    ],
    commonMisconceptions: ['ENG-THIRD-PERSON-S-OMISSION'],
    conceptId: 'concept-eng-subject-verb',
    isTransferQuestion: false
  },
  {
    id: 'ENG-GRAM-002',
    subject: 'English',
    category: 'Grammar',
    topic: 'Subject-verb agreement',
    difficulty: 'medium',
    format: 'free_response',
    question: 'Correct the error in this sentence and explain why the verb must change: "The list of approved candidates were published yesterday."',
    expectedAnswer: 'The verb should be "was", not "were": "The list of approved candidates was published yesterday." The head subject is the singular noun "list", not the plural noun "candidates" inside the prepositional phrase.',
    concept: 'prepositional_intervening_phrase',
    concepts: ['head_noun_agreement', 'intervening_prepositional_phrase', 'singular_collective'],
    misconceptionTags: ['Intervening prepositional phrase agreement error', 'Proximity agreement misconception'],
    prompt: 'Identify the true head noun of the subject and explain why the verb agrees with "list" rather than "candidates".',
    instructions: 'Isolate the core subject from modifying prepositional phrases.',
    referenceSolutionSteps: [
      'Analyze sentence structure: "The list [of approved candidates] was published."',
      '"of approved candidates" is a prepositional phrase modifying "list".',
      'The grammatical subject is the singular noun "list", which requires singular verb "was".',
      'Agreement with the nearest noun "candidates" is a common proximity error.'
    ],
    commonMisconceptions: ['ENG-PROXIMITY-AGREEMENT-ERROR'],
    conceptId: 'concept-eng-subject-verb',
    isTransferQuestion: false
  },
  {
    id: 'ENG-TENSE-001',
    subject: 'English',
    category: 'Grammar',
    topic: 'Tenses',
    difficulty: 'easy',
    format: 'find_the_bug',
    question: 'A writer composed this paragraph: "Yesterday, Marcus walked into the library. He sits at the quiet desk and studied for three hours." Identify the tense inconsistency and explain how to fix it.',
    expectedAnswer: 'Tense shift error. "sits" is present tense, whereas the rest of the actions occurred in the past ("walked", "studied"). It should be "sat": "He sat at the quiet desk".',
    concept: 'past_tense_consistency',
    concepts: ['tense_consistency', 'simple_past_aspect', 'narrative_time_frame'],
    misconceptionTags: ['Inconsistent narrative tense shift', 'Present/past tense confusion'],
    prompt: 'Point out the inappropriate tense shift within the narrative sequence and provide the corrected form.',
    instructions: 'Ensure all verbs within the sequential past narrative align in past tense.',
    referenceSolutionSteps: [
      'The initial context establishes a completed past event: "Yesterday, Marcus walked...".',
      '"sits" inappropriately switches to simple present tense.',
      '"studied" returns to simple past.',
      'To maintain narrative consistency, "sits" must be changed to the past tense form "sat".'
    ],
    commonMisconceptions: ['ENG-INCONSISTENT-TENSE-SHIFT'],
    conceptId: 'concept-eng-tenses',
    isTransferQuestion: false
  },
  {
    id: 'ENG-ART-001',
    subject: 'English',
    category: 'Grammar',
    topic: 'Articles',
    difficulty: 'easy',
    format: 'free_response',
    question: 'A student wrote: "She waited for a hour at the station." Explain why "a hour" is grammatically incorrect, and state the rule governing "a" vs "an".',
    expectedAnswer: 'It should be "an hour". The choice between "a" and "an" is determined by the SOUND of the following word, not its spelling. Since "hour" begins with a silent \'h\' and a vowel sound (/aʊər/), "an" is required.',
    concept: 'vowel_sound_article_rule',
    concepts: ['phonetic_article_rule', 'indefinite_article', 'silent_consonant'],
    misconceptionTags: ['Spelling-based rather than phonetic article selection', 'Article confusion'],
    prompt: 'Explain why the phonetics of the initial sound dictate using "an" before "hour".',
    instructions: 'Differentiate between letters of the alphabet and phonetic vowel sounds.',
    referenceSolutionSteps: [
      'The rule for indefinite articles: use "an" before vowel SOUNDS, and "a" before consonant SOUNDS.',
      'The letter \'h\' in "hour" is silent, so the word begins phonetically with an open vowel sound.',
      'Therefore, "an hour" is grammatically correct.'
    ],
    commonMisconceptions: ['ENG-ARTICLE-LETTER-VS-SOUND'],
    conceptId: 'concept-eng-articles',
    isTransferQuestion: false
  },
  {
    id: 'ENG-PREP-001',
    subject: 'English',
    category: 'Grammar',
    topic: 'Prepositions',
    difficulty: 'medium',
    format: 'multiple_choice',
    options: [
      'A) in Monday',
      'B) on Monday',
      'C) at Monday',
      'D) by Monday'
    ],
    question: 'Which preposition correctly indicates a specific day of the week in English: "The symposium begins ___ Monday morning"?',
    expectedAnswer: 'B) on Monday',
    concept: 'temporal_prepositions',
    concepts: ['preposition_of_time', 'collocation', 'temporal_markers'],
    misconceptionTags: ['Temporal preposition collocation error'],
    prompt: 'Select the preposition used specifically with days and dates.',
    instructions: 'Recall that "at" is used for specific times, "in" for months/years, and "on" for days/dates.',
    referenceSolutionSteps: [
      'Preposition rule of time: use "at" for precise times (at 3 PM), "in" for longer periods (in July, in 2024), and "on" for days and dates (on Monday, on July 4th).',
      'The correct phrase is "on Monday morning".'
    ],
    commonMisconceptions: ['ENG-PREP-TIME-IN-ON-AT'],
    conceptId: 'concept-eng-prepositions',
    isTransferQuestion: false
  },

  // =========================================================================
  // 2. VOCABULARY - MEANING, SYNONYMS, CONTEXTUAL VOCABULARY
  // =========================================================================
  {
    id: 'ENG-VOC-001',
    subject: 'English',
    category: 'Vocabulary',
    topic: 'Contextual vocabulary',
    difficulty: 'medium',
    format: 'free_response',
    passage: 'The committee was initially skeptical of the proposal, but after reviewing the empirical data, their concerns were mitigated and they unanimously endorsed the trial.',
    question: 'Based on the passage above, what does the word "mitigated" mean? What contextual clues in the sentence reveal its meaning?',
    expectedAnswer: '"Mitigated" means lessened, reduced in severity, or alleviated. Context clues: they were initially skeptical, but after seeing data they "unanimously endorsed" the trial, showing their concerns were diminished.',
    concept: 'contextual_clues_deduction',
    concepts: ['semantic_inference', 'contrast_clues', 'vocabulary_in_context'],
    misconceptionTags: ['Literal vs contextual meaning confusion', 'Opposite contextual inference'],
    prompt: 'Infer the definition of "mitigated" by analyzing the shift from skepticism to unanimous endorsement.',
    instructions: 'Highlight the transition and contrast clues in the sentence.',
    referenceSolutionSteps: [
      'Observe the contrast signaled by "but after reviewing the empirical data".',
      'The initial state was "skeptical", while the end state was "unanimously endorsed".',
      'For the committee to endorse the trial, their concerns must have been softened, lessened, or relieved.',
      '"Mitigated" means made less severe or alleviated.'
    ],
    commonMisconceptions: ['ENG-CONTEXT-INVERSION'],
    conceptId: 'concept-eng-vocabulary',
    isTransferQuestion: false
  },
  {
    id: 'ENG-VOC-002',
    subject: 'English',
    category: 'Vocabulary',
    topic: 'Synonyms',
    difficulty: 'easy',
    format: 'multiple_choice',
    options: [
      'A) Generous',
      'B) Frugal',
      'C) Wasteful',
      'D) Extravagant'
    ],
    question: 'Which word is the closest synonym for "thrifty" (careful not to spend money unnecessarily)?',
    expectedAnswer: 'B) Frugal',
    concept: 'denotative_synonyms',
    concepts: ['synonymy', 'semantic_precision', 'lexical_register'],
    misconceptionTags: ['Antonym/synonym confusion'],
    prompt: 'Identify the synonym that matches the quality of prudent financial spending.',
    instructions: 'Distinguish between words describing saving money versus words describing excessive spending.',
    referenceSolutionSteps: [
      '"Thrifty" describes prudent, economical spending without waste.',
      '"Frugal" carries the exact same meaning: sparing or economical with money or food.',
      '"Wasteful" and "Extravagant" are antonyms.'
    ],
    commonMisconceptions: ['ENG-ANTONYM-AS-SYNONYM'],
    conceptId: 'concept-eng-vocabulary',
    isTransferQuestion: false
  },

  // =========================================================================
  // 3. READING COMPREHENSION - MAIN IDEA, INFERENCE, AUTHOR'S PURPOSE
  // =========================================================================
  {
    id: 'ENG-READ-001',
    subject: 'English',
    category: 'Reading Comprehension',
    topic: 'Main idea',
    difficulty: 'medium',
    format: 'free_response',
    passage: 'While honeybees are famous for their role in producing honey and pollinating crops, wild solitary bees are responsible for pollinating nearly a third of all flowering plants. Unlike honeybees that live in dense colonies, solitary bees nest in soil tunnels or hollow stems, requiring undisturbed habitats to thrive. Urbanization and pesticide use have caused solitary bee populations to decline sharply, threatening both wild biodiversity and agricultural food security.',
    question: 'What is the primary main idea of this passage? A student answered: "Honeybees make honey." Explain why the student’s answer confuses a minor detail with the main idea.',
    expectedAnswer: 'The main idea is that wild solitary bees are vital pollinators whose decline due to urbanization and pesticides threatens ecosystems and agriculture. The mention of honeybees is merely an introductory contrast, not the central thesis.',
    concept: 'main_idea_vs_supporting_detail',
    concepts: ['central_thesis', 'introductory_contrast', 'distinguishing_details'],
    misconceptionTags: ['Detail-as-main-idea misconception', 'Introductory hook confusion'],
    prompt: 'Articulate the overarching thesis of the passage and explain why isolated introductory facts do not represent the main idea.',
    instructions: 'Synthesize the entire paragraph rather than focusing on the opening clause.',
    referenceSolutionSteps: [
      'Notice the opening transition: "While honeybees are famous... wild solitary bees are responsible...".',
      'The entire remainder of the passage discusses solitary bees: their habitat, their importance, and the threats to their survival.',
      'A main idea must encompass the full scope of the text, not a single subordinate clause.'
    ],
    commonMisconceptions: ['ENG-DETAIL-OVER-THESIS'],
    conceptId: 'concept-eng-reading',
    isTransferQuestion: false
  },
  {
    id: 'ENG-READ-002',
    subject: 'English',
    category: 'Reading Comprehension',
    topic: 'Inference',
    difficulty: 'hard',
    format: 'free_response',
    passage: 'The lighthouse keeper noticed the barometer dropping precipitously throughout the afternoon. Without waiting for the radio broadcast, he secured the exterior shutters, hauled the dinghy far above the high-tide line, and verified the backup generator’s fuel tank.',
    question: 'What can be inferred about the weather conditions approaching the lighthouse, and what evidence in the text supports this inference?',
    expectedAnswer: 'A severe storm or hurricane is rapidly approaching. Evidence: The sharp drop in atmospheric pressure (barometer dropping precipitously) and the keeper’s urgent protective preparations (shutters secured, boat hauled high, generator checked).',
    concept: 'textual_inference_evidence',
    concepts: ['inference', 'evidence_grounding', 'implicit_meaning'],
    misconceptionTags: ['Unsubstantiated inference', 'Missing textual grounding'],
    prompt: 'Draw a valid inference regarding what event is imminent based on atmospheric and behavioral clues.',
    instructions: 'Cite specific phrases from the text that substantiate your conclusion.',
    referenceSolutionSteps: [
      'A rapid drop in barometric pressure is a scientific indicator of a low-pressure storm system.',
      'The keeper’s actions (securing storm shutters, moving the boat beyond normal tides, testing generator) all prepare for intense wind, flooding, and power loss.',
      'The text implies a severe storm without needing to state the word "storm" explicitly.'
    ],
    commonMisconceptions: ['ENG-LITERALIST-MISSING-INFERENCE'],
    conceptId: 'concept-eng-reading',
    isTransferQuestion: false
  },

  // =========================================================================
  // 4. WRITING - SENTENCE STRUCTURE, PUNCTUATION, CLARITY
  // =========================================================================
  {
    id: 'ENG-WRIT-001',
    subject: 'English',
    category: 'Writing',
    topic: 'Sentence structure',
    difficulty: 'medium',
    format: 'find_the_bug',
    question: 'Identify the structural error in this sentence and explain how to correct it: "The experiment was successful, the researchers published their findings immediately."',
    expectedAnswer: 'Comma splice error. Two independent clauses ("The experiment was successful" and "the researchers published their findings immediately") are joined with only a comma. Fix with a semicolon, a coordinating conjunction (", and"), or a period.',
    concept: 'comma_splice_and_run_on',
    concepts: ['comma_splice', 'independent_clauses', 'coordination_punctuation'],
    misconceptionTags: ['Comma splice error', 'Run-on sentence misconception'],
    prompt: 'Explain why a comma alone cannot join two complete, independent sentences.',
    instructions: 'Provide at least two grammatically valid ways to separate or coordinate the clauses.',
    referenceSolutionSteps: [
      'Clause 1: "The experiment was successful" (complete subject and predicate).',
      'Clause 2: "the researchers published their findings immediately" (complete subject and predicate).',
      'Joining two independent clauses with only a comma constitutes a comma splice.',
      'Correction 1: "The experiment was successful; the researchers..." (semicolon)',
      'Correction 2: "The experiment was successful, and the researchers..." (comma + coordinating conjunction)',
      'Correction 3: "The experiment was successful. The researchers..." (two sentences)'
    ],
    commonMisconceptions: ['ENG-COMMA-SPLICE-INDEPENDENT-CLAUSES'],
    conceptId: 'concept-eng-writing',
    isTransferQuestion: false
  }
];
