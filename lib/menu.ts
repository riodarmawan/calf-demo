import type { Lang } from "./i18n";

export type SizeKey ="Cup" | "Can" | "Liter" | "Iced" | "Hot" | "Porsi";

export type MenuItem = {
  id: string;
  name: string;
  /** Harga per ukuran, dalam rupiah. `null` = harga belum dikonfirmasi. */
  sizes: [SizeKey, number][] | null;
  image?: string;
  /** object-position untuk thumbnail */
  focus?: string;
  toppings?: boolean;
};

export type MenuSection = {
  /** Label chip (Bahasa Indonesia) dan dasar ID bagian. */
  key: string;
  title: string;
  en: { key: string; title: string };
  items: MenuItem[];
};

const k = (n: number) => n * 1000;
const s = (...pairs: [SizeKey, number][]): [SizeKey, number][] =>
  pairs.map(([size, price]) => [size, k(price)]);

const IMG = {
  premium: "/images/can-photo.png",
  jefferson: "/images/t-jefferson.png",
  cream: "/images/t-cream.png",
  sweet: "/images/t-sweet.png",
  frappe: "/images/t-frappe.png",
  dish: "/images/t-dish.png",
};

export const MENU: MenuSection[] = [
  {
    key: "Kopi Susu",
    title: "Kopi Susu Original",
    en: { key: "Coffee Milk", title: "Original Coffee Milk" },
    items: [
      { id: "premium", name: "Calf Premium", sizes: s(["Cup", 20], ["Can", 29], ["Liter", 89]), image: IMG.premium, focus: "50% 66%" },
      { id: "brewmalt", name: "Calf Brewmalt", sizes: s(["Cup", 27], ["Can", 29]) },
      { id: "smooth", name: "Calf Smooth", sizes: s(["Can", 25]), image: "/images/smooth.png", focus: "50% 55%" },
    ],
  },
  {
    key: "Jefferson",
    title: "Seri Jefferson",
    en: { key: "Jefferson", title: "Jefferson Series" },
    items: [
      { id: "liquid-jefferson", name: "Liquid Jefferson", sizes: s(["Cup", 25]), image: IMG.jefferson },
      { id: "mocha-jefferson", name: "Mocha Jefferson", sizes: s(["Cup", 27]), image: IMG.jefferson },
      { id: "caramel-jefferson", name: "Caramel Jefferson", sizes: s(["Cup", 27]), image: IMG.jefferson },
    ],
  },
  {
    key: "Coffee Cream",
    title: "Seri Coffee Cream",
    en: { key: "Coffee Cream", title: "Coffee Cream Series" },
    items: [
      { id: "magic-coffee-cream", name: "Magic Coffee Cream", sizes: s(["Cup", 27]), image: IMG.cream },
      { id: "magic-cheese-butter-cream", name: "Magic Cheese Butter Cream", sizes: s(["Cup", 27]), image: IMG.cream },
      { id: "magic-tiramisu-cream", name: "Magic Tiramisu Cream", sizes: s(["Cup", 27]), image: IMG.cream },
    ],
  },
  {
    key: "Sweet Calf",
    title: "Seri Sweet Calf",
    en: { key: "Sweet Calf", title: "Sweet Calf Series" },
    items: [
      { id: "sc-toblerone", name: "Sweet Calf Toblerone", sizes: null, image: IMG.sweet },
      { id: "sc-tiramisu", name: "Sweet Calf Tiramisu", sizes: null, image: IMG.sweet },
      { id: "sc-cookies", name: "Sweet Calf Cookies", sizes: null, image: IMG.sweet },
      { id: "sc-matcha", name: "Sweet Calf Matcha", sizes: null, image: IMG.sweet },
      { id: "sc-blueberry", name: "Sweet Calf Blueberry", sizes: null, image: IMG.sweet },
      { id: "sc-strawberry", name: "Sweet Calf Strawberry", sizes: null, image: IMG.sweet },
    ],
  },
  {
    key: "Frappe",
    title: "Seri Calf Frappe",
    en: { key: "Frappe", title: "Calf Frappe Series" },
    items: [
      { id: "banana-tiramisu-frappuccino", name: "Banana Tiramisu Frappuccino", sizes: null, image: IMG.frappe },
      { id: "caramel-frappuccino", name: "Caramel Frappuccino", sizes: null, image: IMG.frappe },
      { id: "dark-choco-frappuccino", name: "Dark Choco Frappuccino", sizes: null, image: IMG.frappe },
    ],
  },
  {
    key: "Kopi",
    title: "Kopi Lainnya",
    en: { key: "Coffee", title: "More Coffee" },
    items: [
      { id: "sunkist-latte", name: "Sunkist Latte", sizes: s(["Cup", 29]) },
      { id: "spanish-latte", name: "Spanish Latte", sizes: s(["Cup", 27]) },
      { id: "tiramisu-dolce", name: "Tiramisu Dolce", sizes: s(["Cup", 27]) },
      { id: "tiramisu-caramel", name: "Tiramisu Caramel", sizes: s(["Cup", 27]) },
      { id: "caramel-macchiato", name: "Caramel Macchiato", sizes: s(["Cup", 27]) },
      { id: "butterscotch-macchiato", name: "Butterscotch Macchiato", sizes: s(["Cup", 27]) },
      { id: "daily-rum", name: "Daily Rum", sizes: s(["Cup", 27]) },
    ],
  },
  {
    key: "Spesialti",
    title: "Kopi Spesialti",
    en: { key: "Specialty", title: "Specialty Coffee" },
    items: [
      { id: "espresso-single", name: "Espresso · single shot", sizes: s(["Hot", 10]) },
      { id: "espresso-double", name: "Espresso · double shot", sizes: s(["Hot", 15]) },
      { id: "latte", name: "Latte", sizes: s(["Hot", 25]) },
      { id: "cappuccino", name: "Cappuccino", sizes: s(["Hot", 25]) },
      { id: "long-black", name: "Long Black", sizes: s(["Iced", 23], ["Hot", 20]) },
      { id: "piccolo", name: "Piccolo", sizes: s(["Hot", 23]) },
      { id: "magic", name: "Magic", sizes: s(["Hot", 25]) },
      { id: "white", name: "White", sizes: s(["Iced", 23]) },
      { id: "dirty-latte", name: "Dirty Latte", sizes: s(["Iced", 25]) },
      { id: "blast", name: "Blast", sizes: s(["Iced", 25]) },
      { id: "affogato", name: "Affogato", sizes: s(["Iced", 25]) },
    ],
  },
  {
    key: "Susu",
    title: "Minuman Susu",
    en: { key: "Milk", title: "Milk Drinks" },
    items: [
      { id: "chocolate", name: "Chocolate", sizes: s(["Cup", 25]) },
      { id: "hot-chocolate", name: "Hot Chocolate", sizes: s(["Hot", 25]) },
      { id: "aromatic-milk-tea", name: "Aromatic Milk Tea", sizes: s(["Can", 25], ["Liter", 75]) },
      { id: "regal", name: "Regal", sizes: s(["Cup", 22]) },
      { id: "regal-rum", name: "Regal Rum", sizes: s(["Cup", 23]) },
      { id: "caramel-rum", name: "Caramel Rum", sizes: s(["Cup", 22]) },
      { id: "caramel-cookies", name: "Caramel Cookies", sizes: s(["Cup", 22]) },
      { id: "butterscotch-rum", name: "Butterscotch Rum", sizes: s(["Cup", 22]) },
      { id: "butterscotch-cookies", name: "Butterscotch Cookies", sizes: s(["Cup", 22]) },
      { id: "butterscotch-milk", name: "Butterscotch Milk", sizes: s(["Liter", 85]) },
      { id: "caramel-milk", name: "Caramel Milk", sizes: s(["Liter", 85]) },
    ],
  },
  {
    key: "Teh",
    title: "Seri Teh",
    en: { key: "Tea", title: "Tea Series" },
    items: [
      { id: "apple-tea-cheese", name: "Apple Tea Cheese", sizes: s(["Iced", 23]) },
      { id: "lemon-tea-cheese", name: "Lemon Tea Cheese", sizes: s(["Iced", 23]) },
      { id: "lychee-tea-cheese", name: "Lychee Tea Cheese", sizes: s(["Iced", 25]) },
    ],
  },
  {
    key: "Makanan",
    title: "Makanan",
    en: { key: "Food", title: "Food" },
    items: [
      { id: "chicken-truffle", name: "Chicken Rice Mushroom Truffle Sauce", sizes: s(["Porsi", 29]), image: IMG.dish },
      { id: "chicken-butter", name: "Chicken Rice Butter Milk Sauce", sizes: s(["Porsi", 29]) },
      { id: "beef-truffle", name: "Beef Rice Mushroom Truffle Sauce", sizes: s(["Porsi", 35]), image: IMG.dish },
      { id: "beef-butter", name: "Beef Rice Butter Milk Sauce", sizes: s(["Porsi", 35]) },
      { id: "saikoro-butter", name: "Saikoro Rice Butter Milk Sauce", sizes: s(["Porsi", 35]) },
      { id: "saikoro-mushroom", name: "Saikoro Rice Butter Mushroom", sizes: s(["Porsi", 35]) },
      { id: "waffle", name: "Waffle", sizes: s(["Porsi", 18]), toppings: true },
      { id: "pisang-goreng", name: "Pisang Goreng", sizes: s(["Porsi", 15]), toppings: true },
    ],
  },
];

/**
 * DRAF deskripsi satu baris, BELUM dikonfirmasi Calf. Hanya ditulis untuk menu yang isinya
 * jelas dari nama atau istilah kopi baku. Menu yang tidak ada di sini (Blast, White, Regal,
 * semua varian "Rum", Brewmalt, Smooth, Liquid Jefferson, Sunkist Latte) sengaja dikosongkan:
 * isinya, termasuk ada/tidaknya alkohol, harus datang dari Calf.
 */
export const DESC: Record<string, string> = {
  premium: "Kopi susu andalan Calf.",
  "mocha-jefferson": "Seri Jefferson rasa mocha (kopi dan cokelat).",
  "caramel-jefferson": "Seri Jefferson rasa karamel.",
  "magic-coffee-cream": "Kopi dengan lapisan krim di atasnya.",
  "magic-cheese-butter-cream": "Kopi dengan lapisan krim keju dan butter.",
  "magic-tiramisu-cream": "Kopi dengan lapisan krim rasa tiramisu.",
  "spanish-latte": "Kopi susu dengan susu kental manis.",
  "tiramisu-dolce": "Kopi susu rasa tiramisu.",
  "tiramisu-caramel": "Kopi susu rasa tiramisu dan karamel.",
  "caramel-macchiato": "Susu, espresso, dan karamel berlapis.",
  "butterscotch-macchiato": "Susu, espresso, dan butterscotch berlapis.",
  "espresso-single": "Satu shot kopi pekat, tanpa susu.",
  "espresso-double": "Dua shot kopi pekat, tanpa susu.",
  latte: "Espresso dengan susu panas dan sedikit busa.",
  cappuccino: "Espresso dengan susu dan busa tebal.",
  "long-black": "Espresso dengan air, tanpa susu.",
  piccolo: "Espresso dengan sedikit susu, gelas kecil.",
  magic: "Double ristretto dengan susu. Lebih kuat dari latte.",
  "dirty-latte": "Susu dingin disiram espresso.",
  affogato: "Es krim disiram espresso.",
  chocolate: "Cokelat susu dingin.",
  "hot-chocolate": "Cokelat susu panas.",
  "aromatic-milk-tea": "Teh susu dalam kemasan.",
  "caramel-cookies": "Susu rasa karamel dan cookies.",
  "butterscotch-cookies": "Susu rasa butterscotch dan cookies.",
  "butterscotch-milk": "Susu rasa butterscotch, kemasan 1 liter.",
  "caramel-milk": "Susu rasa karamel, kemasan 1 liter.",
  "apple-tea-cheese": "Teh apel dingin dengan krim keju di atasnya.",
  "lemon-tea-cheese": "Teh lemon dingin dengan krim keju di atasnya.",
  "lychee-tea-cheese": "Teh leci dingin dengan krim keju di atasnya.",
  "chicken-truffle": "Nasi ayam dengan saus jamur truffle.",
  "chicken-butter": "Nasi ayam dengan saus susu butter.",
  "beef-truffle": "Nasi daging sapi dengan saus jamur truffle.",
  "beef-butter": "Nasi daging sapi dengan saus susu butter.",
  "saikoro-butter": "Nasi daging sapi potong dadu dengan saus susu butter.",
  "saikoro-mushroom": "Nasi daging sapi potong dadu dengan saus butter jamur.",
  waffle: "Waffle hangat. Bisa tambah topping.",
  "pisang-goreng": "Pisang goreng hangat. Bisa tambah topping.",
};

/** Terjemahan DRAF di atas; sama-sama perlu dikonfirmasi Calf. */
export const DESC_EN: Record<string, string> = {
  premium: "Calf's signature coffee with milk.",
  "mocha-jefferson": "Jefferson series, mocha (coffee and chocolate).",
  "caramel-jefferson": "Jefferson series, caramel.",
  "magic-coffee-cream": "Coffee topped with a layer of cream.",
  "magic-cheese-butter-cream": "Coffee topped with cheese and butter cream.",
  "magic-tiramisu-cream": "Coffee topped with tiramisu cream.",
  "spanish-latte": "Coffee with sweetened condensed milk.",
  "tiramisu-dolce": "Tiramisu-flavoured coffee with milk.",
  "tiramisu-caramel": "Tiramisu and caramel coffee with milk.",
  "caramel-macchiato": "Layered milk, espresso and caramel.",
  "butterscotch-macchiato": "Layered milk, espresso and butterscotch.",
  "espresso-single": "One shot of strong coffee, no milk.",
  "espresso-double": "Two shots of strong coffee, no milk.",
  latte: "Espresso with steamed milk and light foam.",
  cappuccino: "Espresso with milk and thick foam.",
  "long-black": "Espresso with water, no milk.",
  piccolo: "Espresso with a little milk, small glass.",
  magic: "Double ristretto with milk. Stronger than a latte.",
  "dirty-latte": "Cold milk with a shot of espresso poured over.",
  affogato: "Ice cream with a shot of espresso poured over.",
  chocolate: "Iced chocolate milk.",
  "hot-chocolate": "Hot chocolate milk.",
  "aromatic-milk-tea": "Packaged milk tea.",
  "caramel-cookies": "Caramel and cookies milk drink.",
  "butterscotch-cookies": "Butterscotch and cookies milk drink.",
  "butterscotch-milk": "Butterscotch milk, 1 litre bottle.",
  "caramel-milk": "Caramel milk, 1 litre bottle.",
  "apple-tea-cheese": "Iced apple tea topped with cheese cream.",
  "lemon-tea-cheese": "Iced lemon tea topped with cheese cream.",
  "lychee-tea-cheese": "Iced lychee tea topped with cheese cream.",
  "chicken-truffle": "Chicken rice with truffle mushroom sauce.",
  "chicken-butter": "Chicken rice with butter milk sauce.",
  "beef-truffle": "Beef rice with truffle mushroom sauce.",
  "beef-butter": "Beef rice with butter milk sauce.",
  "saikoro-butter": "Rice with diced beef and butter milk sauce.",
  "saikoro-mushroom": "Rice with diced beef and butter mushroom sauce.",
  waffle: "Warm waffle. Toppings available.",
  "pisang-goreng": "Warm fried banana. Toppings available.",
};

export const descOf = (itemId: string, lang: Lang) => (lang === "en" ? DESC_EN : DESC)[itemId];

export const TOPPINGS: { id: string; en: string; price: number }[] = [
  { id: "Es krim", en: "Ice cream", price: 6000 },
  { id: "Cokelat", en: "Chocolate", price: 4000 },
  { id: "Keju", en: "Cheese", price: 4000 },
  { id: "Cokelat keju", en: "Choc cheese", price: 6000 },
];

/** Label tombol pilihan. Indeks 0 = normal. */
export const SWEET_OPTS: Record<Lang, string[]> = {
  id: ["Normal", "Kurang manis", "Tanpa gula"],
  en: ["Regular", "Less sweet", "No sugar"],
};
export const ICE_OPTS: Record<Lang, string[]> = {
  id: ["Normal", "Sedikit es", "Tanpa es"],
  en: ["Regular", "Less ice", "No ice"],
};
/** Teks di keterangan pesanan ("Manis normal" lebih jelas daripada "Normal" saja). */
const SWEET_DETAIL: Record<Lang, string[]> = { id: ["Manis normal", "Kurang manis", "Tanpa gula"], en: ["Regular sweet", "Less sweet", "No sugar"] };
const ICE_DETAIL: Record<Lang, string[]> = { id: ["Es normal", "Sedikit es", "Tanpa es"], en: ["Regular ice", "Less ice", "No ice"] };

export const FEATURED = ["premium", "caramel-jefferson", "magic-coffee-cream", "chicken-truffle"];

export const ALL_ITEMS: (MenuItem & { section: string; sectionEn: string; sectionKey: string })[] = MENU.flatMap((sec) =>
  sec.items.map((it) => ({ ...it, section: sec.title, sectionEn: sec.en.title, sectionKey: sec.key })),
);

export const findItem = (id: string) => ALL_ITEMS.find((i) => i.id === id);

/**
 * Kata yang biasa diketik pelanggan → kata yang ada di nama menu.
 * Kata yang tidak ada di sini dicari apa adanya. "es" sengaja tidak dicari mentah
 * karena cocok dengan "espresso", "cheese", "series".
 */
const SYNONYMS: Record<string, string[]> = {
  teh: ["tea", "teh"],
  kopi: ["kopi", "coffee", "latte", "espresso", "macchiato", "jefferson"],
  susu: ["susu", "milk"],
  coklat: ["choc"],
  cokelat: ["choc"],
  nasi: ["rice"],
  ayam: ["chicken"],
  sapi: ["beef", "saikoro"],
  daging: ["beef", "saikoro"],
  keju: ["cheese"],
  karamel: ["caramel"],
  apel: ["apple"],
  leci: ["lychee"],
  lemon: ["lemon"],
  jeruk: ["lemon", "sunkist"],
  es: ["iced", "cup"],
  dingin: ["iced", "cup", "can", "liter"],
  panas: ["hot"],
  kaleng: ["can"],
  makan: ["makanan"],
};

const haystack = new Map(
  ALL_ITEMS.map((i) => [
    i.id,
    `${i.name} ${i.section} ${i.sectionEn} ${i.sectionKey} ${(i.sizes ?? []).map((s) => s[0]).join(" ")} ${DESC[i.id] ?? ""} ${DESC_EN[i.id] ?? ""}`.toLowerCase(),
  ]),
);

/** Semua kata harus cocok: "es kopi" = menu kopi yang tersedia dingin. */
// ponytail: tanpa toleransi salah ketik; tambahkan jarak edit kalau log pencarian menunjukkan banyak typo
export function searchMenu(query: string) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return ALL_ITEMS.filter((i) => {
    const hay = haystack.get(i.id)!;
    return i.sizes && words.every((w) => (SYNONYMS[w] ?? [w]).some((t) => hay.includes(t)));
  });
}

/** Ukuran yang punya pilihan manis / es. */
export const HAS_SWEET: SizeKey[] = ["Cup", "Iced", "Hot"];
export const HAS_ICE: SizeKey[] = ["Cup", "Iced"];
export const PACKED: SizeKey[] = ["Can", "Liter"];

const SIZE_LABEL: Record<Lang, Record<SizeKey, string>> = {
  id: { Cup: "Gelas", Can: "Kaleng", Liter: "1 Liter", Iced: "Dingin", Hot: "Panas", Porsi: "1 porsi" },
  en: { Cup: "Cup", Can: "Can", Liter: "1 Litre", Iced: "Iced", Hot: "Hot", Porsi: "1 serving" },
};

export const sizeLabel = (size: SizeKey, lang: Lang = "id") => SIZE_LABEL[lang][size];

/** Pilihan yang disimpan di baris keranjang, supaya keterangannya bisa ditulis dalam bahasa apa pun. */
export type LineOpts = { size: SizeKey; sweet?: number; ice?: number; tops?: number[] };

/** Keterangan baris pesanan, mis. "Gelas · Kurang manis · Es normal". Untuk barista selalu `lang = "id"`. */
export function describe(itemId: string, o: LineOpts, lang: Lang) {
  const sizes = findItem(itemId)?.sizes ?? [];
  const parts = [
    sizes.length > 1 || PACKED.includes(o.size) || o.size !== "Porsi" ? sizeLabel(o.size, lang) : null,
    HAS_SWEET.includes(o.size) ? SWEET_DETAIL[lang][o.sweet ?? 0] : null,
    HAS_ICE.includes(o.size) ? ICE_DETAIL[lang][o.ice ?? 0] : null,
    o.tops?.length ? "+ " + [...o.tops].sort().map((i) => TOPPINGS[i][lang]).join(", ") : null,
  ].filter(Boolean);
  return parts.join(" · ") || sizeLabel("Porsi", lang);
}

/** Menu yang bisa langsung masuk keranjang tanpa membuka pilihan. */
export const isQuickAdd = (item: MenuItem) =>
  !!item.sizes && item.sizes.length === 1 && !HAS_SWEET.includes(item.sizes[0][0]) && !item.toppings;

export const TABLES = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
export const OUTLET = "Jatiwarna";
