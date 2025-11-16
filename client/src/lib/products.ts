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
  name: "120-Year Anniversary Coin – 4 Inch",
  price: 50.06,
  image: coinFrontImg,
  description: "Official Alpha Phi Alpha 120th Anniversary commemorative coin. 4-inch diameter premium collectible.",
  type: "main-coin",
};

export const JEWEL_SET: Product = {
  id: "jewelset7",
  name: "Complete Jewel Coin Set – (7 Coins, 3 Inch Each)",
  price: 120.06,
  image: callisImg,
  description: "Complete collection of all seven founding jewels. Save $13.36 compared to individual coins.",
  type: "jewel-set",
};

export const JEWEL_COINS: JewelCoin[] = [
  {
    id: "jewel_callis",
    name: "Callis",
    fullName: "Henry Arthur Callis",
    years: "1887 - 1974",
    title: "Visionary Founder and First Vice President",
    description: "Medical pioneer and dedicated fraternity leader who helped establish Alpha Phi Alpha.",
    price: 19.06,
    image: callisImg,
    type: "jewel-coin",
  },
  {
    id: "jewel_chapman",
    name: "Chapman",
    fullName: "Charles Henry Chapman",
    years: "1870 - 1934",
    title: "Founding Jewel",
    description: "One of the seven visionary founders who established the first intercollegiate Greek-letter fraternity for African Americans.",
    price: 19.06,
    image: chapmanImg,
    type: "jewel-coin",
  },
  {
    id: "jewel_jones",
    name: "Jones",
    fullName: "Eugene Kincle Jones",
    years: "1885 - 1954",
    title: "Social Work Pioneer and Founding Jewel",
    description: "Influential social reformer who co-founded the National Urban League and championed civil rights.",
    price: 19.06,
    image: jonesImg,
    type: "jewel-coin",
  },
  {
    id: "jewel_kelley",
    name: "Kelley",
    fullName: "George Biddle Kelley",
    years: "1884 - 1963",
    title: "Engineering Pioneer and Founding Jewel",
    description: "First African American engineer registered in the state of New York and civil rights advocate.",
    price: 19.06,
    image: kelleyImg,
    type: "jewel-coin",
  },
  {
    id: "jewel_murray",
    name: "Murray",
    fullName: "Nathaniel Allison Murray",
    years: "1884 - 1959",
    title: "Founding Jewel",
    description: "Dedicated educator and fraternity leader who helped shape Alpha Phi Alpha's early foundation.",
    price: 19.06,
    image: murrayImg,
    type: "jewel-coin",
  },
  {
    id: "jewel_ogle",
    name: "Ogle",
    fullName: "Robert Harold Ogle",
    years: "1886 - 1936",
    title: "Founding Jewel",
    description: "Committed educator and one of the seven visionaries who founded Alpha Phi Alpha at Cornell University.",
    price: 19.06,
    image: ogleImg,
    type: "jewel-coin",
  },
  {
    id: "jewel_tandy",
    name: "Tandy",
    fullName: "Vertner Woodson Tandy",
    years: "1885 - 1949",
    title: "Architectural Pioneer and Founding Jewel",
    description: "First African American registered architect in New York State and designer of notable Harlem landmarks.",
    price: 19.06,
    image: tandyImg,
    type: "jewel-coin",
  },
];

export const ALL_PRODUCTS = [MAIN_COIN, JEWEL_SET, ...JEWEL_COINS];
