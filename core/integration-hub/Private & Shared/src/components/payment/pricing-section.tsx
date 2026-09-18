import { PricingCard } from './pricing-card';
import { PRODUCTS } from '@/lib/stripe';

export function PricingSection() {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get access to AI character prompts for your creative projects. All plans include
            instant access and lifetime updates where applicable.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((product) => (
            <PricingCard
              key={product.id}
              product={product}
              featured={product.id === 'premiumSubscription'}
            />
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>All payments are processed securely through Stripe.</p>
          <p className="mt-2">
            Need help? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </section>
  );
}
