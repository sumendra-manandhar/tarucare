export const contact = {
  phone: '+977 984-1234567',
  phoneHref: 'tel:+9779841234567',
  email: 'tarucare.herbalsoap@gmail.com',
  website: 'www.tarucare.com.np',
  facebook: 'https://facebook.com/tarucare',
  instagram: 'https://instagram.com/tarucare',
}

export const filters = ['All', 'Brightening', 'Deep Cleansing', 'Sensitive Skin']

// `bar` drives the soap illustration; `ingredients` keys map to <Ingredient />.
export const products = [
  {
    id: 'turmeric',
    name: 'Turmeric Soap',
    local: 'Besar',
    tagline: 'The golden glow bar',
    description: 'Brightens skin, reduces dark spots, and gives a natural glow.',
    benefits: ['Brightens skin tone', 'Reduces dark spots', 'Natural, even glow'],
    categories: ['Brightening'],
    ingredients: ['turmeric', 'honey'],
    bar: { base: '#e58a2c', light: '#f3a948', dark: '#b0611a', fleck: '#8a4512' },
  },
  {
    id: 'beetroot',
    name: 'Beetroot Soap',
    local: 'Chukandar',
    tagline: 'The radiance detox bar',
    description: 'Detoxifies skin, improves complexion, and brings natural radiance.',
    benefits: ['Detoxifies skin', 'Improves complexion', 'Natural radiance'],
    categories: ['Brightening', 'Deep Cleansing'],
    ingredients: ['beetroot', 'tulsi'],
    bar: { base: '#d9707f', light: '#ea95a0', dark: '#a8475a', fleck: '#7a2638' },
  },
  {
    id: 'sandalwood',
    name: 'Sandalwood Soap',
    local: 'Chandan',
    tagline: 'The calming ritual bar',
    description: 'Soothes skin, reduces tan, and leaves a calming fragrance.',
    benefits: ['Soothes irritation', 'Reduces tan', 'Calming woody fragrance'],
    categories: ['Brightening', 'Sensitive Skin'],
    ingredients: ['sandalwood', 'honey'],
    bar: { base: '#e3cfa6', light: '#f1e2c4', dark: '#b89d70', fleck: '#8a6c44' },
  },
  {
    id: 'titepati',
    name: 'Titepati Soap',
    local: 'Mugwort',
    tagline: 'The Himalayan purifier',
    description: 'Deep cleanses, helps control acne, and refreshes skin.',
    benefits: ['Deep cleanses pores', 'Helps control acne', 'Refreshing herbal feel'],
    categories: ['Deep Cleansing'],
    ingredients: ['titepati', 'tulsi'],
    bar: { base: '#8db35f', light: '#a9c97c', dark: '#5f8238', fleck: '#3e5a22' },
  },
  {
    id: 'honey',
    name: 'Honey Soap',
    local: 'Mah',
    tagline: 'The deep-moisture bar',
    description: 'Moisturizes deeply, keeps skin soft, healthy, and refreshed.',
    benefits: ['Deep moisture', 'Soft, supple skin', 'Healthy & refreshed'],
    categories: ['Sensitive Skin'],
    ingredients: ['honey', 'milk'],
    bar: { base: '#e39a35', light: '#f2b85a', dark: '#b06d18', fleck: '#7a4d08' },
  },
  {
    id: 'goatmilk-tulsi',
    name: 'Goat Milk with Tulsi Soap',
    local: 'Bakhra Dudh & Tulsi',
    tagline: 'The gentle nourisher',
    description: 'Nourishes & moisturizes, soothes sensitive skin, and keeps it soft & smooth.',
    benefits: ['Nourishes & moisturizes', 'Soothes sensitive skin', 'Soft & smooth finish'],
    categories: ['Sensitive Skin'],
    ingredients: ['milk', 'tulsi'],
    bar: { base: '#efe9dc', light: '#fbf8f1', dark: '#cfc4ab', fleck: '#b8ab8c' },
  },
  {
    id: 'charcoal',
    name: 'Active Charcoal Soap',
    local: 'Koila',
    tagline: 'The pore detox bar',
    description: 'Deep cleanses, removes impurities, excess oil, and unclogs pores.',
    benefits: ['Removes impurities', 'Controls excess oil', 'Unclogs pores'],
    categories: ['Deep Cleansing'],
    ingredients: ['charcoal', 'titepati'],
    bar: { base: '#35383b', light: '#585c61', dark: '#1a1b1d', fleck: '#8a8f94' },
  },
]

export const ingredients = [
  {
    key: 'turmeric',
    props: ['Rich in curcumin', 'Brightens & evens tone', 'Ayurvedic staple'],
    name: 'Turmeric',
    sci: 'Curcuma longa',
    note: 'A golden Ayurvedic staple rich in curcumin — prized for brightening and evening out skin tone.',
    tint: '#f6c768',
  },
  {
    key: 'beetroot',
    props: ['Packed with antioxidants', 'Natural vitamin C', 'Revives dull skin'],
    name: 'Beetroot',
    sci: 'Beta vulgaris',
    note: 'Packed with antioxidants and vitamin C to help detoxify and revive a dull complexion.',
    tint: '#cf5c86',
  },
  {
    key: 'sandalwood',
    props: ['Cooling heartwood', 'Soothes & calms', 'Natural fragrance'],
    name: 'Sandalwood',
    sci: 'Santalum album',
    note: 'A cooling, fragrant heartwood used for centuries to soothe skin and calm the senses.',
    tint: '#ecd2ae',
  },
  {
    key: 'titepati',
    props: ['Wild Himalayan herb', 'Traditionally purifying', 'Clears & refreshes'],
    name: 'Titepati',
    sci: 'Artemisia vulgaris (Mugwort)',
    note: 'A bitter Himalayan herb from Nepal’s hillsides, traditionally used to purify and clear skin.',
    tint: '#97bf7f',
  },
  {
    key: 'tulsi',
    props: ['Sacred holy basil', 'Naturally clarifying', 'Kind to sensitive skin'],
    name: 'Tulsi',
    sci: 'Ocimum sanctum (Holy Basil)',
    note: 'The sacred “queen of herbs” — naturally clarifying and gentle enough for sensitive skin.',
    tint: '#7fb48a',
  },
  {
    key: 'honey',
    props: ['Natural humectant', 'Locks in moisture', 'Soft, supple skin'],
    name: 'Honey',
    sci: 'Raw wild honey',
    note: 'A natural humectant that draws in moisture, leaving skin soft, supple and nourished.',
    tint: '#f0bf55',
  },
]

export const freeFrom = ['No Parabens', 'No Sulphates', 'No Silicones', 'Cruelty-Free']

export const whyChoose = [
  '100% Natural & Herbal Ingredients',
  'Ayurvedic Formulation',
  'Handcrafted with Love',
  'Gentle on Skin, Tough on Impurities',
  'Safe for All Skin Types',
]

// `products` lists the soaps whose own descriptions promise this benefit.
export const skinBenefits = [
  { title: 'Detoxifies Skin', icon: 'Sparkles', text: 'Draws out everyday grime and pollutants so skin can breathe and renew.', products: ['beetroot', 'charcoal'] },
  { title: 'Deep Cleanses', icon: 'Droplets', text: 'Lifts dirt and excess oil from deep in the pores without stripping skin.', products: ['titepati', 'charcoal'] },
  { title: 'Moisturizes Deeply', icon: 'Droplet', text: 'Natural humectants lock in moisture for skin that stays soft all day.', products: ['honey', 'goatmilk-tulsi'] },
  { title: 'Brightens Complexion', icon: 'Sun', text: 'Evens out tone and reveals a natural, healthy glow.', products: ['turmeric', 'beetroot', 'sandalwood'] },
  { title: 'Reduces Blemishes', icon: 'Wand2', text: 'Helps fade dark spots and calm breakouts over time.', products: ['turmeric', 'titepati'] },
  { title: 'Soothes & Nourishes', icon: 'Flower2', text: 'Calms irritation and redness while feeding skin what it needs.', products: ['sandalwood', 'goatmilk-tulsi'] },
  { title: 'Balances Oil', icon: 'Scale', text: 'Controls shine and keeps oily skin fresh without over-drying.', products: ['charcoal', 'titepati'] },
  { title: 'Gentle & Safe for All Skin Types', icon: 'ShieldCheck', text: 'Free from harsh chemicals — every bar is kind enough for daily use.', products: [] },
]

export const quality = [
  { title: 'Premium Ingredients', text: 'Herbs and oils hand-selected from trusted Nepali growers.', icon: 'Leaf' },
  { title: 'Small-Batch Handcrafted', text: 'Cold-crafted in small batches to keep every herb potent.', icon: 'HandHeart' },
  { title: 'Rigorous Quality Control', text: 'Every batch checked for purity, pH balance and consistency.', icon: 'ClipboardCheck' },
  { title: 'Sustainable Packaging', text: 'Recyclable, plastic-light packaging that respects the earth.', icon: 'Recycle' },
  { title: 'Export Quality Standards', text: 'Made in Nepal to standards ready for the world.', icon: 'Globe2' },
]

export const ingredientLabels = {
  turmeric: 'Turmeric', beetroot: 'Beetroot', sandalwood: 'Sandalwood', titepati: 'Titepati',
  tulsi: 'Tulsi', honey: 'Honey', milk: 'Goat Milk', charcoal: 'Charcoal',
}

export const storyTabs = [
  {
    key: 'story',
    label: 'Our Story',
    title: 'Nepal’s natural heritage, Ayurveda’s timeless wisdom.',
    text: 'TARU CARE is a premium herbal soap brand inspired by Nepal’s natural heritage and the timeless wisdom of Ayurveda. We craft handcrafted soaps using the finest herbs, natural oils and traditional techniques to bring you the goodness of nature for healthy, radiant and glowing skin.',
  },
  {
    key: 'mission',
    label: 'Mission',
    title: 'Natural, safe and effective — for everyone.',
    text: 'To provide natural, safe and effective herbal soaps that enhance wellness and promote a sustainable lifestyle.',
  },
  {
    key: 'vision',
    label: 'Vision',
    title: 'From the Himalayas to the world.',
    text: 'To be a globally recognized herbal soap brand known for purity, quality and care for nature.',
  },
]

// Benefits an admin can tick per product. "Gentle & Safe…" applies to every bar, so it's not a choice.
export const SAFE_BENEFIT = 'Gentle & Safe for All Skin Types'
export const benefitChoices = skinBenefits.filter((b) => b.title !== SAFE_BENEFIT).map((b) => b.title)

// Older/seed products don't store their skin benefits yet: derive them from the mapping above.
export function withSkinBenefits(p) {
  if (Array.isArray(p.skinBenefits)) return p
  return { ...p, skinBenefits: skinBenefits.filter((b) => b.products.includes(p.id)).map((b) => b.title) }
}

// Which soap each themed hero slide shows (editable in Admin → Settings).
export const defaultHeroSlides = { Brightening: 'turmeric', 'Deep Cleansing': 'charcoal', 'Sensitive Skin': 'goatmilk-tulsi' }
