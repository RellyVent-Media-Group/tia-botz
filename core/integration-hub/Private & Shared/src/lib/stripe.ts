/**
 * Stripe Payment Integration
 * Handles payment links and checkout functionality
 */

export const STRIPE_CONFIG = {
  // Payment links (create these in Stripe Dashboard)
  paymentLinks: {
    singlePrompt: process.env.STRIPE_SINGLE_PROMPT_LINK || 'https://buy.stripe.com/test',
    characterPack10: process.env.STRIPE_CHARACTER_PACK_10_LINK || 'https://buy.stripe.com/test',
    allCharacters: process.env.STRIPE_ALL_CHARACTERS_LINK || 'https://buy.stripe.com/test',
    premiumSubscription: process.env.STRIPE_PREMIUM_SUBSCRIPTION_LINK || 'https://buy.stripe.com/test',
    starterKit: process.env.STRIPE_STARTER_KIT_LINK || 'https://buy.stripe.com/test',
  },

  // Pricing
  pricing: {
    singlePrompt: { amount: 2.99, currency: 'USD' },
    characterPack10: { amount: 19.99, currency: 'USD' },
    allCharacters: { amount: 49.99, currency: 'USD' },
    premiumSubscription: { amount: 9.99, currency: 'USD', recurring: 'monthly' },
    starterKit: { amount: 29.99, currency: 'USD' },
  },
};

export type ProductType = keyof typeof STRIPE_CONFIG.paymentLinks;

export interface Product {
  id: ProductType;
  name: string;
  description: string;
  price: string;
  link: string;
  features: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: 'singlePrompt',
    name: 'Single Character Prompt',
    description: 'Perfect for testing out our AI character prompts',
    price: '$2.99',
    link: STRIPE_CONFIG.paymentLinks.singlePrompt,
    features: [
      '1 character prompt',
      'Full character details',
      'Instant access',
    ],
  },
  {
    id: 'characterPack10',
    name: '10 Character Pack',
    description: 'Great for small projects and content creation',
    price: '$19.99',
    link: STRIPE_CONFIG.paymentLinks.characterPack10,
    features: [
      '10 character prompts',
      'Variety of archetypes',
      'Downloadable',
    ],
  },
  {
    id: 'allCharacters',
    name: 'All 45 Characters',
    description: 'Complete character database for maximum creativity',
    price: '$49.99',
    link: STRIPE_CONFIG.paymentLinks.allCharacters,
    features: [
      'All 45 characters',
      'All rarities included',
      'Lifetime access',
    ],
  },
  {
    id: 'premiumSubscription',
    name: 'Premium Subscription',
    description: 'Unlimited access to all features and new characters',
    price: '$9.99/month',
    link: STRIPE_CONFIG.paymentLinks.premiumSubscription,
    features: [
      'Unlimited character prompts',
      'Batch requests (up to 10)',
      'Advanced search filters',
      'Priority support',
      'Early access to new characters',
    ],
  },
  {
    id: 'starterKit',
    name: 'Starter Kit',
    description: 'Complete package with everything you need to launch',
    price: '$29.99',
    link: STRIPE_CONFIG.paymentLinks.starterKit,
    features: [
      'All character prompts',
      'Marketing templates',
      'Workflow guides',
      'Launch checklist',
    ],
  },
];

/**
 * Open Stripe payment link in new window
 */
export function openPaymentLink(productId: ProductType) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (product && product.link !== 'https://buy.stripe.com/test') {
    window.open(product.link, '_blank');
  } else {
    console.warn('Payment link not configured or is test link');
  }
}

/**
 * Check if payment links are configured
 */
export function arePaymentLinksConfigured(): boolean {
  return Object.values(STRIPE_CONFIG.paymentLinks).every(
    link => link && link !== 'https://buy.stripe.com/test'
  );
}
