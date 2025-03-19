
// Information about Indian currency notes
export type CurrencyNote = {
  value: number;
  name: string;
  description: string;
  color: string;
  features: string[];
  dimensions: {
    width: number;
    height: number;
  };
  tailwindColor: string;
};

export const indianCurrencyNotes: CurrencyNote[] = [
  {
    value: 10,
    name: "Ten Rupees",
    description: "Ten Rupee note, chocolate brown color, featuring the Konark Sun Temple on the reverse",
    color: "chocolate brown",
    features: ["Konark Sun Temple", "Mahatma Gandhi portrait"],
    dimensions: { width: 123, height: 63 },
    tailwindColor: "bg-currency-orange"
  },
  {
    value: 20,
    name: "Twenty Rupees",
    description: "Twenty Rupee note, greenish-yellow color, featuring the Ellora Caves on the reverse",
    color: "greenish-yellow",
    features: ["Ellora Caves", "Mahatma Gandhi portrait"],
    dimensions: { width: 129, height: 63 },
    tailwindColor: "bg-yellow-600"
  },
  {
    value: 50,
    name: "Fifty Rupees",
    description: "Fifty Rupee note, fluorescent blue color, featuring Hampi with Chariot on the reverse",
    color: "fluorescent blue",
    features: ["Hampi with Chariot", "Mahatma Gandhi portrait"],
    dimensions: { width: 135, height: 66 },
    tailwindColor: "bg-currency-blue"
  },
  {
    value: 100,
    name: "One Hundred Rupees",
    description: "One Hundred Rupee note, lavender color, featuring Rani Ki Vav on the reverse",
    color: "lavender",
    features: ["Rani Ki Vav (Queen's Stepwell)", "Mahatma Gandhi portrait"],
    dimensions: { width: 142, height: 66 },
    tailwindColor: "bg-currency-purple"
  },
  {
    value: 200,
    name: "Two Hundred Rupees",
    description: "Two Hundred Rupee note, bright yellow color, featuring Sanchi Stupa on the reverse",
    color: "bright yellow",
    features: ["Sanchi Stupa", "Mahatma Gandhi portrait"],
    dimensions: { width: 146, height: 66 },
    tailwindColor: "bg-yellow-500"
  },
  {
    value: 500,
    name: "Five Hundred Rupees",
    description: "Five Hundred Rupee note, stone grey color, featuring Red Fort on the reverse",
    color: "stone grey",
    features: ["Red Fort", "Mahatma Gandhi portrait"],
    dimensions: { width: 150, height: 66 },
    tailwindColor: "bg-gray-500"
  },
  {
    value: 2000,
    name: "Two Thousand Rupees",
    description: "Two Thousand Rupee note, magenta color, featuring Mangalyaan (Mars Orbiter Mission) on the reverse",
    color: "magenta",
    features: ["Mangalyaan (Mars Orbiter Mission)", "Mahatma Gandhi portrait"],
    dimensions: { width: 166, height: 66 },
    tailwindColor: "bg-pink-600"
  }
];

// Helper function to get currency note details by value
export const getCurrencyById = (value: number): CurrencyNote | undefined => {
  return indianCurrencyNotes.find(note => note.value === value);
};

// Descriptive messages for the app interactions
export const appMessages = {
  welcome: "Welcome to Currency Detector. Position an Indian currency note within the frame and hold steady for detection.",
  instructions: "Double tap anywhere to detect the currency note. Swipe right for instructions. Swipe left to adjust settings.",
  detectionInProgress: "Analyzing currency note...",
  detectionSuccess: "Currency detected:",
  detectionFailed: "Could not detect any currency. Please try again.",
  cameraPermissionNeeded: "Camera access is required to detect currency notes.",
  cameraNotAvailable: "Camera is not available on this device.",
  loading: "Loading currency detection model..."
};
