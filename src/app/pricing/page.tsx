
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { cn } from '@/lib/utils';
import { doc } from 'firebase/firestore';
import { Check, Crown, Gem, Rocket, Star, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const plans = [
  {
    name: 'Starter',
    price: '$9',
    paymentLink: 'https://buy.stripe.com/test_bJeeV60UwcSF8Tkgmzgbm00',
    features: [
      '500 tokens/day for standard modules',
      '1200 tokens/day for other modules',
      'Basic AI Chat', 
      '10 Image Generations/mo', 
      'Community Support'
    ],
    cta: 'Get Started',
    Icon: Rocket,
    primaryColor: 'bg-orange-500',
    gradient: 'from-orange-500 to-yellow-500',
    shadow: 'shadow-orange-500/30',
  },
  {
    name: 'Plus',
    price: '$19',
    paymentLink: 'https://buy.stripe.com/test_bJeeV60UwcSF8Tkgmzgbm00',
    features: [
      '800 tokens/day for standard modules',
      'All Starter Features', 
      '50 Image Generations/mo', 
      'Priority AI Models',
      'Email Support'
    ],
    cta: 'Upgrade to Plus',
    Icon: Star,
    primaryColor: 'bg-pink-500',
    gradient: 'from-pink-500 to-rose-500',
    shadow: 'shadow-pink-500/30',
  },
  {
    name: 'Pro',
    price: '$49',
    paymentLink: 'https://buy.stripe.com/test_bJeeV60UwcSF8Tkgmzgbm00',
    features: [
        '1500-2000 tokens/day for Pro modules',
        '1000-1500 tokens/day for other modules',
        'All Plus Features',
        'Unlimited Images',
        'Access to Geniea Super',
        'Dedicated Support',
    ],
    cta: 'Upgrade to Pro',
    Icon: Gem,
    primaryColor: 'bg-yellow-500',
    gradient: 'from-yellow-400 via-amber-500 to-orange-500',
    shadow: 'shadow-yellow-500/30',
    recommended: true,
  },
  {
    name: 'Max',
    price: '$99',
    paymentLink: 'https://buy.stripe.com/test_bJeeV60UwcSF8Tkgmzgbm00',
    features: [
      '2000-2500 tokens/day for Pro modules',
      'All Pro Features', 
      'Early Access to New Models', 
      'API Access', 
      '1-on-1 Onboarding'
    ],
    cta: 'Upgrade to Max',
    Icon: Zap,
    primaryColor: 'bg-purple-600',
    gradient: 'from-purple-600 to-indigo-600',
    shadow: 'shadow-purple-600/40',
    dark: true,
  },
  {
    name: 'Infinity+',
    price: 'Custom',
    paymentLink: 'https://buy.stripe.com/test_bJeeV60UwcSF8Tkgmzgbm00',
    features: [
      'Pay As You Go!',
      'Start with 3000+ tokens',
      'All Max Features',
      'Add more tokens anytime',
      'Custom Model Training', 
      'Enterprise-grade Security', 
      'Dedicated AI Specialist'
    ],
    cta: 'Upgrade to Infinity+',
    Icon: Crown,
    primaryColor: 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500',
    gradient: 'from-red-500 via-purple-500 to-blue-500',
    shadow: 'shadow-blue-500/30',
    rainbow: true,
  },
];

export default function PricingPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const handleSelectPlan = (planName: string, paymentLink: string) => {
        if (!user) {
            router.push('/login');
            return;
        }

        // Before redirecting, we optimistically save the plan.
        // In a real-world scenario, you would do this after a successful
        // payment webhook from your payment provider.
        const userRef = doc(firestore, `users/${user.uid}`);
        setDocumentNonBlocking(userRef, { plan: planName }, { merge: true });

        toast({
            title: 'Redirecting to checkout...',
            description: `You are subscribing to the ${planName} plan.`,
        });
        
        // Redirect to the payment link
        window.location.href = paymentLink;
    };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-12 md:py-16 text-center">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            Find the Perfect Plan
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the full power of Moude AI. Choose a plan that fits your needs and start creating today.
          </p>
        </div>
      </header>
      <main className="flex-1 pb-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={cn(
                  'bg-card/50 backdrop-blur-sm border-0 rounded-2xl shadow-lg flex flex-col transition-all duration-300 hover:scale-105 hover:shadow-2xl',
                  plan.shadow,
                  plan.dark ? 'text-primary-foreground bg-gray-900/80' : '',
                  plan.recommended ? 'border-2 border-primary' : 'border-transparent',
                  'lg:col-span-1',
                   plan.name === 'Pro' ? 'xl:col-span-1' : '',
                   plan.name === 'Max' ? 'md:col-span-1' : '',
                   plan.name === 'Infinity+' ? 'md:col-span-2 lg:col-span-3 xl:col-span-1' : ''
                )}
              >
                {plan.recommended && (
                  <div className={cn("absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-sm font-semibold", plan.gradient, plan.dark ? 'text-primary-foreground' : 'text-primary-foreground')}>
                    Recommended
                  </div>
                )}
                <CardHeader className="items-center text-center pt-10">
                   <div className={cn("flex h-12 w-12 items-center justify-center rounded-full mb-4 text-white", plan.primaryColor, plan.rainbow ? '' : plan.gradient)}>
                        <plan.Icon size={24} />
                   </div>
                  <CardTitle className={cn("text-2xl font-bold", plan.dark ? 'text-white' : '')}>{plan.name}</CardTitle>
                  <CardDescription className={cn(plan.dark ? 'text-gray-300' : '')}>
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.price !== 'Custom' && <span className="text-muted-foreground">/month</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className={cn(plan.dark ? 'text-gray-300' : 'text-muted-foreground')}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleSelectPlan(plan.name, plan.paymentLink)}
                    className={cn(
                      'w-full rounded-lg text-lg font-bold py-6 transition-transform duration-200 hover:scale-105',
                      plan.dark ? 'text-white' : 'text-primary-foreground',
                      plan.rainbow ? plan.primaryColor : plan.gradient
                    )}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
