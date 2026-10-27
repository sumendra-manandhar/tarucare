export const CATEGORIES = ['Brightening', 'Deep Cleansing', 'Sensitive Skin']

export const DEFAULT_PRODUCTS = [
  {
    id: 'turmeric',
    name: 'Turmeric Soap',
    nepali: 'बेसार',
    tagline: 'Golden glow, naturally',
    description: 'Brightens skin, reduces dark spots, and gives a natural glow.',
    longDescription:
      'Cold-processed with wild Himalayan turmeric and cold-pressed oils, this golden bar evens skin tone and fades dark spots while curcumin calms the skin.',
    ingredients: ['Turmeric', 'Coconut Oil', 'Shea Butter', 'Saffron Notes'],
    benefits: ['Brightens complexion', 'Reduces dark spots', 'Natural glow'],
    categories: ['Brightening'],
    price: 350,
    stock: 120,
    weight: '100g',
    base: '#e9b949',
    accent: '#b9770e',
    active: true,
    featured: true,
  },
  {
    id: 'beetroot',
    name: 'Beetroot Soap',
    nepali: 'चुकन्दर',
    tagline: 'Detox in rose-red',
    description: 'Detoxifies skin, improves complexion, and brings natural radiance.',
    longDescription:
      'Beetroot extract is rich in antioxidants and vitamin C. Paired with almond oil, it draws out toxins and leaves a healthy rosy radiance.',
    ingredients: ['Beetroot', 'Almond Oil', 'Rose Water', 'Glycerin'],
    benefits: ['Detoxifies skin', 'Improves complexion', 'Natural radiance'],
    categories: ['Brightening', 'Deep Cleansing'],
    price: 350,
    stock: 85,
    weight: '100g',
    base: '#a4244b',
    accent: '#6b1030',
    active: true,
    featured: false,
  },
  {
    id: 'sandalwood',
    name: 'Sandalwood Soap',
    nepali: 'चन्दन',
    tagline: 'Calm, cool & fragrant',
    description: 'Soothes skin, reduces tan, and leaves a calming fragrance.',
    longDescription:
      'A temple-time classic. Pure sandalwood powder and oil cool the skin, lift tan, and leave a woody, meditative fragrance that lingers.',
    ingredients: ['Sandalwood', 'Olive Oil', 'Kesar', 'Vitamin E'],
    benefits: ['Soothes skin', 'Reduces tan', 'Calming fragrance'],
    categories: ['Brightening', 'Sensitive Skin'],
    price: 450,
    stock: 64,
    weight: '100g',
    base: '#d9b38c',
    accent: '#8a5a32',
    active: true,
    featured: true,
  },
  {
    id: 'titepati',
    name: 'Titepati Soap',
    nepali: 'तितेपाती',
    tagline: 'The Himalayan purifier',
    description: 'Deep cleanses, helps control acne, and refreshes skin.',
    longDescription:
      'Titepati (Himalayan mugwort) is a beloved Nepali healing herb. Its antibacterial leaves cleanse deep, keep breakouts at bay, and refresh tired skin.',
    ingredients: ['Titepati (Mugwort)', 'Neem', 'Tea Tree', 'Coconut Oil'],
    benefits: ['Deep cleanses', 'Controls acne', 'Refreshes skin'],
    categories: ['Deep Cleansing'],
    price: 380,
    stock: 92,
    weight: '100g',
    base: '#5d8a4e',
    accent: '#2f5228',
    active: true,
    featured: true,
  },
  {
    id: 'honey',
    name: 'Honey Soap',
    nepali: 'मह',
    tagline: 'Wild honey hydration',
    description: 'Moisturizes deeply, keeps skin soft, healthy, and refreshed.',
    longDescription:
      'Made with raw wild honey from Nepal\'s hills. This natural humectant locks in moisture, so skin stays soft, supple and healthy.',
    ingredients: ['Wild Honey', 'Beeswax', 'Oat Milk', 'Shea Butter'],
    benefits: ['Deep moisture', 'Soft skin', 'Refreshing'],
    categories: ['Sensitive Skin'],
    price: 400,
    stock: 23,
    weight: '100g',
    base: '#f0a830',
    accent: '#b56b0b',
    active: true,
    featured: false,
  },
  {
    id: 'goatmilk-tulsi',
    name: 'Goat Milk with Tulsi Soap',
    nepali: 'बाख्राको दूध र तुलसी',
    tagline: 'Gentle as it gets',
    description: 'Nourishes & moisturizes, soothes sensitive skin, and keeps it soft & smooth.',
    longDescription:
      'Creamy fresh goat milk meets holy basil (tulsi). Lactic acid gently renews skin while tulsi calms irritation, which makes it ideal for sensitive skin.',
    ingredients: ['Goat Milk', 'Tulsi', 'Olive Oil', 'Shea Butter'],
    benefits: ['Nourishes & moisturizes', 'Soothes sensitivity', 'Soft & smooth'],
    categories: ['Sensitive Skin'],
    price: 420,
    stock: 70,
    weight: '100g',
    base: '#efe8d6',
    accent: '#5f8d4e',
    active: true,
    featured: false,
  },
  {
    id: 'charcoal',
    name: 'Active Charcoal Soap',
    nepali: 'सक्रिय कोइला',
    tagline: 'Pore-deep detox',
    description: 'Deep cleanses, removes impurities, excess oil, and unclogs pores.',
    longDescription:
      'Activated bamboo charcoal acts like a magnet for dirt, pollution and excess sebum, so pores are left clean and skin feels balanced and fresh.',
    ingredients: ['Activated Charcoal', 'Tea Tree', 'Peppermint', 'Coconut Oil'],
    benefits: ['Removes impurities', 'Controls oil', 'Unclogs pores'],
    categories: ['Deep Cleansing'],
    price: 400,
    stock: 8,
    weight: '100g',
    base: '#2d2d2f',
    accent: '#0e0e10',
    active: true,
    featured: false,
  },
]

export const INGREDIENTS = [
  { key: 'turmeric', name: 'Turmeric', latin: 'Curcuma longa', color: '#e9a23b', note: 'Curcumin-rich root that brightens and evens out tone.' },
  { key: 'beetroot', name: 'Beetroot', latin: 'Beta vulgaris', color: '#a4244b', note: 'Antioxidant powerhouse that detoxifies and adds radiance.' },
  { key: 'sandalwood', name: 'Sandalwood', latin: 'Santalum album', color: '#b07d4f', note: 'Cooling, calming heartwood that soothes and lifts tan.' },
  { key: 'titepati', name: 'Titepati', latin: 'Artemisia vulgaris', color: '#5d8a4e', note: 'Himalayan mugwort, an antibacterial herb that fights acne.' },
  { key: 'tulsi', name: 'Tulsi', latin: 'Ocimum sanctum', color: '#3f7d3a', note: 'Holy basil that purifies and calms irritated skin.' },
  { key: 'honey', name: 'Honey', latin: 'Mel naturale', color: '#e39b16', note: 'Wild humectant that locks in deep, lasting moisture.' },
]

export const DEFAULT_SETTINGS = {
  phone: '+977 984-1234567',
  email: 'tarucare.herbalsoap@gmail.com',
  website: 'www.tarucare.com.np',
  facebook: 'tarucare',
  instagram: 'tarucare',
  announcement: 'Free delivery inside Kathmandu Valley on orders above Rs. 1,000 🌿',
  cartEnabled: true,
  deliveryFee: 100,
  freeDeliveryOver: 1000,
  maxQtyPerItem: 10,
  paymentMethods: ['Cash on Delivery', 'eSewa', 'Khalti', 'Bank Transfer'],
}

export const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

const day = 86400000
const now = Date.now()
export const DEFAULT_INQUIRIES = [
  { id: 'i1', name: 'Aarati Shrestha', email: 'aarati@example.com', subject: 'Wholesale for my salon', message: 'Hi! I run a small beauty salon in Lalitpur and would love to stock the Sandalwood and Turmeric bars. Do you offer wholesale pricing?', date: now - 0.2 * day, status: 'new' },
  { id: 'i2', name: 'Rohan Gurung', email: 'rohan.g@example.com', subject: 'Sensitive skin question', message: 'Is the Goat Milk Tulsi soap safe for my 4-year-old? She has very dry skin.', date: now - 1.1 * day, status: 'new' },
  { id: 'i3', name: 'Sophie Laurent', email: 'sophie@example.com', subject: 'Export to France', message: 'We are a natural products boutique in Lyon interested in importing Himalayan herbal soaps. Please share your export catalogue.', date: now - 2.4 * day, status: 'replied' },
  { id: 'i4', name: 'Bikash Thapa', email: 'bikash@example.com', subject: 'Charcoal soap restock', message: 'When will the Active Charcoal soap be back in stock in Pokhara stores?', date: now - 3.6 * day, status: 'read' },
  { id: 'i5', name: 'Nisha KC', email: 'nisha.kc@example.com', subject: 'Gift boxes', message: 'Do you make gift sets for weddings? Need about 150 boxes.', date: now - 5.2 * day, status: 'replied' },
]

const item = (id, name, price, qty) => ({ id, name, price, qty })
export const DEFAULT_ORDERS = [
  {
    id: 'TC-1006', date: now - 0.1 * day, status: 'pending', payment: 'Cash on Delivery', notes: 'Please call before delivery.',
    customer: { name: 'Prakriti Joshi', phone: '9841000006', email: 'prakriti@example.com', address: 'Jhamsikhel, Ward 3', city: 'Lalitpur' },
    items: [item('turmeric', 'Turmeric Soap', 350, 2), item('honey', 'Honey Soap', 400, 1)], subtotal: 1100, delivery: 0, total: 1100,
  },
  {
    id: 'TC-1005', date: now - 0.9 * day, status: 'confirmed', payment: 'eSewa', notes: '',
    customer: { name: 'Suman Rai', phone: '9851000005', email: 'suman@example.com', address: 'Lakeside Rd', city: 'Pokhara' },
    items: [item('charcoal', 'Active Charcoal Soap', 400, 1)], subtotal: 400, delivery: 100, total: 500,
  },
  {
    id: 'TC-1004', date: now - 2.2 * day, status: 'shipped', payment: 'Khalti', notes: 'Gift wrap please',
    customer: { name: 'Anjali Maharjan', phone: '9803000004', email: 'anjali@example.com', address: 'Kirtipur-5', city: 'Kathmandu' },
    items: [item('sandalwood', 'Sandalwood Soap', 450, 2), item('goatmilk-tulsi', 'Goat Milk with Tulsi Soap', 420, 2)], subtotal: 1740, delivery: 0, total: 1740,
  },
  {
    id: 'TC-1003', date: now - 3.5 * day, status: 'delivered', payment: 'Cash on Delivery', notes: '',
    customer: { name: 'Kiran Tamang', phone: '9860000003', email: 'kiran@example.com', address: 'Boudha', city: 'Kathmandu' },
    items: [item('titepati', 'Titepati Soap', 380, 3)], subtotal: 1140, delivery: 0, total: 1140,
  },
  {
    id: 'TC-1002', date: now - 5.1 * day, status: 'delivered', payment: 'Bank Transfer', notes: '',
    customer: { name: 'Hari Adhikari', phone: '9841000002', email: 'hari@example.com', address: 'Traffic Chowk', city: 'Butwal' },
    items: [item('beetroot', 'Beetroot Soap', 350, 1), item('turmeric', 'Turmeric Soap', 350, 1)], subtotal: 700, delivery: 100, total: 800,
  },
  {
    id: 'TC-1001', date: now - 6.4 * day, status: 'cancelled', payment: 'Cash on Delivery', notes: 'Customer cancelled by phone',
    customer: { name: 'Mira Gurung', phone: '9846000001', email: 'mira@example.com', address: 'Chipledhunga', city: 'Pokhara' },
    items: [item('honey', 'Honey Soap', 400, 2)], subtotal: 800, delivery: 100, total: 900,
  },
]
