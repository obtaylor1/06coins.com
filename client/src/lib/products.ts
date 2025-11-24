import callisImg from "@assets/Henry Arthur Callis_1763159941951.png";
import chapmanImg from "@assets/Charles Henry Chapman_1763159941952.png";
import jonesImg from "@assets/Eugene Kincle Jones_1763159941953.png";
import kelleyImg from "@assets/george biddle kelley_1763159941952.png";
import murrayImg from "@assets/Nathaniel Allison Murray_1763159941952.png";
import ogleImg from "@assets/Robert Harold Ogle_1763159941950.png";
import tandyImg from "@assets/Vertner Woodson Tandy_1763159941953.png";
import coinFrontImg from "@assets/apa coin front_1762505793054.png";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  type: "main-coin" | "jewel-set" | "jewel-coin";
}

export interface JewelCoin extends Product {
  fullName: string;
  years: string;
  title: string;
  type: "jewel-coin";
}

export const MAIN_COIN: Product = {
  id: "coin120year",
  name: "120-Year Anniversary Commemorative Coin — 4\" Premium Edition",
  price: 39.06,
  image: coinFrontImg,
  description: "A powerful 4-inch museum-grade coin commemorating 120 years of Alpha Phi Alpha leadership, service, and brotherhood. Crafted with deep detail and premium weight.",
  type: "main-coin",
};

export const JEWEL_SET: Product = {
  id: "jewelset7",
  name: "Complete 7-Jewel Collector's Set — 3\" Coins",
  price: 120.06,
  image: callisImg,
  description: "A beautifully crafted 7-coin collection honoring the Seven Jewels of Alpha Phi Alpha. Premium 3-inch coins with sharp detail and stunning finish. Save $13.36.",
  type: "jewel-set",
};

export const JEWEL_COINS: JewelCoin[] = [
  {
    id: "jewel_callis",
    name: "Callis",
    fullName: "Henry Arthur Callis",
    years: "1887 - 1974",
    title: "The Philosopher",
    description: "A tribute to the intellect and vision that helped shape Alpha's foundation.",
    price: 19.06,
    image: callisImg,
    type: "jewel-coin",
  },
  {
    id: "jewel_chapman",
    name: "Chapman",
    fullName: "Charles Henry Chapman",
    years: "1870 - 1934",
    title: "The Educator",
    description: "Celebrating wisdom, uplift, and an unwavering dedication to academic excellence.",
    price: 19.06,
    image: chapmanImg,
    type: "jewel-coin",
  },
  {
    id: "jewel_jones",
    name: "Jones",
    fullName: "Eugene Kinckle Jones",
    years: "1885 - 1954",
    title: "The Organizer",
    description: "Honoring leadership, structure, and tireless service to the Fraternity's expansion.",
    price: 19.06,
    image: jonesImg,
    type: "jewel-coin",
  },
  {
    id: "jewel_kelley",
    name: "Kelley",
    fullName: "George Biddle Kelley",
    years: "1884 - 1963",
    title: "The Engineer",
    description: "A symbol of strength, precision, and the engineering mind that advanced our Brotherhood.",
    price: 19.06,
    image: kelleyImg,
    type: "jewel-coin",
  },
  {
    id: "jewel_murray",
    name: "Murray",
    fullName: "Nathaniel Allison Murray",
    years: "1884 - 1959",
    title: "The Scholar",
    description: "Commemorating intellectual depth and a lifelong commitment to educational achievement.",
    price: 19.06,
    image: murrayImg,
    type: "jewel-coin",
  },
  {
    id: "jewel_ogle",
    name: "Ogle",
    fullName: "Robert Harold Ogle",
    years: "1886 - 1936",
    title: "The Visionary",
    description: "Recognizing administrative genius and the drafting of Alpha's guiding documents.",
    price: 19.06,
    image: ogleImg,
    type: "jewel-coin",
  },
  {
    id: "jewel_tandy",
    name: "Tandy",
    fullName: "Vertner Woodson Tandy",
    years: "1885 - 1949",
    title: "The Architect",
    description: "Honoring elegance, design, and the first Black registered architect in New York State.",
    price: 19.06,
    image: tandyImg,
    type: "jewel-coin",
  },
];

export const ALL_PRODUCTS = [MAIN_COIN, JEWEL_SET, ...JEWEL_COINS];
