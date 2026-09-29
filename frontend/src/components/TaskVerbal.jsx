import React, { useState, useEffect, useRef } from 'react';
import {
  transcribeAudioBlob,
  getStoredApiKey,
  setStoredApiKey,
  detectKeyProvider,
} from '../services/transcriptionService';

const DURATION_SECONDS = 25;

// Comprehensive animal dictionary covering pets, farm animals, wild mammals,
// birds, marine life, reptiles, amphibians, and insects
const ANIMAL_LEXICON = [
  // Domestic & Pets
  'dog', 'dogs', 'puppy', 'puppies', 'hound', 'canine',
  'cat', 'cats', 'kitten', 'kittens', 'kitty', 'feline',
  'cow', 'cows', 'bull', 'bulls', 'calf', 'calves', 'ox', 'oxen', 'cattle',
  'horse', 'horses', 'pony', 'ponies', 'stallion', 'mare', 'foal', 'colt',
  'donkey', 'donkeys', 'mule', 'mules',
  'pig', 'pigs', 'piglet', 'piglets', 'hog', 'hogs', 'boar', 'swine',
  'sheep', 'lamb', 'lambs', 'ram', 'rams', 'ewe', 'ewes',
  'goat', 'goats', 'kid', 'kids',
  'chicken', 'chickens', 'hen', 'hens', 'rooster', 'roosters', 'chick', 'chicks',
  'duck', 'ducks', 'duckling', 'ducklings',
  'goose', 'geese', 'gosling', 'goslings',
  'turkey', 'turkeys',
  'rabbit', 'rabbits', 'bunny', 'bunnies', 'hare', 'hares',
  'hamster', 'hamsters', 'guinea pig', 'guinea pigs', 'gerbil', 'gerbils', 'ferret', 'ferrets',
  'mouse', 'mice', 'rat', 'rats',

  // Wild Mammals & Safari
  'lion', 'lions', 'lioness', 'tiger', 'tigers', 'cub', 'cubs',
  'cheetah', 'cheetahs', 'leopard', 'leopards', 'jaguar', 'jaguars', 'panther', 'panthers',
  'puma', 'pumas', 'cougar', 'cougars', 'lynx', 'bobcat', 'bobcats',
  'elephant', 'elephants', 'giraffe', 'giraffes',
  'zebra', 'zebras', 'hippopotamus', 'hippopotamuses', 'hippo', 'hippos',
  'rhinoceros', 'rhinoceroses', 'rhino', 'rhinos',
  'monkey', 'monkeys', 'ape', 'apes', 'chimpanzee', 'chimpanzees', 'chimp', 'chimps',
  'gorilla', 'gorillas', 'orangutan', 'orangutans', 'baboon', 'baboons', 'lemur', 'lemurs',
  'bear', 'bears', 'polar bear', 'grizzly', 'panda', 'pandas',
  'wolf', 'wolves', 'coyote', 'coyotes', 'jackal', 'jackals', 'dingo', 'dingoes',
  'fox', 'foxes',
  'deer', 'fawn', 'stag', 'doe', 'elk', 'elks', 'moose', 'reindeer', 'caribou', 'antelope', 'gazelle',
  'camel', 'camels', 'llama', 'llamas', 'alpaca', 'alpacas', 'yak', 'yaks',
  'bison', 'buffalo', 'buffaloes',
  'kangaroo', 'kangaroos', 'koala', 'koalas', 'wallaby', 'wallabies', 'wombat', 'platypus',
  'sloth', 'sloths', 'anteater', 'anteaters', 'armadillo', 'armadillos',
  'raccoon', 'raccoons', 'skunk', 'skunks', 'badger', 'badgers',
  'otter', 'otters', 'beaver', 'beavers', 'squirrel', 'squirrels', 'chipmunk', 'chipmunks',
  'hedgehog', 'hedgehogs', 'porcupine', 'porcupines', 'mole', 'moles',
  'bat', 'bats', 'possum', 'possums', 'opossum', 'opossums', 'hyena', 'hyenas',
  'meerkat', 'meerkats',

  // Marine & Aquatic
  'whale', 'whales', 'blue whale', 'killer whale', 'orca', 'orcas', 'humpback', 'narwhal',
  'dolphin', 'dolphins', 'porpoise', 'porpoises',
  'shark', 'sharks', 'seal', 'seals', 'sea lion', 'sea lions', 'walrus', 'walruses',
  'manatee', 'manatees',
  'octopus', 'octopuses', 'octopi', 'squid', 'squids',
  'crab', 'crabs', 'lobster', 'lobsters', 'shrimp', 'prawn', 'prawns',
  'jellyfish', 'starfish', 'seahorse', 'seahorses', 'clam', 'clams', 'oyster', 'oysters',
  'fish', 'fishes', 'salmon', 'trout', 'tuna', 'goldfish', 'eel', 'eels', 'stingray', 'ray',

  // Birds
  'bird', 'birds', 'sparrow', 'sparrows', 'eagle', 'eagles', 'hawk', 'hawks', 'falcon', 'falcons',
  'owl', 'owls', 'parrot', 'parrots', 'penguin', 'penguins', 'swan', 'swans',
  'peacock', 'peacocks', 'flamingo', 'flamingos', 'pigeon', 'pigeons', 'dove', 'doves',
  'crow', 'crows', 'raven', 'ravens', 'seagull', 'seagulls', 'gull', 'gulls',
  'canary', 'canaries', 'woodpecker', 'woodpeckers', 'robin', 'robins', 'bluejay', 'bluejays',
  'vulture', 'vultures', 'pelican', 'pelicans', 'stork', 'storks', 'heron', 'herons',
  'ostrich', 'ostriches', 'emu', 'emus', 'kiwi', 'kiwis', 'hummingbird', 'hummingbirds',

  // Reptiles & Amphibians
  'snake', 'snakes', 'python', 'pythons', 'cobra', 'cobras', 'viper', 'vipers',
  'lizard', 'lizards', 'gecko', 'geckos', 'chameleon', 'chameleons', 'iguana', 'iguanas',
  'turtle', 'turtles', 'tortoise', 'tortoises',
  'crocodile', 'crocodiles', 'alligator', 'alligators', 'croc', 'crocs', 'gator', 'gators',
  'frog', 'frogs', 'toad', 'toads', 'tadpole', 'newt', 'salamander', 'salamanders',

  // Insects & Arthropods
  'butterfly', 'butterflies', 'moth', 'moths', 'caterpillar', 'caterpillars',
  'bee', 'bees', 'honeybee', 'wasp', 'wasps', 'hornet', 'hornets', 'bumblebee',
  'ant', 'ants', 'spider', 'spiders', 'tarantula', 'scorpion', 'scorpions',
  'beetle', 'beetles', 'ladybug', 'ladybugs',
  'grasshopper', 'grasshoppers', 'cricket', 'crickets', 'dragonfly', 'dragonflies',
  'fly', 'flies', 'mosquito', 'mosquitoes', 'worm', 'worms', 'snail', 'snails', 'slug', 'slugs'
];

const KNOWN_ANIMALS_SET = new Set(ANIMAL_LEXICON.map((w) => w.toLowerCase()));

// Canonical plural and alias normalization map
const CANONICAL_MAP = {
  dogs: 'dog', puppies: 'puppy', pups: 'pup',
  cats: 'cat', kittens: 'kitten', kitties: 'kitten',
  cows: 'cow', bulls: 'bull', calves: 'calf', oxen: 'ox',
  horses: 'horse', ponies: 'pony',
  donkeys: 'donkey', mules: 'mule',
  pigs: 'pig', piglets: 'piglet', hogs: 'hog',
  lambs: 'lamb', rams: 'ram',
  goats: 'goat', kids: 'kid',
  chickens: 'chicken', hens: 'hen', roosters: 'rooster', chicks: 'chick',
  ducks: 'duck', ducklings: 'duckling',
  geese: 'goose', goslings: 'gosling',
  turkeys: 'turkey',
  rabbits: 'rabbit', bunnies: 'bunny', hares: 'hare',
  hamsters: 'hamster', gerbils: 'gerbil', ferrets: 'ferret',
  mice: 'mouse', rats: 'rat',
  lions: 'lion', tigers: 'tiger', cubs: 'cub',
  cheetahs: 'cheetah', leopards: 'leopard', jaguars: 'jaguar', panthers: 'panther',
  elephants: 'elephant', giraffes: 'giraffe',
  zebras: 'zebra', hippopotamuses: 'hippo', hippos: 'hippo', hippopotamus: 'hippo',
  rhinoceroses: 'rhino', rhinos: 'rhino', rhinoceros: 'rhino',
  monkeys: 'monkey', apes: 'ape', chimpanzees: 'chimpanzee', chimps: 'chimpanzee',
  gorillas: 'gorilla', baboons: 'baboon', lemurs: 'lemur',
  bears: 'bear', pandas: 'panda',
  wolves: 'wolf', coyotes: 'coyote', foxes: 'fox',
  camels: 'camel', llamas: 'llama',
  kangaroos: 'kangaroo', koalas: 'koala',
  whales: 'whale', dolphins: 'dolphin', sharks: 'shark', seals: 'seal', walruses: 'walrus',
  octopuses: 'octopus', octopi: 'octopus', squids: 'squid',
  crabs: 'crab', lobsters: 'lobster',
  sparrows: 'sparrow', eagles: 'eagle', hawks: 'hawk', falcons: 'falcon',
  owls: 'owl', parrots: 'parrot', penguins: 'penguin', swans: 'swan',
  pigeons: 'pigeon', doves: 'dove', crows: 'crow', ravens: 'raven',
  seagulls: 'seagull', gulls: 'seagull',
  snakes: 'snake', pythons: 'python', lizards: 'lizard',
  turtles: 'turtle', tortoises: 'tortoise',
  crocodiles: 'crocodile', alligators: 'alligator',
  frogs: 'frog', toads: 'toad',
  butterflies: 'butterfly', moths: 'moth', bees: 'bee', ants: 'ant', spiders: 'spider'
};

function normalizeAnimalWord(raw) {
  if (!raw) return null;
  const word = raw.toLowerCase().trim().replace(/[^a-z\s-]/g, '');
  if (!word) return null;

  if (CANONICAL_MAP[word]) return CANONICAL_MAP[word];
  if (KNOWN_ANIMALS_SET.has(word)) return word;

  if (word.endsWith('s') && KNOWN_ANIMALS_SET.has(word.slice(0, -1))) {
    return word.slice(0, -1);
  }
  if (word.endsWith('es') && KNOWN_ANIMALS_SET.has(word.slice(0, -2))) {
    return word.slice(0, -2);
  }

  return null;
}

export default function TaskVerbal({ acousticAnalyzer, onComplete }) {
  const [phase, setPhase] = useState('instructions'); // instructions, recording, transcribing, review
  const [secondsRemaining, setSecondsRemaining] = useState(DURATION_SECONDS);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [recognizedWords, setRecognizedWords] = useState([]);
  const [quickInput, setQuickInput] = useState('');
  const [speechStatus, setSpeechStatus] = useState('idle'); // idle, active, unavailable, denied

  // API Key State & Management
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [tempApiKey, setTempApiKey] = useState(getStoredApiKey());
  const [showApiModal, setShowApiModal] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionNotice, setTranscriptionNotice] = useState('');
  const [lastAudioBlob, setLastAudioBlob] = useState(null);

  const timerRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const isRecordingActiveRef = useRef(false);

  // Extract recognized animals from speech transcript
  const extractAnimalsFromText = (text) => {
    if (!text) return;
    const clean = text.toLowerCase().replace(/[^a-z\s-]/g, ' ');
    const tokens = clean.split(/\s+/).filter(Boolean);

    // Two-word animals first
    for (let i = 0; i < tokens.length - 1; i++) {
      const twoWords = `${tokens[i]} ${tokens[i + 1]}`;
      const norm = normalizeAnimalWord(twoWords);
      if (norm) {
        setRecognizedWords((prev) => (prev.includes(norm) ? prev : [...prev, norm]));
      }
    }

    // Single tokens
    tokens.forEach((t) => {
      const norm = normalizeAnimalWord(t);
      if (norm) {
        setRecognizedWords((prev) => (prev.includes(norm) ? prev : [...prev, norm]));
      }
    });
  };

  const handleSaveApiKey = () => {
    const trimmed = tempApiKey.trim();
    setStoredApiKey(trimmed);
    setApiKey(trimmed);
    setShowApiModal(false);
  };

  const startTask = () => {
    setPhase('recording');
    setSecondsRemaining(DURATION_SECONDS);
    setLiveTranscript('');
    setRecognizedWords([]);
    setQuickInput('');
    setTranscriptionNotice('');
    isRecordingActiveRef.current = true;

    // Start Web Audio API capture for phonation energy & pause tracking
    if (acousticAnalyzer?.startAcousticCapture) {
      acousticAnalyzer.startAcousticCapture().catch((err) => {
        console.warn('Microphone capture initiation notice:', err);
      });
    }

    // Initialize Web Speech API safely
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 3;

        recognition.onresult = (event) => {
          let accumulated = '';
          for (let i = 0; i < event.results.length; ++i) {
            accumulated += event.results[i][0].transcript + ' ';
          }
          setLiveTranscript(accumulated.trim());
          extractAnimalsFromText(accumulated);
        };

        recognition.onerror = (event) => {
          console.warn('SpeechRecognition event:', event.error);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setSpeechStatus('denied');
          } else if (event.error === 'network') {
            setSpeechStatus('unavailable');
          }
        };

        recognition.onend = () => {
          if (isRecordingActiveRef.current) {
            try {
              recognition.start();
            } catch (e) {
              setTimeout(() => {
                if (isRecordingActiveRef.current) {
                  try { recognition.start(); } catch {}
                }
              }, 150);
            }
          }
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
        setSpeechStatus('active');
      } catch (err) {
        console.warn('Speech recognition start fallback:', err);
        setSpeechStatus('unavailable');
      }
    } else {
      setSpeechStatus('unavailable');
    }

    // Countdown Timer
    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRecording = async () => {
    isRecordingActiveRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
    }

    let audioBlob = null;
    if (acousticAnalyzer?.stopAcousticCapture) {
      audioBlob = await acousticAnalyzer.stopAcousticCapture();
    }
    if (!audioBlob && acousticAnalyzer?.getAudioBlob) {
      audioBlob = acousticAnalyzer.getAudioBlob();
    }
    setLastAudioBlob(audioBlob);

    // If an API key is available or serverless is configured, perform AI Whisper transcription
    const effectiveKey = apiKey || getStoredApiKey();
    if (audioBlob && audioBlob.size > 500) {
      setIsTranscribing(true);
      try {
        const result = await transcribeAudioBlob(audioBlob, effectiveKey);
        if (result?.transcript) {
          setLiveTranscript(result.transcript);
          extractAnimalsFromText(result.transcript);
          setTranscriptionNotice(`Transcribed via ${result.provider || 'AI Speech Model'}`);
        }
      } catch (aiErr) {
        console.warn('AI speech transcription notice:', aiErr);
        if (!effectiveKey) {
          setTranscriptionNotice('Add a free Groq/Gemini API key for 100% accurate AI transcription.');
        } else {
          setTranscriptionNotice(`AI transcription notice: ${aiErr.message}`);
        }
      } finally {
        setIsTranscribing(false);
      }
    }

    setPhase('review');
  };

  // Re-run transcription if user enters API key during review
  const handleRerunTranscription = async () => {
    const audioBlob = lastAudioBlob || (acousticAnalyzer?.getAudioBlob ? acousticAnalyzer.getAudioBlob() : null);
    if (!audioBlob) {
      alert('No recorded audio clip available. Please begin a new recording round.');
      return;
    }
    const effectiveKey = apiKey || getStoredApiKey();
    if (!effectiveKey) {
      setShowApiModal(true);
      return;
    }

    setIsTranscribing(true);
    try {
      const result = await transcribeAudioBlob(audioBlob, effectiveKey);
      if (result?.transcript) {
        setLiveTranscript(result.transcript);
        extractAnimalsFromText(result.transcript);
        setTranscriptionNotice(`Transcribed via ${result.provider || 'AI Speech Model'}`);
      }
    } catch (err) {
      alert(`Transcription failed: ${err.message}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleAddQuickWord = () => {
    if (!quickInput.trim()) return;
    const cleanWord = quickInput.trim().toLowerCase();
    const norm = normalizeAnimalWord(cleanWord) || cleanWord;

    if (!recognizedWords.includes(norm)) {
      setRecognizedWords((prev) => [...prev, norm]);
    }
    setQuickInput('');
  };

  const handleRemoveWord = (word) => {
    setRecognizedWords((prev) => prev.filter((w) => w !== word));
  };

  const handleConfirmAndProceed = () => {
    const wordsCount = recognizedWords.length;
    const speechRate = Math.round((wordsCount / (DURATION_SECONDS / 60)));
    const acousticSummary = acousticAnalyzer?.getAcousticSummary ? acousticAnalyzer.getAcousticSummary() : {};
    const pauseRatio = acousticSummary?.pause_ratio ?? 0.16;

    onComplete({
      words_count: wordsCount,
      speech_rate_wpm: speechRate,
      pause_ratio: pauseRatio,
      matched_items: recognizedWords,
      category_hits: recognizedWords,
      transcript: liveTranscript || recognizedWords.join(', '),
    });
  };

  useEffect(() => {
    return () => {
      isRecordingActiveRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const elapsed = Math.max(DURATION_SECONDS - secondsRemaining, 1);
  const liveWpm = Math.round((recognizedWords.length / (elapsed / 60)));
  const acousticSummary = acousticAnalyzer?.getAcousticSummary ? acousticAnalyzer.getAcousticSummary() : {};
  const livePauseRatio = Math.round((acousticSummary?.pause_ratio ?? 0.16) * 100);
  const provider = detectKeyProvider(apiKey);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Primary Stimulus Container */}
      <div className="relative overflow-hidden w-full min-h-[470px] rounded-xl bg-surface-container-lowest shadow-sm p-8 flex flex-col items-center justify-between text-center transition-all duration-300 border border-surface-container-high/60">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/20 via-transparent to-secondary-container/15 pointer-events-none" />

        {/* Top Meta Bar with API Key Button */}
        <div className="w-full flex items-center justify-between relative z-10 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1 rounded-full text-on-surface-variant border border-surface-container-high/60 shadow-sm">
            <span className="material-symbols-outlined text-[16px] text-primary">mic</span>
            <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider">
              Paradigm #VER-04
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* API Key Configuration Trigger */}
            <button
              onClick={() => setShowApiModal(!showApiModal)}
              type="button"
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                apiKey
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
              }`}
              title="Click to configure Groq Whisper or Gemini API Key for speech transcription"
            >
              <span className="material-symbols-outlined text-[14px]">
                {apiKey ? 'check_circle' : 'key'}
              </span>
              <span>
                {apiKey
                  ? `${provider === 'groq' ? 'Groq Whisper' : provider === 'gemini' ? 'Gemini AI' : 'OpenAI Whisper'} Active`
                  : 'Add API Key'}
              </span>
            </button>

            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            <span className="font-telemetry-data text-[12px] text-on-surface-variant">
              Category: <strong className="text-primary font-bold">ANIMALS</strong>
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            <span className="font-telemetry-data text-[12px] text-on-surface-variant">
              Time: <strong className="text-secondary">{secondsRemaining}s</strong>
            </span>
          </div>
        </div>

        {/* API Key Modal / Drawer */}
        {showApiModal && (
          <div className="w-full max-w-lg mx-auto my-3 p-4 rounded-xl bg-surface-container border border-surface-container-high text-left relative z-20 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-caps text-[11px] font-bold uppercase text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">key</span>
                Speech Transcription API Key
              </span>
              <button
                onClick={() => setShowApiModal(false)}
                type="button"
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <p className="text-[12px] text-on-surface-variant mb-2 leading-relaxed">
              Add your <strong className="text-on-surface">Groq API Key</strong> (<code className="text-primary font-mono">gsk_...</code>) or <strong className="text-on-surface">Gemini Key</strong> (<code className="text-primary font-mono">AIza...</code>). Groq Whisper Large v3 is 100% free and transcribes in ~400ms.
            </p>
            <div className="flex gap-2 mb-2">
              <input
                type="password"
                placeholder="Paste API Key here (e.g. gsk_... or AIza...)"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container-high text-[13px] text-on-surface outline-none focus:border-primary font-mono"
              />
              <button
                onClick={handleSaveApiKey}
                type="button"
                className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-bold text-[12px] transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
              <span>Saved locally in your browser.</span>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline flex items-center gap-0.5"
              >
                Get free Groq key <span className="material-symbols-outlined text-[12px]">open_in_new</span>
              </a>
            </div>
          </div>
        )}

        {/* Center Stimulus Core Focus Area */}
        <div className="flex flex-col items-center max-w-xl my-auto py-3 relative z-10 w-full">
          {phase === 'instructions' ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-4 shadow-sm">
                <span className="material-symbols-outlined text-[32px]">graphic_eq</span>
              </div>
              <h1 className="font-display text-[32px] font-bold text-on-surface mb-2 tracking-tight">
                Phonation & Verbal Fluency
              </h1>
              <p className="font-body-lg text-[15px] text-on-surface-variant mb-6 max-w-md leading-relaxed">
                When the test starts, speak aloud and name as many <strong className="text-primary font-bold">ANIMALS</strong> as you can in 25 seconds (e.g. dog, cat, lion, dolphin, sparrow).
              </p>
              <button
                onClick={startTask}
                className="w-full sm:w-auto min-w-[320px] px-8 py-3.5 rounded-xl bg-primary text-on-primary font-headline-sm text-[16px] font-semibold shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">mic</span>
                <span>Begin Voice Recording</span>
              </button>
            </div>
          ) : phase === 'recording' ? (
            <div className="flex flex-col items-center w-full">
              {/* Countdown Circular Badge */}
              <div className="relative w-28 h-28 rounded-full bg-surface-container-high border-4 border-primary/30 flex items-center justify-center mb-3 shadow-md">
                <span className="font-telemetry-numeric-lg text-[40px] font-black text-primary">
                  {secondsRemaining}s
                </span>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 mb-2">
                {apiKey ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Recording for Whisper AI Transcription
                  </span>
                ) : speechStatus === 'active' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed/50 border border-secondary text-on-secondary-fixed-variant text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    Live Speech Recognition Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-[11px] font-medium">
                    <span className="material-symbols-outlined text-[14px]">info</span>
                    Audio Recording Active (You can also type animals below)
                  </span>
                )}
              </div>

              {/* Pulsing Acoustic Waveform */}
              <div className="flex items-center gap-1.5 h-10 px-4 my-1">
                {[6, 14, 28, 40, 24, 36, 18, 30, 12, 22, 34, 16, 8].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${Math.max(h * ((acousticAnalyzer?.volumeLevel ?? 0) * 4 || 0.4), 6)}px` }}
                    className="w-1.5 bg-primary rounded-full transition-all duration-75"
                  />
                ))}
              </div>

              {/* Live Web Speech Transcript */}
              <div className="w-full max-w-md p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-center my-2 min-h-[56px] flex items-center justify-center">
                <p className="font-body-md text-[13px] text-on-surface italic">
                  {liveTranscript || 'Listening... Speak animal names aloud...'}
                </p>
              </div>

              {/* Real-time Quick Input */}
              <div className="flex items-center gap-2 w-full max-w-md my-2">
                <input
                  type="text"
                  placeholder="Or type animal here & press Enter..."
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddQuickWord();
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-surface-container-lowest border border-surface-container-high text-[13px] text-on-surface outline-none focus:border-primary shadow-sm"
                />
                <button
                  onClick={handleAddQuickWord}
                  type="button"
                  className="px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-[12px] shadow-sm transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>

              {/* Words Detected Live Chips */}
              <div className="flex flex-wrap gap-1.5 justify-center max-w-md mt-1">
                {recognizedWords.map((word, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-[11px] font-bold uppercase shadow-sm"
                  >
                    ✓ {word}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            /* Review & Verify Screen */
            <div className="flex flex-col items-center w-full max-w-md">
              <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-secondary mb-1">
                Voice Phonation Complete
              </span>
              <h2 className="font-headline-sm text-[20px] font-bold text-on-surface mb-2">
                Verify Recognized Animals ({recognizedWords.length})
              </h2>

              {/* AI Transcription Notice / Spinner */}
              {isTranscribing ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[12px] font-semibold my-2 animate-pulse">
                  <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span>Transcribing speech audio with AI Whisper...</span>
                </div>
              ) : transcriptionNotice ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container border border-surface-container-high text-on-surface-variant text-[11px] my-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">auto_awesome</span>
                  <span>{transcriptionNotice}</span>
                  {!apiKey && (
                    <button
                      onClick={() => setShowApiModal(true)}
                      type="button"
                      className="text-primary font-bold hover:underline ml-1 cursor-pointer"
                    >
                      Add Key
                    </button>
                  )}
                </div>
              ) : null}

              {/* Audio Re-transcription Action if user has or wants to add key */}
              {lastAudioBlob && !isTranscribing && (
                <div className="my-1.5 flex items-center gap-2">
                  <button
                    onClick={handleRerunTranscription}
                    type="button"
                    className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-on-surface text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[13px] text-primary">refresh</span>
                    <span>Re-transcribe with AI Key</span>
                  </button>
                </div>
              )}

              {/* Word Chips */}
              <div className="flex flex-wrap gap-2 justify-center w-full p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 max-h-40 overflow-y-auto my-2">
                {recognizedWords.length === 0 ? (
                  <span className="text-[13px] text-on-surface-variant italic">
                    No animals detected yet. Type animals below or re-transcribe above.
                  </span>
                ) : (
                  recognizedWords.map((word) => (
                    <span
                      key={word}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest border border-surface-container-high text-[13px] font-semibold text-on-surface shadow-sm"
                    >
                      <span>{word}</span>
                      <button
                        onClick={() => handleRemoveWord(word)}
                        className="hover:text-red-500 transition-colors cursor-pointer flex items-center"
                        type="button"
                        aria-label={`Remove ${word}`}
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add Missing Word Input */}
              <div className="flex items-center gap-2 w-full mb-4">
                <input
                  type="text"
                  placeholder="Add animal (e.g. koala, hawk)"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddQuickWord();
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high text-[13px] text-on-surface outline-none focus:border-primary"
                />
                <button
                  onClick={handleAddQuickWord}
                  className="px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-[13px] transition-colors cursor-pointer"
                  type="button"
                >
                  Add
                </button>
              </div>

              <button
                onClick={handleConfirmAndProceed}
                className="w-full py-3 rounded-xl bg-primary text-on-primary font-headline-sm text-[15px] font-semibold shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2 cursor-pointer"
                type="button"
              >
                <span>Confirm Words & Proceed</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Context Info */}
        <div className="w-full flex items-center justify-between text-on-surface-variant pt-3 border-t border-surface-container-high/40 relative z-10 text-[12px] flex-wrap gap-2">
          <span>Evaluates semantic search, lexical access, and acoustic phonation rate.</span>
          <span className="font-telemetry-data">
            {apiKey ? 'Whisper AI Engine + Spectral RMS' : 'Web Speech API + Web Audio API Spectral RMS'}
          </span>
        </div>
      </div>

      {/* Auxiliary Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <span className="font-label-caps text-[11px] font-bold uppercase text-on-surface-variant">Lexical Search Volume</span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="font-telemetry-numeric-lg text-[28px] font-bold text-primary">
              {recognizedWords.length} Words
            </span>
            <span className="text-[12px] text-on-surface-variant">in 25s</span>
          </div>
          <span className="text-[12px] text-secondary font-medium">Normative target: 10–16 words</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <span className="font-label-caps text-[11px] font-bold uppercase text-on-surface-variant">Speech Rate Cadence</span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="font-telemetry-numeric-lg text-[28px] font-bold text-on-surface">
              {phase === 'recording' ? `${liveWpm} WPM` : recognizedWords.length > 0 ? `${Math.round(recognizedWords.length / (25 / 60))} WPM` : '0 WPM'}
            </span>
            <span className="text-[12px] text-on-surface-variant">articulation speed</span>
          </div>
          <span className="text-[12px] text-on-surface-variant">Normative acoustic cadence</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <span className="font-label-caps text-[11px] font-bold uppercase text-on-surface-variant">Acoustic Pause Ratio</span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="font-telemetry-numeric-lg text-[28px] font-bold text-secondary">
              {livePauseRatio}%
            </span>
            <span className="text-[12px] text-on-surface-variant">pause duration</span>
          </div>
          <span className="text-[12px] text-secondary font-medium">Smooth semantic retrieval transitions</span>
        </div>
      </div>
    </div>
  );
}
