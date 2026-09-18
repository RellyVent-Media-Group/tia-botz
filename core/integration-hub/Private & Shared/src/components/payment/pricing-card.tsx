import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Product, openPaymentLink } from '@/lib/stripe';

interface PricingCardProps {
  product: Product;
  featured?: boolean;
}

export function PricingCard({ product, featured = false }: PricingCardProps) {
  return (
    <div
      className={`relative rounded-xl border p-6 ${
        featured
          ? 'border-primary bg-primary/5 shadow-lg scale-105'
          : 'border-border bg-card'
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary px-3 py-1 rounded-full text-xs font-semibold text-primary-foreground">
            Most Popular
          </span>
        </div>
      )}

      <h3 className="text-xl font-bold mb-2">{product.name}</h3>
      <p className="text-muted-foreground text-sm mb-4">{product.description}</p>

      <div className="mb-6">
        <span className="text-3xl font-bold">{product.price}</span>
        {product.id === 'premiumSubscription' && (
          <span className="text-muted-foreground">/month</span>
        )}
      </div>

      <ul className="space-y-2 mb-6">
        {product.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        className="w-full"
        variant={featured ? 'default' : 'outline'}
        onClick={() => openPaymentLink(product.id)}
      >
        Purchase
      </Button>
    </div>
  );
}
