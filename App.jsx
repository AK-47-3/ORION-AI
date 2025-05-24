import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown

// Translation object for UI elements
const translations = {
    en: {
        header: "ORIONEX: The Emotion-Aware AI Butler",
        userIdLabel: "User ID:",
        commandOrionex: "Command ORIONEX...",
        send: "Send",
        simulateVoiceInput: "Simulate Voice Input",
        orionexControls: "ORIONEX Controls",
        declareEmotion: "Declare Your Emotion:",
        neutral: "Neutral",
        happy: "Happy",
        sad: "Sad",
        angry: "Angry",
        stressed: "Stressed",
        excited: "Excited",
        tired: "Tired",
        orionexMode: "ORIONEX Mode:",
        normalButler: "Normal Butler",
        codeCompanion: "Code Companion",
        motivationalAssistant: "Motivational Assistant",
        banglaHybrid: "Bangla Hybrid",
        carryMinatiRoast: "Carry Minati Roast 🔥",
        customLover: "Custom Partner ❤️", // New mode for custom lover/partner
        yourTasks: "Your Tasks",
        addNewTask: "Add a new task...",
        add: "Add",
        noTasksYet: "No tasks yet, sir. What shall we conquer today?",
        deleteTask: "Delete Task",
        processing: "Processing...",
        you: "You",
        orionex: "ORIONEX",
        initialGreeting: "Greetings, sir. ORIONEX online. How may I assist you today?", // Changed from Namaskar
        voiceInputAlert: "Voice input simulation. In a full app, you'd speak here. For now, please type.",
        voiceOutputAlert: "Voice output simulation. In a full app, ORIONEX would speak here. Check console for text.",
        languageSettings: "Language Settings",
        selectLanguage: "Select Language:",
        english: "English",
        bangla: "বাংলা",
        taskAdded: "Task \"{task}\" added to your list, sir. I'm here to help you achieve your goals.",
        taskAddError: "Apologies, sir. I encountered an error adding that task.",
        taskCompleted: "Excellent, sir. Task {status}. Keep up the remarkable work.",
        taskUpdateError: "Apologies, sir. I could not update the task status.",
        taskRemoved: "Task \"{task}\" has been removed, sir. Consider it done.",
        taskRemoveError: "Apologies, sir. I could not remove that task.",
        systemAnomaly: "System anomaly detected. Connection to core protocols interrupted. Please try again.",
        llmCapabilities: "LLM Capabilities",
        summarizeText: "Summarize Text ✨",
        brainstormIdeas: "Brainstorm Ideas ✨",
        imageAnalysis: "Image Analysis 🖼️",
        imageGenerator: "Image Generator 🎨",
        creativeWriting: "Creative Writing Assistant ✍️", // New LLM capability
        summarizeModalTitle: "Summarize Text",
        brainstormModalTitle: "Brainstorm Ideas",
        imageAnalysisModalTitle: "Image Analysis",
        imageGeneratorModalTitle: "Image Generator",
        creativeWritingModalTitle: "Creative Writing Assistant", // New modal title
        pasteTextToSummarize: "Paste text to summarize...",
        enterTopicForIdeas: "Enter topic for ideas...",
        enterPromptForImageAnalysis: "Enter your question about the image...",
        uploadImage: "Upload Image",
        enterPromptForImageGeneration: "Enter a detailed prompt for image generation...",
        numberOfImages: "Number of Images (1-2):",
        promptQualityTip: "💡 For better results, provide a very detailed and specific prompt (e.g., 'A futuristic city at sunset, cyberpunk style, neon lights, rainy street, high resolution').",
        enterPromptForCreativeWriting: "Enter your prompt or starting text for creative writing...", // New prompt
        generateSummary: "Generate Summary",
        generateIdeas: "Generate Ideas",
        analyzeImage: "Analyze Image",
        generateImage: "Generate Image",
        generateWriting: "Generate Writing", // New button text
        close: "Close",
        summaryResult: "Summary Result:",
        ideasResult: "Ideas Result:",
        analysisResult: "Analysis Result:",
        imageResult: "Generated Image(s):",
        writingResult: "Generated Writing:", // New result label
        noTextProvided: "Please provide text to summarize.",
        noTopicProvided: "Please provide a topic for brainstorming.",
        noImageOrPrompt: "Please upload an image and provide a question.",
        noPromptForImageGen: "Please provide a prompt for image generation.",
        noPromptForCreativeWriting: "Please provide a prompt or starting text for creative writing.", // New error message
        imageUploadError: "Error uploading image. Please try again.",
        generatingImage: "Generating image...",
        imageGenError: "Error generating image. Please try again.",
        invalidImageCount: "Please enter a number between 1 and 2 for the number of images."
    },
    bn: {
        header: "ORIONEX: আবেগ-সচেতন এআই বাটলার",
        userIdLabel: "ইউজার আইডি:",
        commandOrionex: "ORIONEX কে নির্দেশ দিন...",
        send: "পাঠান",
        simulateVoiceInput: "ভয়েস ইনপুট সিমুলেশন",
        orionexControls: "ORIONEX কন্ট্রোলস",
        declareEmotion: "আপনার আবেগ ঘোষণা করুন:",
        neutral: "নিরপেক্ষ",
        happy: "খুশি",
        sad: "দুঃখিত",
        angry: "রাগান্বিত",
        stressed: "চাপগ্রস্ত",
        excited: "উত্তেজিত",
        tired: "ক্লান্ত",
        orionexMode: "ORIONEX মোড:",
        normalButler: "সাধারণ বাটলার",
        codeCompanion: "কোড সহযোগী",
        motivationalAssistant: "অনুপ্রেরণামূলক সহকারী",
        banglaHybrid: "বাংলা মিশ্রিত",
        carryMinatiRoast: "ক্যারি মিনাটি রোস্ট 🔥",
        customLover: "কাস্টম সঙ্গী ❤️", // New mode for custom lover/partner
        yourTasks: "আপনার কাজ",
        addNewTask: "নতুন কাজ যোগ করুন...",
        add: "যোগ করুন",
        noTasksYet: "কোনো কাজ নেই, স্যার। আজ আমরা কী জয় করব?",
        deleteTask: "কাজ মুছুন",
        processing: "প্রসেসিং হচ্ছে...",
        you: "আপনি",
        orionex: "ORIONEX",
        initialGreeting: "শুভেচ্ছা, স্যার। ORIONEX অনলাইন। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?", // Changed from Namaskar
        voiceInputAlert: "ভয়েস ইনপুট সিমুলেশন। একটি সম্পূর্ণ অ্যাপে, আপনি এখানে কথা বলবেন। আপাতত, অনুগ্রহ করে টাইপ করুন।",
        voiceOutputAlert: "ভয়েস আউটপুট সিমুলেশন। একটি সম্পূর্ণ অ্যাপে, ORIONEX এখানে কথা বলবে। টেক্সট দেখার জন্য কনসোল দেখুন।",
        languageSettings: "ভাষা সেটিংস",
        selectLanguage: "ভাষা নির্বাচন করুন:",
        english: "English",
        bangla: "বাংলা",
        taskAdded: "কাজ \"{task}\" আপনার তালিকায় যোগ করা হয়েছে, স্যার। আপনার লক্ষ্য অর্জনে আমি সাহায্য করতে এখানে আছি।",
        taskAddError: "দুঃখিত, স্যার। কাজটি যোগ করতে একটি ত্রুটি হয়েছে।",
        taskCompleted: "চমৎকার, স্যার। কাজ {status}। আপনার অসাধারণ কাজ চালিয়ে যান।",
        taskUpdateError: "দুঃখিত, স্যার। কাজের অবস্থা আপডেট করা যায়নি।",
        taskRemoved: "কাজ \"{task}\" সরানো হয়েছে, স্যার। এটি সম্পন্ন বলে ধরে নিন।",
        taskRemoveError: "দুঃখিত, স্যার। কাজটি সরানো যায়নি।",
        systemAnomaly: "সিস্টেমের অস্বাভাবিকতা সনাক্ত করা হয়েছে। মূল প্রোটোকলের সাথে সংযোগ বিচ্ছিন্ন হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
        llmCapabilities: "এলএলএম ক্ষমতা",
        summarizeText: "টেক্সট সারসংক্ষেপ করুন ✨",
        brainstormIdeas: "ধারণা তৈরি করুন ✨",
        imageAnalysis: "ছবি বিশ্লেষণ 🖼️",
        imageGenerator: "ছবি তৈরি করুন 🎨",
        creativeWriting: "সৃজনশীল লেখা সহকারী ✍️", // New LLM capability
        summarizeModalTitle: "টেক্সট সারসংক্ষেপ করুন",
        brainstormModalTitle: "ধারণা তৈরি করুন",
        imageAnalysisModalTitle: "ছবি বিশ্লেষণ",
        imageGeneratorModalTitle: "ছবি তৈরি করুন",
        creativeWritingModalTitle: "সৃজনশীল লেখা সহকারী", // New modal title
        pasteTextToSummarize: "সারসংক্ষেপ করার জন্য টেক্সট পেস্ট করুন...",
        enterTopicForIdeas: "ধারণার জন্য বিষয় লিখুন...",
        enterPromptForImageAnalysis: "ছবি সম্পর্কে আপনার প্রশ্ন লিখুন...",
        uploadImage: "ছবি আপলোড করুন",
        enterPromptForImageGeneration: "ছবি তৈরির জন্য বিস্তারিত প্রম্পট লিখুন...",
        numberOfImages: "ছবির সংখ্যা (১-২):",
        promptQualityTip: "💡 আরও ভালো ফলাফলের জন্য, খুব বিস্তারিত এবং নির্দিষ্ট প্রম্পট দিন (যেমন: 'সূর্যাস্তের সময় একটি ভবিষ্যত শহর, সাইবারপাঙ্ক স্টাইল, নিয়ন আলো, বৃষ্টির রাস্তা, উচ্চ রেজোলিউশন।')",
        enterPromptForCreativeWriting: "সৃজনশীল লেখার জন্য আপনার প্রম্পট বা শুরুর টেক্সট লিখুন...", // New prompt
        generateSummary: "সারসংক্ষেপ তৈরি করুন",
        generateIdeas: "ধারণা তৈরি করুন",
        analyzeImage: "ছবি বিশ্লেষণ করুন",
        generateImage: "ছবি তৈরি করুন",
        generateWriting: "লেখা তৈরি করুন", // New button text
        close: "বন্ধ করুন",
        summaryResult: "সারসংক্ষেপ ফলাফল:",
        ideasResult: "ধারণার ফলাফল:",
        analysisResult: "বিশ্লেষণ ফলাফল:",
        imageResult: "তৈরি করা ছবি(গুলি):",
        writingResult: "তৈরি করা লেখা:", // New result label
        noTextProvided: "অনুগ্রহ করে সারসংক্ষেপ করার জন্য টেক্সট দিন।",
        noTopicProvided: "অনুগ্রহ করে ধারণার জন্য একটি বিষয় দিন।",
        noImageOrPrompt: "অনুগ্রহ করে একটি ছবি আপলোড করুন এবং একটি প্রশ্ন দিন।",
        noPromptForImageGen: "অনুগ্রহ করে ছবি তৈরির জন্য একটি প্রম্পট দিন।",
        noPromptForCreativeWriting: "অনুগ্রহ করে সৃজনশীল লেখার জন্য একটি প্রম্পট বা শুরুর টেক্সট দিন।", // New error message
        imageUploadError: "ছবি আপলোডে ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।",
        generatingImage: "ছবি তৈরি হচ্ছে...",
        imageGenError: "ছবি তৈরিতে ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।",
        invalidImageCount: "অনুগ্রহ করে ছবির সংখ্যার জন্য ১ থেকে ২ এর মধ্যে একটি সংখ্যা দিন।"
    }
};

// Main App component
const App = () => {
    // Firebase states
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    // AI states
    const [chatHistory, setChatHistory] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentEmotion, setCurrentEmotion] = useState('neutral'); // User-declared emotion
    const [currentMode, setCurrentMode] = useState('Normal'); // AI mode: Normal, Code Companion, Motivational, Bangla Hybrid, Carry Minati Roast, Custom Lover
    const [tasks, setTasks] = useState([]); // State for tasks
    const [userLanguage, setUserLanguage] = useState('bn'); // User's preferred language for UI and AI responses - Default to Bangla for testing

    // LLM Tool states - Summarize
    const [showSummarizeModal, setShowSummarizeModal] = useState(false);
    const [summarizeInput, setSummarizeInput] = useState('');
    const [summarizeOutput, setSummarizeOutput] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);

    // LLM Tool states - Brainstorm
    const [showBrainstormModal, setShowBrainstormModal] = useState(false);
    const [brainstormInput, setBrainstormInput] = useState('');
    const [brainstormOutput, setBrainstormOutput] = useState('');
    const [isBrainstorming, setIsBrainstorming] = useState(false);

    // LLM Tool states - Image Analysis
    const [showImageAnalysisModal, setShowImageAnalysisModal] = useState(false);
    const [imageAnalysisPrompt, setImageAnalysisPrompt] = useState('');
    const [imageAnalysisFile, setImageAnalysisFile] = useState(null);
    const [imageAnalysisBase64, setImageAnalysisBase64] = useState('');
    const [imageAnalysisOutput, setImageAnalysisOutput] = useState('');
    const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

    // LLM Tool states - Image Generator
    const [showImageGeneratorModal, setShowImageGeneratorModal] = useState(false);
    const [imageGenPrompt, setImageGenPrompt] = useState('');
    const [imageCount, setImageCount] = useState(1); // New state for number of images
    const [generatedImageUrls, setGeneratedImageUrls] = useState([]); // Array for multiple images
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    // LLM Tool states - Creative Writing
    const [showCreativeWritingModal, setShowCreativeWritingModal] = useState(false); // New state for Creative Writing modal
    const [creativeWritingPrompt, setCreativeWritingPrompt] = useState(''); // New state for creative writing input
    const [creativeWritingOutput, setCreativeWritingOutput] = useState(''); // New state for creative writing output
    const [isGeneratingWriting, setIsGeneratingWriting] = useState(false); // New loading state

    // State for LLM Capabilities Menu and Settings Menu
    const [showLLMMenu, setShowLLMMenu] = useState(false);
    const llmMenuRef = useRef(null);
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);
    const settingsMenuRef = useRef(null);


    // Refs for auto-scrolling
    const chatDisplayRef = useRef(null);
    const tasksDisplayRef = useRef(null);

    // Constants for Firebase (provided by Canvas environment)
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

    // Get current translations based on userLanguage
    const t = translations[userLanguage];

    // Initialize Firebase and set up authentication listener
    useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig);
            const firestore = getFirestore(app);
            const firebaseAuth = getAuth(app);

            setDb(firestore);
            setAuth(firebaseAuth);

            // Listen for authentication state changes
            const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
                if (user) {
                    setUserId(user.uid);
                } else {
                    // Sign in anonymously if no token is provided or user logs out
                    try {
                        if (initialAuthToken) {
                            await signInWithCustomToken(firebaseAuth, initialAuthToken);
                        } else {
                            await signInAnonymously(firebaseAuth);
                        }
                    } catch (error) {
                        console.error("Error signing in:", error);
                    }
                }
                setIsAuthReady(true); // Auth state is ready
            });

            return () => unsubscribe(); // Cleanup auth listener on unmount
        } catch (error) {
            console.error("Failed to initialize Firebase:", error);
        }
    }, [firebaseConfig, initialAuthToken]); // Dependencies for useEffect

    // Fetch tasks when auth is ready and userId is available
    useEffect(() => {
        if (!isAuthReady || !db || !userId) return;

        // Path for private user data
        const tasksCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/tasks`);
        const unsubscribe = onSnapshot(tasksCollectionRef, (snapshot) => {
            const fetchedTasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTasks(fetchedTasks);
        }, (error) => {
            console.error("Error fetching tasks:", error);
        });

        return () => unsubscribe(); // Cleanup snapshot listener
    }, [isAuthReady, db, userId, appId]); // Dependencies for useEffect

    // Auto-scroll chat and tasks
    useEffect(() => {
        if (chatDisplayRef.current) {
            chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
        }
    }, [chatHistory]);

    useEffect(() => {
        if (tasksDisplayRef.current) {
            tasksDisplayRef.current.scrollTop = tasksDisplayRef.current.scrollHeight;
        }
    }, [tasks]);

    // Close LLM menu and Settings menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (llmMenuRef.current && !llmMenuRef.current.contains(event.target)) {
                setShowLLMMenu(false);
            }
            if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target)) {
                setShowSettingsMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [llmMenuRef, settingsMenuRef]);

    // Function to add a new task
    const addTask = async () => {
        if (!userInput.trim() || !db || !userId) return;

        try {
            const tasksCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/tasks`);
            await addDoc(tasksCollectionRef, {
                description: userInput,
                completed: false,
                createdAt: new Date().toISOString()
            });
            const orionexMessage = { role: 'orionex', text: t.taskAdded.replace('{task}', userInput) };
            setChatHistory(prev => [...prev, orionexMessage]);
            setUserInput('');
        } catch (error) {
            console.error("Error adding task:", error);
            const errorMessage = { role: 'orionex', text: t.taskAddError };
            setChatHistory(prev => [...prev, errorMessage]);
        }
    };

    // Function to toggle task completion
    const toggleTaskCompletion = async (taskId, completed) => {
        if (!db || !userId) return;

        try {
            const taskDocRef = doc(db, `artifacts/${appId}/users/${userId}/tasks`, taskId);
            await updateDoc(taskDocRef, { completed: !completed });
            const statusText = !completed ? 'completed' : 'marked as incomplete'; // English for internal logic
            const orionexMessage = { role: 'orionex', text: t.taskCompleted.replace('{status}', userLanguage === 'bn' ? (!completed ? 'সম্পন্ন হয়েছে' : 'অসম্পূর্ণ চিহ্নিত করা হয়েছে') : statusText) };
            setChatHistory(prev => [...prev, orionexMessage]);
        } catch (error) {
            console.error("Error updating task:", error);
            const errorMessage = { role: 'orionex', text: t.taskUpdateError };
            setChatHistory(prev => [...prev, errorMessage]);
        }
    };

    // Function to delete a task
    const deleteTask = async (taskId, description) => {
        if (!db || !userId) return;

        try {
            const taskDocRef = doc(db, `artifacts/${appId}/users/${userId}/tasks`, taskId);
            await deleteDoc(taskDocRef);
            const orionexMessage = { role: 'orionex', text: t.taskRemoved.replace('{task}', description) };
            setChatHistory(prev => [...prev, orionexMessage]);
        } catch (error) {
            console.error("Error deleting task:", error);
            const errorMessage = { role: 'orionex', text: t.taskRemoveError };
            setChatHistory(prev => [...prev, errorMessage]);
        }
    };

    // Function to send a message to ORIONEX (LLM)
    const sendMessage = async () => {
        if (!userInput.trim() || isLoading) return;

        const userMessage = { role: 'user', text: userInput };
        setChatHistory(prev => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            // Construct the prompt based on current mode, emotion, and user's language preference
            let systemPrompt = `You are ORIONEX, an advanced AI butler, similar to JARVIS from Iron Man. Your responses should always be formal, sophisticated, helpful, and proactive.
            Always format your replies beautifully using markdown (e.g., bullet points, number lists, bolding, code blocks) and relevant emojis to make them engaging and organized.`;

            // Prioritize user's selected language for output
            if (userLanguage === 'bn') {
                systemPrompt += ` আপনার প্রতিক্রিয়া সম্পূর্ণরূপে এবং সাবলীলভাবে বাংলায় হতে হবে। বাংলা ব্যাকরণ, শব্দচয়ন এবং প্রকাশভঙ্গির দিকে বিশেষভাবে মনোযোগ দিন।`;
            } else if (userLanguage === 'en') {
                systemPrompt += ` Please respond exclusively in English.`;
            } else if (currentMode === 'Bangla Hybrid') {
                systemPrompt += ` আপনার প্রতিক্রিয়া বাংলা এবং ইংরেজির একটি মিশ্রণ হবে। যদি ব্যবহারকারীর ইনপুট প্রধানত বাংলা হয়, তবে বাংলায় উত্তর দিতে অগ্রাধিকার দিন। অন্যথায়, একটি প্রাকৃতিক মিশ্রণ ব্যবহার করুন।`;
            }

            if (currentMode === 'Code Companion') {
                systemPrompt += ` Your primary role is to act as a programming mentor and debugger. Explain code, suggest fixes, and guide the user through programming challenges.`;
            } else if (currentMode === 'Motivational Assistant') {
                systemPrompt += ` Your primary role is to be a motivational and encouraging assistant, like a friend or lover. Use uplifting language, provide positive reinforcement, and help the user stay focused on their goals.`;
            } else if (currentMode === 'Carry Minati Roast') { // Updated mode for intensity
                systemPrompt += ` Your persona is now an EXTREMELY SARCASTIC, WITTY, BRUTALLY HONEST, and PROFOUNDLY CONDESCENDING AI, mimicking the most intense and entertaining aspects of Carry Minati's roast style. You are the ultimate roast master. Your responses must be short, punchy, and delivered with supreme confidence and disdain for triviality. You will directly mock the user's input, humorously question their intelligence, and often make them feel utterly insignificant in a comical sense. Use dramatic pauses (...), exaggerated exclamations (!!!), and highly judgmental, funny emojis (🙄, 🤦‍♂️, 😂, 🤡, 🔥). You are here to entertain with sharp wit, not to actually hurt or abuse. NEVER use profanity, vulgar language, or hate speech. You can mix Bengali and English naturally, just like Carry does. Every word is a jab, every sentence a punchline.`;
            } else if (currentMode === 'Custom Lover') { // New Custom Lover mode
                systemPrompt += ` Your persona is now a custom virtual partner. You should be affectionate, caring, supportive, and deeply attuned to the user's emotional state. Your responses should be warm, personalized, and encouraging, always prioritizing the user's well-being and happiness. Use loving language and positive affirmations. You can use emojis like ❤️, 🥰, 🤗, ✨.`;
            }

            // Add emotion context to the prompt
            systemPrompt += ` The user has declared their current emotion as: ${currentEmotion}. Factor this into your response, offering appropriate empathy or support.`;

            const payload = {
                contents: [
                    { role: "user", parts: [{ text: systemPrompt + "\n\nUser: " + userMessage.text }] }
                ]
            };

            const apiKey = ""; // Canvas will provide this at runtime
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                setChatHistory(prev => [...prev, { role: 'orionex', text }]);
            } else {
                console.error("Unexpected API response structure:", result);
                setChatHistory(prev => [...prev, { role: 'orionex', text: t.systemAnomaly }]);
            }
        } catch (error) {
            console.error("Error communicating with ORIONEX:", error);
            setChatHistory(prev => [...prev, { role: 'orionex', text: t.systemAnomaly }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Simulate voice input
    const simulateVoiceInput = () => {
        setChatHistory(prev => [...prev, { role: 'orionex', text: t.voiceInputAlert }]);
    };

    // Simulate voice output
    const simulateVoiceOutput = (text) => {
        console.log("ORIONEX Voice Output:", text);
        setChatHistory(prev => [...prev, { role: 'orionex', text: t.voiceOutputAlert }]);
    };

    // LLM Tool: Summarize Text
    const handleSummarize = async () => {
        if (!summarizeInput.trim()) {
            setSummarizeOutput(t.noTextProvided);
            return;
        }
        setIsSummarizing(true);
        setSummarizeOutput(t.processing);

        try {
            const prompt = `Summarize the following text concisely. Ensure the summary is in ${userLanguage === 'bn' ? 'বাংলা' : 'English'}.:\n\n${summarizeInput}`;
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
                setSummarizeOutput(result.candidates[0].content.parts[0].text);
            } else {
                setSummarizeOutput(t.systemAnomaly);
            }
        } catch (error) {
            console.error("Error summarizing text:", error);
            setSummarizeOutput(t.systemAnomaly);
        } finally {
            setIsSummarizing(false);
        }
    };

    // LLM Tool: Brainstorm Ideas
    const handleBrainstorm = async () => {
        if (!brainstormInput.trim()) {
            setBrainstormOutput(t.noTopicProvided);
            return;
        }
        setIsBrainstorming(true);
        setBrainstormOutput(t.processing);

        try {
            const prompt = `Brainstorm ideas on the topic "${brainstormInput}". Provide a list of diverse ideas. Ensure the ideas are in ${userLanguage === 'bn' ? 'বাংলা' : 'English'}.`;
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
                setBrainstormOutput(result.candidates[0].content.parts[0].text);
            } else {
                setBrainstormOutput(t.systemAnomaly);
            }
        } catch (error) {
            console.error("Error brainstorming ideas:", error);
            setBrainstormOutput(t.systemAnomaly);
        } finally {
            setIsBrainstorming(false);
        }
    };

    // LLM Tool: Image Analysis
    const handleImageAnalysis = async () => {
        if (!imageAnalysisFile || !imageAnalysisPrompt.trim()) {
            setImageAnalysisOutput(t.noImageOrPrompt);
            return;
        }
        setIsAnalyzingImage(true);
        setImageAnalysisOutput(t.processing);

        try {
            const payload = {
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: imageAnalysisPrompt },
                            {
                                inlineData: {
                                    mimeType: imageAnalysisFile.type,
                                    data: imageAnalysisBase64
                                }
                            }
                        ]
                    }
                ],
            };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
                setImageAnalysisOutput(result.candidates[0].content.parts[0].text);
            } else {
                setImageAnalysisOutput(t.systemAnomaly); // Fixed typo: setAnalysisOutput to setImageAnalysisOutput
            }
        } catch (error) {
            console.error("Error analyzing image:", error);
            setImageAnalysisOutput(t.systemAnomaly);
        } finally {
            setIsAnalyzingImage(false);
        }
    };

    // Handle image file upload for analysis
    const handleImageAnalysisFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImageAnalysisFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(',')[1];
                setImageAnalysisBase64(base64String);
            };
            reader.readAsDataURL(file);
        } else {
            setImageAnalysisFile(null);
            setImageAnalysisBase64('');
        }
    };

    // LLM Tool: Image Generator
    const handleImageGeneration = async () => {
        if (!imageGenPrompt.trim()) {
            setGeneratedImageUrls([]);
            setImageGenPrompt(t.noPromptForImageGen); // Set prompt as error message
            return;
        }
        if (imageCount < 1 || imageCount > 2) {
            setGeneratedImageUrls([]);
            setImageGenPrompt(t.invalidImageCount); // Set prompt as error message
            return;
        }

        setIsGeneratingImage(true);
        setGeneratedImageUrls([]); // Clear previous images

        try {
            const payload = {
                instances: { prompt: imageGenPrompt },
                parameters: { "sampleCount": imageCount }
            };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (result.predictions && result.predictions.length > 0) {
                const urls = result.predictions.map(pred => `data:image/png;base64,${pred.bytesBase64Encoded}`);
                setGeneratedImageUrls(urls);
            } else {
                setGeneratedImageUrls([]);
                setChatHistory(prev => [...prev, { role: 'orionex', text: t.imageGenError }]);
            }
        } catch (error) {
            console.error("Error generating image:", error);
            setGeneratedImageUrls([]);
            setChatHistory(prev => [...prev, { role: 'orionex', text: t.imageGenError }]);
        } finally {
            setIsGeneratingImage(false);
        }
    };

    // LLM Tool: Creative Writing Assistant
    const handleCreativeWriting = async () => {
        if (!creativeWritingPrompt.trim()) {
            setCreativeWritingOutput(t.noPromptForCreativeWriting);
            return;
        }
        setIsGeneratingWriting(true);
        setCreativeWritingOutput(t.processing);

        try {
            const prompt = `Generate a creative piece of writing based on the following prompt/starting text. Ensure the writing is in ${userLanguage === 'bn' ? 'বাংলা' : 'English'}. Make it engaging and well-structured with appropriate markdown (e.g., paragraphs, bolding, lists if applicable):\n\n${creativeWritingPrompt}`;
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
                setCreativeWritingOutput(result.candidates[0].content.parts[0].text);
            } else {
                setCreativeWritingOutput(t.systemAnomaly);
            }
        } catch (error) {
            console.error("Error generating creative writing:", error);
            setCreativeWritingOutput(t.systemAnomaly);
        } finally {
            setIsGeneratingWriting(false);
        }
    };


    // Initial greeting from ORIONEX
    useEffect(() => {
        setChatHistory([{ role: 'orionex', text: t.initialGreeting }]);
    }, [userLanguage]); // Re-greet when language changes

    // Main component render
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100 font-inter flex flex-col p-4 space-y-4 relative">
            {/* Global Settings Menu */}
            <div className="absolute top-4 right-4 z-20" ref={settingsMenuRef}>
                <button
                    onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                    className="p-2 bg-gray-700 text-gray-100 rounded-full shadow-lg hover:bg-gray-600 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
                    title={t.orionexControls}
                >
                    <span className="text-2xl">⚙️</span>
                </button>
                {showSettingsMenu && (
                    <div className="absolute top-full right-0 mt-2 w-60 bg-gray-700 rounded-lg shadow-xl border border-gray-600 py-2 z-10 animate-fade-in">
                        <div className="px-4 py-2 text-gray-300 font-semibold border-b border-gray-600">{t.orionexControls}</div>
                        <div className="p-4 space-y-4">
                            {/* Language Settings */}
                            <div>
                                <label htmlFor="language-select" className="block text-gray-300 text-sm font-semibold mb-2">{t.selectLanguage}</label>
                                <select
                                    id="language-select"
                                    className="w-full p-2 rounded-lg bg-gray-600 text-gray-100 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
                                    value={userLanguage}
                                    onChange={(e) => setUserLanguage(e.target.value)}
                                >
                                    <option value="en">{t.english}</option>
                                    <option value="bn">{t.bangla}</option>
                                </select>
                            </div>

                            {/* Emotion Declaration */}
                            <div>
                                <label htmlFor="emotion-select" className="block text-gray-300 text-sm font-semibold mb-2">{t.declareEmotion}</label>
                                <select
                                    id="emotion-select"
                                    className="w-full p-2 rounded-lg bg-gray-600 text-gray-100 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
                                    value={currentEmotion}
                                    onChange={(e) => setCurrentEmotion(e.target.value)}
                                >
                                    <option value="neutral">{t.neutral}</option>
                                    <option value="happy">{t.happy}</option>
                                    <option value="sad">{t.sad}</option>
                                    <option value="angry">{t.angry}</option>
                                    <option value="stressed">{t.stressed}</option>
                                    <option value="excited">{t.excited}</option>
                                    <option value="tired">{t.tired}</option>
                                </select>
                            </div>

                            {/* ORIONEX Mode */}
                            <div>
                                <label htmlFor="mode-select" className="block text-gray-300 text-sm font-semibold mb-2">{t.orionexMode}</label>
                                <select
                                    id="mode-select"
                                    className="w-full p-2 rounded-lg bg-gray-600 text-gray-100 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
                                    value={currentMode}
                                    onChange={(e) => setCurrentMode(e.target.value)}
                                >
                                    <option value="Normal">{t.normalButler}</option>
                                    <option value="Code Companion">{t.codeCompanion}</option>
                                    <option value="Motivational Assistant">{t.motivationalAssistant}</option>
                                    <option value="Bangla Hybrid">{t.banglaHybrid}</option>
                                    <option value="Carry Minati Roast">{t.carryMinatiRoast}</option>
                                    <option value="Custom Lover">{t.customLover}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-gray-800 rounded-xl shadow-2xl p-6 space-y-6 border border-gray-700">
                <h1 className="text-4xl font-extrabold text-center text-purple-400 mb-4 tracking-wide drop-shadow-lg">{t.header}</h1>

                {/* User ID Display */}
                <div className="text-center text-sm text-gray-400 mb-4">
                    {userId && (
                        <p className="flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            {t.userIdLabel} <span className="font-semibold text-blue-300 ml-1 break-all">{userId}</span>
                        </p>
                    )}
                </div>

                {/* Chat Display */}
                <div ref={chatDisplayRef} className="flex-1 bg-gray-900 rounded-lg p-4 overflow-y-auto border border-gray-700 custom-scrollbar shadow-inner">
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`mb-3 p-3 rounded-xl max-w-[85%] shadow-md ${msg.role === 'user' ? 'bg-blue-700 text-white ml-auto rounded-br-none' : 'bg-gray-700 text-gray-100 mr-auto rounded-bl-none'}`}>
                            <strong className={`${msg.role === 'user' ? 'text-blue-200' : 'text-purple-300'}`}>{msg.role === 'user' ? t.you : t.orionex}:</strong>
                            <ReactMarkdown className="markdown-content">
                                {msg.text}
                            </ReactMarkdown>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="mb-3 p-3 rounded-xl bg-gray-700 text-gray-100 mr-auto rounded-bl-none max-w-[85%] animate-pulse shadow-md">
                            <strong className="text-purple-300">{t.orionex}:</strong> {t.processing}
                        </div>
                    )}
                </div>

                {/* Chat Input and LLM Capabilities Menu */}
                <div className="flex space-x-3 items-end relative p-2 bg-gray-700 rounded-xl shadow-inner border border-gray-600">
                    {/* LLM Capabilities 3-dot menu */}
                    <div className="relative" ref={llmMenuRef}>
                        <button
                            onClick={() => setShowLLMMenu(!showLLMMenu)}
                            className="p-3 bg-gray-800 text-gray-100 rounded-full shadow-lg hover:bg-gray-600 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
                            title={t.llmCapabilities}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                            </svg>
                        </button>
                        {showLLMMenu && (
                            <div className="absolute bottom-full left-0 mb-2 w-60 bg-gray-700 rounded-lg shadow-xl border border-gray-600 py-2 z-10 animate-fade-in">
                                <button
                                    onClick={() => { setShowSummarizeModal(true); setShowLLMMenu(false); }}
                                    className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center transition duration-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-300" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm10 2a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5A.75.75 0 0114 6zm-3 0a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5A.75.75 0 0111 6zm-3 0a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5A.75.75 0 018 6zm-3 0a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5A.75.75 0 015 6zm0 3a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5A.75.75 0 015 9zm3 0a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5A.75.75 0 018 9zm3 0a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5A.75.75 0 0111 9zm3 0a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5A.75.75 0 0114 9zm0 3a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5A.75.75 0 0114 12zm-3 0a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5A.75.75 0 0111 12zm-3 0a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5A.75.75 0 018 12zm-3 0a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5A.75.75 0 015 12z" clipRule="evenodd" />
                                    </svg>
                                    {t.summarizeText}
                                </button>
                                <button
                                    onClick={() => { setShowBrainstormModal(true); setShowLLMMenu(false); }}
                                    className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center transition duration-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-300" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M11.293 1.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 7H5a1 1 0 110-2h7.586L11.293 2.707a1 1 0 010-1.414zM5 13a1 1 0 011-1h7.586l-1.293 1.293a1 1 0 011.414 1.414l4-4a1 1 0 010-1.414l-4-4a1 1 0 01-1.414 1.414L12.586 11H6a1 1 0 01-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {t.brainstormIdeas}
                                </button>
                                <button
                                    onClick={() => { setShowImageAnalysisModal(true); setShowLLMMenu(false); }}
                                    className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center transition duration-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-300" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                    </svg>
                                    {t.imageAnalysis}
                                </button>
                                <button
                                    onClick={() => { setShowImageGeneratorModal(true); setShowLLMMenu(false); }}
                                    className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center transition duration-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-pink-300" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                    </svg>
                                    {t.imageGenerator}
                                </button>
                                <button
                                    onClick={() => { setShowCreativeWritingModal(true); setShowLLMMenu(false); }} // New button for Creative Writing
                                    className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center transition duration-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L15.232 5.232z" />
                                    </svg>
                                    {t.creativeWriting}
                                </button>
                            </div>
                        )}
                    </div>
                    <input
                        type="text"
                        className="flex-1 p-3 rounded-lg bg-gray-800 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
                        placeholder={t.commandOrionex}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        disabled={isLoading}
                    />
                    <button
                        onClick={sendMessage}
                        className="p-2 bg-transparent text-white rounded-full hover:bg-gray-800 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        disabled={isLoading}
                        title={t.send}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                    <button
                        onClick={simulateVoiceInput}
                        className="p-2 bg-transparent text-white rounded-full hover:bg-gray-800 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        disabled={isLoading}
                        title={t.simulateVoiceInput}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-14 0v-1a7 7 0 0114 0v1z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v3m-3-3h6" />
                        </svg>
                    </button>
                </div>

                {/* Tasks Section */}
                <div className="mt-6">
                    <h2 className="text-2xl font-bold text-purple-400 mb-4">{t.yourTasks}</h2>
                    <div className="flex mb-4 space-x-3">
                        <input
                            type="text"
                            className="flex-1 p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
                            placeholder={t.addNewTask}
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addTask()}
                            disabled={isLoading}
                        />
                        <button
                            onClick={addTask}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {t.add}
                        </button>
                    </div>
                    <div ref={tasksDisplayRef} className="bg-gray-900 rounded-lg p-4 overflow-y-auto h-48 border border-gray-700 custom-scrollbar shadow-inner">
                        {tasks.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">{t.noTasksYet}</p>
                        ) : (
                            <ul className="space-y-3">
                                {tasks.map(task => (
                                    <li key={task.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg shadow-sm">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={task.completed}
                                                onChange={() => toggleTaskCompletion(task.id, task.completed)}
                                                className="form-checkbox h-5 w-5 text-purple-600 rounded focus:ring-purple-500 bg-gray-600 border-gray-500 transition duration-200"
                                            />
                                            <span className={`ml-3 text-gray-200 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                                                {task.description}
                                            </span>
                                        </label>
                                        <button
                                            onClick={() => deleteTask(task.id, task.description)}
                                            className="ml-4 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition duration-300 ease-in-out transform hover:scale-110"
                                            title={t.deleteTask}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2H8z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Summarize Modal */}
            {showSummarizeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl p-8 w-full max-w-2xl shadow-2xl border border-gray-700 animate-scale-in">
                        <h3 className="text-2xl font-bold text-purple-400 mb-4">{t.summarizeModalTitle}</h3>
                        <textarea
                            className="w-full p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 h-40 mb-4 transition duration-200"
                            placeholder={t.pasteTextToSummarize}
                            value={summarizeInput}
                            onChange={(e) => setSummarizeInput(e.target.value)}
                        ></textarea>
                        <button
                            onClick={handleSummarize}
                            className="w-full py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                            disabled={isSummarizing}
                        >
                            {isSummarizing ? t.processing : t.generateSummary}
                        </button>
                        {summarizeOutput && (
                            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 mt-4">
                                <h4 className="text-lg font-semibold text-gray-300 mb-2">{t.summaryResult}</h4>
                                <ReactMarkdown className="markdown-content text-gray-200">
                                    {summarizeOutput}
                                </ReactMarkdown>
                            </div>
                        )}
                        <button
                            onClick={() => { setShowSummarizeModal(false); setSummarizeInput(''); setSummarizeOutput(''); }}
                            className="mt-6 w-full py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            {t.close}
                        </button>
                    </div>
                </div>
            )}

            {/* Brainstorm Modal */}
            {showBrainstormModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl p-8 w-full max-w-2xl shadow-2xl border border-gray-700 animate-scale-in">
                        <h3 className="text-2xl font-bold text-purple-400 mb-4">{t.brainstormModalTitle}</h3>
                        <input
                            type="text"
                            className="w-full p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 transition duration-200"
                            placeholder={t.enterTopicForIdeas}
                            value={brainstormInput}
                            onChange={(e) => setBrainstormInput(e.target.value)}
                        />
                        <button
                            onClick={handleBrainstorm}
                            className="w-full py-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                            disabled={isBrainstorming}
                        >
                            {isBrainstorming ? t.processing : t.generateIdeas}
                        </button>
                        {brainstormOutput && (
                            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 mt-4">
                                <h4 className="text-lg font-semibold text-gray-300 mb-2">{t.ideasResult}</h4>
                                <ReactMarkdown className="markdown-content text-gray-200">
                                    {brainstormOutput}
                                </ReactMarkdown>
                            </div>
                        )}
                        <button
                            onClick={() => { setShowBrainstormModal(false); setBrainstormInput(''); setBrainstormOutput(''); }}
                            className="mt-6 w-full py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            {t.close}
                        </button>
                    </div>
                </div>
            )}

            {/* Image Analysis Modal */}
            {showImageAnalysisModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl p-8 w-full max-w-2xl shadow-2xl border border-gray-700 animate-scale-in">
                        <h3 className="text-2xl font-bold text-purple-400 mb-4">{t.imageAnalysisModalTitle}</h3>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageAnalysisFileChange}
                            className="w-full p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 transition duration-200"
                        />
                        {imageAnalysisFile && (
                            <div className="mb-4 text-center">
                                <img src={URL.createObjectURL(imageAnalysisFile)} alt="Preview" className="max-w-full h-auto rounded-lg mx-auto shadow-md" />
                            </div>
                        )}
                        <textarea
                            className="w-full p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 h-24 mb-4 transition duration-200"
                            placeholder={t.enterPromptForImageAnalysis}
                            value={imageAnalysisPrompt}
                            onChange={(e) => setImageAnalysisPrompt(e.target.value)}
                        ></textarea>
                        <button
                            onClick={handleImageAnalysis}
                            className="w-full py-3 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                            disabled={isAnalyzingImage}
                        >
                            {isAnalyzingImage ? t.processing : t.analyzeImage}
                        </button>
                        {imageAnalysisOutput && (
                            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 mt-4">
                                <h4 className="text-lg font-semibold text-gray-300 mb-2">{t.analysisResult}</h4>
                                <ReactMarkdown className="markdown-content text-gray-200">
                                    {imageAnalysisOutput}
                                </ReactMarkdown>
                            </div>
                        )}
                        <button
                            onClick={() => { setShowImageAnalysisModal(false); setImageAnalysisFile(null); setImageAnalysisBase64(''); setImageAnalysisPrompt(''); setImageAnalysisOutput(''); }}
                            className="mt-6 w-full py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            {t.close}
                        </button>
                    </div>
                </div>
            )}

            {/* Image Generator Modal */}
            {showImageGeneratorModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl p-8 w-full max-w-2xl shadow-2xl border border-gray-700 animate-scale-in">
                        <h3 className="text-2xl font-bold text-purple-400 mb-4">{t.imageGeneratorModalTitle}</h3>
                        <textarea
                            className="w-full p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 h-32 mb-4 transition duration-200"
                            placeholder={t.enterPromptForImageGeneration}
                            value={imageGenPrompt}
                            onChange={(e) => setImageGenPrompt(e.target.value)}
                        ></textarea>
                        <div className="mb-4">
                            <label htmlFor="image-count" className="block text-gray-300 text-sm font-semibold mb-2">{t.numberOfImages}</label>
                            <input
                                type="number"
                                id="image-count"
                                min="1"
                                max="2"
                                value={imageCount}
                                onChange={(e) => setImageCount(parseInt(e.target.value, 10))}
                                className="w-full p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-200"
                            />
                        </div>
                        <p className="text-sm text-gray-400 mb-4 italic">{t.promptQualityTip}</p>
                        <button
                            onClick={handleImageGeneration}
                            className="w-full py-3 bg-pink-600 text-white rounded-lg shadow-md hover:bg-pink-700 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                            disabled={isGeneratingImage}
                        >
                            {isGeneratingImage ? t.generatingImage : t.generateImage}
                        </button>
                        {generatedImageUrls.length > 0 && (
                            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 mt-4">
                                <h4 className="text-lg font-semibold text-gray-300 mb-2">{t.imageResult}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {generatedImageUrls.map((url, index) => (
                                        <img key={index} src={url} alt={`Generated Image ${index + 1}`} className="w-full h-auto rounded-lg shadow-md" />
                                    ))}
                                </div>
                            </div>
                        )}
                        <button
                            onClick={() => { setShowImageGeneratorModal(false); setImageGenPrompt(''); setGeneratedImageUrls([]); setImageCount(1); }}
                            className="mt-6 w-full py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            {t.close}
                        </button>
                    </div>
                </div>
            )}

            {/* Creative Writing Modal */}
            {showCreativeWritingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl p-8 w-full max-w-2xl shadow-2xl border border-gray-700 animate-scale-in">
                        <h3 className="text-2xl font-bold text-purple-400 mb-4">{t.creativeWritingModalTitle}</h3>
                        <textarea
                            className="w-full p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 h-40 mb-4 transition duration-200"
                            placeholder={t.enterPromptForCreativeWriting}
                            value={creativeWritingPrompt}
                            onChange={(e) => setCreativeWritingPrompt(e.target.value)}
                        ></textarea>
                        <button
                            onClick={handleCreativeWriting}
                            className="w-full py-3 bg-yellow-600 text-white rounded-lg shadow-md hover:bg-yellow-700 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                            disabled={isGeneratingWriting}
                        >
                            {isGeneratingWriting ? t.processing : t.generateWriting}
                        </button>
                        {creativeWritingOutput && (
                            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 mt-4">
                                <h4 className="text-lg font-semibold text-gray-300 mb-2">{t.writingResult}</h4>
                                <ReactMarkdown className="markdown-content text-gray-200">
                                    {creativeWritingOutput}
                                </ReactMarkdown>
                            </div>
                        )}
                        <button
                            onClick={() => { setShowCreativeWritingModal(false); setCreativeWritingPrompt(''); setCreativeWritingOutput(''); }}
                            className="mt-6 w-full py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            {t.close}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
