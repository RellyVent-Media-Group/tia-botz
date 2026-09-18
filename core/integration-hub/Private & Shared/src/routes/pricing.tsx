import { createFileRoute } from '@tanstack/react-router';
import { PricingSection } from '@/components/payment/pricing-section';

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Pricing</h1>
          <p className="text-muted-foreground mt-1">
            Choose the perfect plan for your creative needs
          </p>
        </div>
      </div>
      <PricingSection />
    </div>
  );
}
