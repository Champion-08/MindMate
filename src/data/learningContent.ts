// Real Multilingual Learning Content Database for MindMate
// Supported languages: 'en' (English), 'es' (Spanish), 'fr' (French), 'de' (German), 'hi' (Hindi)

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'hi';

export interface SupportedLanguage {
  code: LanguageCode;
  label: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
];

export interface SubjectItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  topicsCount: number;
}

export const SUBJECTS: SubjectItem[] = [
  {
    id: 'python',
    name: 'Python Programming',
    description: 'Core syntax, functional paradigms, and object-oriented architectures',
    icon: 'Code2',
    topicsCount: 4,
  },
  {
    id: 'dbms',
    name: 'Database Management Systems',
    description: 'Relational data models, SQL execution, indexing, and normalization',
    icon: 'Database',
    topicsCount: 2,
  },
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    description: 'Fundamental storage structures, time complexity, and search patterns',
    icon: 'BrainCircuit',
    topicsCount: 2,
  },
];

export interface TopicItem {
  id: string;
  subjectId: string;
  name: string;
  description: string;
}

export const TOPICS: TopicItem[] = [
  { id: 'python-functions', subjectId: 'python', name: 'Python Functions', description: 'Arguments, returns, closures, and lambda expressions' },
  { id: 'python-oop', subjectId: 'python', name: 'Object-Oriented Programming (OOP)', description: 'Classes, encapsulation, inheritance, and polymorphism' },
  { id: 'python-loops', subjectId: 'python', name: 'Loops & Iteration', description: 'For loops, while loops, comprehension expressions, and generators' },
  { id: 'python-variables', subjectId: 'python', name: 'Variables & Scope', description: 'Local, global, and nonlocal scope with variable binding' },
  { id: 'dbms-sql', subjectId: 'dbms', name: 'SQL & Query Optimization', description: 'SELECT joins, aggregations, subqueries, and indexing' },
  { id: 'dbms-normalization', subjectId: 'dbms', name: 'Database Normalization', description: '1NF, 2NF, 3NF, BCNF and integrity constraints' },
  { id: 'dsa-queues-stacks', subjectId: 'dsa', name: 'Stacks & Queues', description: 'LIFO, FIFO, circular queues, and deque mechanics' },
  { id: 'dsa-trees', subjectId: 'dsa', name: 'Trees & Graphs', description: 'Binary search trees, traversal algorithms, and shortest paths' },
];

export interface FlashcardItem {
  id: string;
  topicId: string;
  language: LanguageCode;
  front: string;
  back: string;
  hint: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  codeSnippet?: string;
}

export interface QuickRecallItem {
  id: string;
  topicId: string;
  language: LanguageCode;
  title: string;
  category: 'definition' | 'syntax' | 'rule' | 'pitfall';
  keyFact: string;
  codeSnippet?: string;
  detail: string;
}

export interface AdaptiveQuestionItem {
  id: string;
  topicId: string;
  language: LanguageCode;
  difficulty: number; // 1 to 5
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Multilingual Database Seed (Real Verified Content)
// ─────────────────────────────────────────────────────────────────────────────

export const MULTILINGUAL_QUESTIONS: AdaptiveQuestionItem[] = [
  // --- English Questions (Difficulty 1 to 5) ---
  {
    id: 'q-en-fn-1',
    topicId: 'python-functions',
    language: 'en',
    difficulty: 1,
    question: 'Which keyword defines a function in Python?',
    options: ['function', 'def', 'func', 'fn'],
    correct: 1,
    explanation: 'The `def` keyword introduces a function definition in Python syntax.',
  },
  {
    id: 'q-en-fn-2',
    topicId: 'python-functions',
    language: 'en',
    difficulty: 2,
    question: 'What occurs when calling a function without passing a required positional argument?',
    options: ['Python passes None automatically', 'Python raises a TypeError', 'Python silently skips execution', 'The function creates a default empty value'],
    correct: 1,
    explanation: 'Python raises a TypeError stating that a required positional argument was missing.',
  },
  {
    id: 'q-en-fn-3',
    topicId: 'python-functions',
    language: 'en',
    difficulty: 3,
    question: 'What does *args indicate in a function parameter signature?',
    options: ['A dictionary of keyword arguments', 'An immutable tuple of variable positional arguments', 'A pointer to a memory buffer', 'A mandatory list of integers'],
    correct: 1,
    explanation: '*args packs any extra positional arguments into an immutable tuple.',
  },
  {
    id: 'q-en-fn-4',
    topicId: 'python-functions',
    language: 'en',
    difficulty: 4,
    question: 'Why is using a mutable default argument like `def add(item, lst=[])` problematic in Python?',
    options: ['It causes a syntax compiler error', 'The default list is created once at definition and shared across subsequent calls', 'Python garbage collects the list immediately after first call', 'Lists cannot be passed into functions'],
    correct: 1,
    explanation: 'Default argument expressions are evaluated once when the function is defined, so mutable defaults mutate across successive calls.',
  },
  {
    id: 'q-en-fn-5',
    topicId: 'python-functions',
    language: 'en',
    difficulty: 5,
    question: 'In a Python closure, which keyword allows modifying a variable bound in an enclosing (non-global) scope?',
    options: ['global', 'nonlocal', 'outer', 'super'],
    correct: 1,
    explanation: 'The `nonlocal` keyword allows assignment to an existing variable in the nearest enclosing non-global scope.',
  },

  // OOP English
  {
    id: 'q-en-oop-1',
    topicId: 'python-oop',
    language: 'en',
    difficulty: 1,
    question: 'What method is Python’s standard constructor for initializing class instances?',
    options: ['__create__()', '__init__()', '__new__()', '__construct__()'],
    correct: 1,
    explanation: 'The `__init__` dunder method initializes attributes when a new instance is constructed.',
  },
  {
    id: 'q-en-oop-3',
    topicId: 'python-oop',
    language: 'en',
    difficulty: 3,
    question: 'What is the role of the `self` parameter in instance methods?',
    options: ['It refers to the base parent class', 'It explicitly references the active instance object', 'It acts as an external global variable', 'It defines a private static constant'],
    correct: 1,
    explanation: '`self` represents the specific instance being operated on by the method.',
  },
  {
    id: 'q-en-oop-5',
    topicId: 'python-oop',
    language: 'en',
    difficulty: 5,
    question: 'What algorithm does Python 3 use for Method Resolution Order (MRO) in multiple inheritance?',
    options: ['Depth-First Search (DFS)', 'C3 Linearization', 'Breadth-First Search (BFS)', 'Dijkstra Priority Algorithm'],
    correct: 1,
    explanation: 'Python uses the C3 Linearization algorithm to enforce monotonic method resolution order.',
  },

  // DBMS English
  {
    id: 'q-en-sql-2',
    topicId: 'dbms-sql',
    language: 'en',
    difficulty: 2,
    question: 'Which SQL clause filters rows after an aggregation with GROUP BY?',
    options: ['WHERE', 'HAVING', 'FILTER', 'LIMIT'],
    correct: 1,
    explanation: '`WHERE` filters rows before grouping; `HAVING` filters aggregate group results.',
  },
  {
    id: 'q-en-dsa-2',
    topicId: 'dsa-queues-stacks',
    language: 'en',
    difficulty: 2,
    question: 'Which ordering principle describes the behavior of a standard Queue?',
    options: ['LIFO (Last In, First Out)', 'FIFO (First In, First Out)', 'Random Access', 'Priority Minimum Heap'],
    correct: 1,
    explanation: 'A queue operates on First In, First Out (FIFO).',
  },

  // --- Spanish Questions (Español) ---
  {
    id: 'q-es-fn-1',
    topicId: 'python-functions',
    language: 'es',
    difficulty: 1,
    question: '¿Qué palabra clave se utiliza para definir una función en Python?',
    options: ['function', 'def', 'func', 'definir'],
    correct: 1,
    explanation: 'La palabra clave `def` se utiliza para declarar una función en Python.',
  },
  {
    id: 'q-es-fn-2',
    topicId: 'python-functions',
    language: 'es',
    difficulty: 2,
    question: '¿Qué error lanza Python si se omite un argumento posicional obligatorio?',
    options: ['SyntaxError', 'TypeError', 'ValueError', 'IndexError'],
    correct: 1,
    explanation: 'Python lanza un TypeError indicando que falta un argumento requerido.',
  },
  {
    id: 'q-es-fn-3',
    topicId: 'python-functions',
    language: 'es',
    difficulty: 3,
    question: '¿Qué estructura crea la sintaxis `*args` dentro de una función?',
    options: ['Un diccionario mutable', 'Una tupla inmutable de argumentos posicionales', 'Una lista enlazada', 'Un conjunto desordenado'],
    correct: 1,
    explanation: '`*args` agrupa los argumentos posicionales adicionales en una tupla inmutable.',
  },
  {
    id: 'q-es-oop-2',
    topicId: 'python-oop',
    language: 'es',
    difficulty: 2,
    question: '¿Cuál es el método constructor que inicializa los atributos de una clase en Python?',
    options: ['__constructor__()', '__init__()', '__start__()', '__main__()'],
    correct: 1,
    explanation: '`__init__()` es el método de inicialización llamado automáticamente al instanciar un objeto.',
  },
  {
    id: 'q-es-dsa-2',
    topicId: 'dsa-queues-stacks',
    language: 'es',
    difficulty: 2,
    question: '¿Qué principio de ordenamiento sigue una Cola (Queue) tradicional?',
    options: ['LIFO (Último en entrar, primero en salir)', 'FIFO (Primero en entrar, primero en salir)', 'Ordenamiento rápido', 'Búsqueda binaria'],
    correct: 1,
    explanation: 'Una cola sigue el principio FIFO: el primer elemento en llegar es el primero en ser procesado.',
  },

  // --- French Questions (Français) ---
  {
    id: 'q-fr-fn-1',
    topicId: 'python-functions',
    language: 'fr',
    difficulty: 1,
    question: 'Quel mot-clé permet de définir une fonction en Python ?',
    options: ['fonction', 'def', 'lambda', 'function'],
    correct: 1,
    explanation: 'Le mot-clé `def` sert à déclarer une fonction en Python.',
  },
  {
    id: 'q-fr-fn-3',
    topicId: 'python-functions',
    language: 'fr',
    difficulty: 3,
    question: 'Que contient la variable `*args` dans une fonction Python ?',
    options: ['Un dictionnaire', 'Un tuple d’arguments positionnels', 'Une liste modifiable', 'Un ensemble unique'],
    correct: 1,
    explanation: '`*args` capture les arguments positionnels supplémentaires sous la forme d’un tuple.',
  },
  {
    id: 'q-fr-dsa-2',
    topicId: 'dsa-queues-stacks',
    language: 'fr',
    difficulty: 2,
    question: 'Quel principe régit le fonctionnement d’une file d’attente (Queue) ?',
    options: ['LIFO (Dernier entré, premier sorti)', 'FIFO (Premier entré, premier sorti)', 'Table de hachage', 'Arbre binaire'],
    correct: 1,
    explanation: 'Une file d’attente suit le principe FIFO : Premier entré, premier sorti.',
  },

  // --- German Questions (Deutsch) ---
  {
    id: 'q-de-fn-1',
    topicId: 'python-functions',
    language: 'de',
    difficulty: 1,
    question: 'Welches Schlüsselwort definiert eine Funktion in Python?',
    options: ['funktion', 'def', 'func', 'method'],
    correct: 1,
    explanation: 'Das Schlüsselwort `def` wird in Python zur Funktionsdefinition verwendet.',
  },
  {
    id: 'q-de-dsa-2',
    topicId: 'dsa-queues-stacks',
    language: 'de',
    difficulty: 2,
    question: 'Nach welchem Prinzip arbeitet eine Standard-Queue (Warteschlange)?',
    options: ['LIFO (Last In, First Out)', 'FIFO (First In, First Out)', 'Zufallsprinzip', 'Prioritätsbaum'],
    correct: 1,
    explanation: 'Eine Queue arbeitet nach dem FIFO-Prinzip: Was zuerst ankommt, wird zuerst verarbeitet.',
  },

  // --- Hindi Questions (हिन्दी) ---
  {
    id: 'q-hi-fn-1',
    topicId: 'python-functions',
    language: 'hi',
    difficulty: 1,
    question: 'पायथन में फ़ंक्शन को परिभाषित करने के लिए किस कीवर्ड का उपयोग किया जाता है?',
    options: ['function', 'def', 'func', 'define'],
    correct: 1,
    explanation: 'पायथन में फ़ंक्शन बनाने के लिए `def` कीवर्ड का उपयोग किया जाता है।',
  },
  {
    id: 'q-hi-fn-2',
    topicId: 'python-functions',
    language: 'hi',
    difficulty: 2,
    question: 'आवश्यक तर्क (argument) न देने पर पायथन कौन सा एरर दिखाता है?',
    options: ['ValueError', 'TypeError', 'SyntaxError', 'KeyError'],
    correct: 1,
    explanation: 'आवश्यक पोजीशनल तर्क न देने पर पायथन `TypeError` उत्पन्न करता है।',
  },
  {
    id: 'q-hi-dsa-2',
    topicId: 'dsa-queues-stacks',
    language: 'hi',
    difficulty: 2,
    question: 'कतार (Queue) डेटा संरचना किस नियम पर कार्य करती है?',
    options: ['LIFO (अंतिम अंदर, पहला बाहर)', 'FIFO (पहला अंदर, पहला बाहर)', 'यादृच्छिक क्रम', 'बाइनरी सर्च'],
    correct: 1,
    explanation: 'कतार (Queue) FIFO (First In, First Out) सिद्धांत पर कार्य करती है।',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Flashcards Multilingual Database
// ─────────────────────────────────────────────────────────────────────────────

export const MULTILINGUAL_FLASHCARDS: FlashcardItem[] = [
  // English
  {
    id: 'fc-en-1',
    topicId: 'python-functions',
    language: 'en',
    front: 'What is a Lambda function in Python?',
    back: 'An anonymous, inline single-expression function defined with the `lambda` keyword (e.g., `lambda x: x * 2`).',
    hint: 'Think of a short, nameless one-liner function.',
    difficulty: 'beginner',
  },
  {
    id: 'fc-en-2',
    topicId: 'python-functions',
    language: 'en',
    front: 'What is the key difference between `*args` and `**kwargs`?',
    back: '`*args` passes variable positional arguments as a tuple, while `**kwargs` passes variable keyword arguments as a dictionary.',
    hint: 'One is for positions (tuple), the other for keywords (dict).',
    difficulty: 'intermediate',
  },
  {
    id: 'fc-en-3',
    topicId: 'python-oop',
    language: 'en',
    front: 'What does Polymorphism mean in Object-Oriented Programming?',
    back: 'The ability of different classes to respond to the same method call with their own specialized implementation.',
    hint: 'Many forms sharing a common interface.',
    difficulty: 'intermediate',
  },
  {
    id: 'fc-en-4',
    topicId: 'dbms-sql',
    language: 'en',
    front: 'What is the ACID guarantee in relational databases?',
    back: 'Atomicity (all or nothing), Consistency (valid state), Isolation (independent transactions), and Durability (permanent persistence).',
    hint: '4 core properties of reliable transactions.',
    difficulty: 'advanced',
  },
  {
    id: 'fc-en-5',
    topicId: 'dsa-queues-stacks',
    language: 'en',
    front: 'What is the primary difference between a Stack and a Queue?',
    back: 'A Stack follows LIFO (Last In, First Out) like a stack of plates. A Queue follows FIFO (First In, First Out) like a ticket line.',
    hint: 'LIFO vs FIFO.',
    difficulty: 'beginner',
  },

  // Spanish
  {
    id: 'fc-es-1',
    topicId: 'python-functions',
    language: 'es',
    front: '¿Qué es una función Lambda en Python?',
    back: 'Una función anónima de una sola línea definida con la palabra clave `lambda` (ejemplo: `lambda x: x * 2`).',
    hint: 'Es una función corta sin nombre.',
    difficulty: 'beginner',
  },
  {
    id: 'fc-es-2',
    topicId: 'python-oop',
    language: 'es',
    front: '¿Qué significa Encapsulamiento en POO?',
    back: 'El empaquetado de datos y métodos que operan sobre ellos, restringiendo el acceso directo a los detalles internos del objeto.',
    hint: 'Ocultar detalles internos y proteger atributos.',
    difficulty: 'intermediate',
  },
  {
    id: 'fc-es-3',
    topicId: 'dsa-queues-stacks',
    language: 'es',
    front: '¿Cuál es la diferencia entre Pila (Stack) y Cola (Queue)?',
    back: 'La Pila es LIFO (último en entrar, primero en salir); la Cola es FIFO (primero en entrar, primero en salir).',
    hint: 'Platos apilados vs fila de personas.',
    difficulty: 'beginner',
  },

  // French
  {
    id: 'fc-fr-1',
    topicId: 'python-functions',
    language: 'fr',
    front: 'Qu’est-ce qu’une fonction Lambda en Python ?',
    back: 'Une fonction anonyme concise définie sur une seule ligne avec le mot-clé `lambda`.',
    hint: 'Fonction sans nom sur une seule ligne.',
    difficulty: 'beginner',
  },

  // German
  {
    id: 'fc-de-1',
    topicId: 'python-functions',
    language: 'de',
    front: 'Was ist eine Lambda-Funktion in Python?',
    back: 'Eine anonyme Einzeiler-Funktion, die mit dem Schlüsselwort `lambda` definiert wird.',
    hint: 'Kurze, namenlose Funktion.',
    difficulty: 'beginner',
  },

  // Hindi
  {
    id: 'fc-hi-1',
    topicId: 'python-functions',
    language: 'hi',
    front: 'पायथन में लैम्ब्डा (Lambda) फ़ंक्शन क्या है?',
    back: 'यह एक अनाम, एकल-अभिव्यक्ति (single-expression) वाला फ़ंक्शन है जिसे `lambda` कीवर्ड से परिभाषित किया जाता है।',
    hint: 'बिना नाम वाला संक्षिप्त फ़ंक्शन।',
    difficulty: 'beginner',
  },
  {
    id: 'fc-hi-2',
    topicId: 'dsa-queues-stacks',
    language: 'hi',
    front: 'स्टैक (Stack) और कतार (Queue) में मुख्य अंतर क्या है?',
    back: 'स्टैक LIFO (अंतिम अंदर, पहला बाहर) नियम का पालन करता है जबकि कतार FIFO (पहला अंदर, पहला बाहर) नियम का पालन करती है।',
    hint: 'बर्तनों का ढेर बनाम टिकट खिड़की की कतार।',
    difficulty: 'beginner',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Quick Recall Summary Items
// ─────────────────────────────────────────────────────────────────────────────

export const MULTILINGUAL_QUICK_RECALL: QuickRecallItem[] = [
  // English
  {
    id: 'qr-en-1',
    topicId: 'python-functions',
    language: 'en',
    title: 'Default Argument Binding',
    category: 'pitfall',
    keyFact: 'Default parameters evaluate once during definition, NOT on invocation.',
    codeSnippet: 'def append_to(val, target=None):\n    if target is None: target = []\n    target.append(val)\n    return target',
    detail: 'Never use mutable defaults like `def f(items=[])`. Use `None` as a sentinel to prevent shared state across calls.',
  },
  {
    id: 'qr-en-2',
    topicId: 'python-functions',
    language: 'en',
    title: 'Positional-Only & Keyword-Only Syntax',
    category: 'syntax',
    keyFact: 'Use `/` for positional-only arguments and `*` for keyword-only arguments.',
    codeSnippet: 'def compute(pos_only, /, standard, *, kw_only):\n    return pos_only + standard + kw_only',
    detail: 'Arguments before `/` cannot be called by name. Arguments after `*` must always be provided with their explicit parameter name.',
  },
  {
    id: 'qr-en-3',
    topicId: 'python-oop',
    language: 'en',
    title: 'Encapsulation with Name Mangling',
    category: 'rule',
    keyFact: 'Prefixing an attribute with two underscores triggers private name mangling.',
    codeSnippet: 'class Vault:\n    def __init__(self):\n        self.__secret = 42\n# Accessible externally as _Vault__secret',
    detail: 'Single underscore `_name` is an internal convention. Double underscore `__name` actively mangles attribute names to avoid accidental override.',
  },
  {
    id: 'qr-en-4',
    topicId: 'dbms-sql',
    language: 'en',
    title: 'JOIN Execution Order & Predicates',
    category: 'rule',
    keyFact: 'WHERE clauses execute after FROM/JOIN tables are assembled.',
    codeSnippet: 'SELECT u.name, o.total\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nWHERE u.active = true;',
    detail: 'Be cautious with LEFT JOINs: filtering right-table columns in the WHERE clause implicitly converts the join into an INNER JOIN.',
  },
  {
    id: 'qr-en-5',
    topicId: 'dsa-queues-stacks',
    language: 'en',
    title: 'Stack vs Queue Time Complexity',
    category: 'definition',
    keyFact: 'Both Stack and Queue offer O(1) amortized insertion and removal.',
    codeSnippet: 'from collections import deque\nq = deque()\nq.append(10)      # O(1) Push\nq.popleft()        # O(1) Pop Queue',
    detail: 'In Python, do not use `list.pop(0)` for a queue because it causes O(n) array memory shifting. Always use `collections.deque`.',
  },

  // Spanish
  {
    id: 'qr-es-1',
    topicId: 'python-functions',
    language: 'es',
    title: 'Argumentos Predeterminados Mutables',
    category: 'pitfall',
    keyFact: 'Los argumentos predeterminados se evalúan al compilar, no en cada llamada.',
    codeSnippet: 'def agregar(elemento, lista=None):\n    if lista is None: lista = []\n    lista.append(elemento)\n    return lista',
    detail: 'Evita listas o diccionarios como valores por defecto; utiliza `None` como centinela seguro para evitar estados compartidos.',
  },
  {
    id: 'qr-es-2',
    topicId: 'dsa-queues-stacks',
    language: 'es',
    title: 'Complejidad Temporal: Pila y Cola',
    category: 'definition',
    keyFact: 'Ambas estructuras permiten inserción y extracción en tiempo O(1).',
    codeSnippet: 'from collections import deque\ncola = deque()\ncola.append(1)   # O(1)\ncola.popleft()   # O(1)',
    detail: 'En Python nunca uses `lista.pop(0)` para una cola ya que tiene costo O(n). Utiliza siempre `collections.deque`.',
  },

  // French
  {
    id: 'qr-fr-1',
    topicId: 'python-functions',
    language: 'fr',
    title: 'Arguments par défaut en Python',
    category: 'pitfall',
    keyFact: 'Les arguments par défaut sont créés une seule fois lors de la définition.',
    codeSnippet: 'def ajouter(val, liste=None):\n    if liste is None: liste = []\n    liste.append(val)\n    return liste',
    detail: 'N’utilisez jamais d’objets modifiables comme valeurs par défaut pour éviter de partager le même état entre plusieurs appels.',
  },

  // German
  {
    id: 'qr-de-1',
    topicId: 'python-functions',
    language: 'de',
    title: 'Standardargumente in Python',
    category: 'pitfall',
    keyFact: 'Standardargumente werden einmalig bei der Funktionsdefinition ausgewertet.',
    codeSnippet: 'def addieren(wert, liste=None):\n    if liste is None: liste = []\n    liste.append(wert)\n    return liste',
    detail: 'Verwende niemals veränderliche Typen als Standardwert; nutze stattdessen `None` als sicheren Platzhalter.',
  },

  // Hindi
  {
    id: 'qr-hi-1',
    topicId: 'python-functions',
    language: 'hi',
    title: 'डिफ़ॉल्ट तर्क और म्युटेबल ऑब्जेक्ट्स',
    category: 'pitfall',
    keyFact: 'डिफ़ॉल्ट तर्क केवल फ़ंक्शन बनते समय एक बार बनाए जाते हैं।',
    codeSnippet: 'def add_item(val, items=None):\n    if items is None: items = []\n    items.append(val)\n    return items',
    detail: 'डिफ़ॉल्ट में कभी भी खाली लिस्ट `[]` न रखें; shared memory से बचने के लिए `None` का उपयोग करें।',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Content Query Helpers with Graceful Fallback
// ─────────────────────────────────────────────────────────────────────────────

export function getQuestionsByTopicAndLanguage(
  topicId: string,
  language: LanguageCode = 'en'
): { questions: AdaptiveQuestionItem[]; isFallback: boolean; activeLang: LanguageCode } {
  const match = MULTILINGUAL_QUESTIONS.filter(
    (q) => (q.topicId === topicId || topicId === 'all') && q.language === language
  );
  if (match.length > 0) {
    return { questions: match, isFallback: false, activeLang: language };
  }
  // Graceful fallback to English
  const englishFallback = MULTILINGUAL_QUESTIONS.filter(
    (q) => (q.topicId === topicId || topicId === 'all') && q.language === 'en'
  );
  return {
    questions: englishFallback,
    isFallback: language !== 'en',
    activeLang: 'en',
  };
}

export function getFlashcardsByTopicAndLanguage(
  topicId: string,
  language: LanguageCode = 'en'
): { flashcards: FlashcardItem[]; isFallback: boolean; activeLang: LanguageCode } {
  const match = MULTILINGUAL_FLASHCARDS.filter(
    (fc) => (fc.topicId === topicId || topicId === 'all') && fc.language === language
  );
  if (match.length > 0) {
    return { flashcards: match, isFallback: false, activeLang: language };
  }
  // Fallback to English
  const fallback = MULTILINGUAL_FLASHCARDS.filter(
    (fc) => (fc.topicId === topicId || topicId === 'all') && fc.language === 'en'
  );
  return {
    flashcards: fallback,
    isFallback: language !== 'en',
    activeLang: 'en',
  };
}

export function getQuickRecallByTopicAndLanguage(
  topicId: string,
  language: LanguageCode = 'en'
): { items: QuickRecallItem[]; isFallback: boolean; activeLang: LanguageCode } {
  const match = MULTILINGUAL_QUICK_RECALL.filter(
    (item) => (item.topicId === topicId || topicId === 'all') && item.language === language
  );
  if (match.length > 0) {
    return { items: match, isFallback: false, activeLang: language };
  }
  const fallback = MULTILINGUAL_QUICK_RECALL.filter(
    (item) => (item.topicId === topicId || topicId === 'all') && item.language === 'en'
  );
  return {
    items: fallback,
    isFallback: language !== 'en',
    activeLang: 'en',
  };
}
