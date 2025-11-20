import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Pricing: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started',
      features: [
        '10 assessments per month',
        '100 responses per month',
        'Basic question types',
        'Email support',
        'Basic analytics',
        'Share via link',
      ],
      cta: 'Start free',
      popular: false,
    },
    {
      name: 'Pro',
      price: { monthly: 29, yearly: 24 },
      description: 'For growing teams',
      features: [
        'Unlimited assessments',
        'Unlimited responses',
        'All question types',
        'AI question generation',
        'Advanced analytics',
        'Custom branding',
        'Priority support',
        'Export to CSV/PDF',
        'Custom templates',
      ],
      cta: 'Start free trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: { monthly: null, yearly: null },
      description: 'For large organizations',
      features: [
        'Everything in Pro',
        'Dedicated account manager',
        'Custom integrations',
        'SSO authentication',
        'Advanced security',
        'SLA guarantee',
        'Custom contract',
        'Training & onboarding',
      ],
      cta: 'Contact sales',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/8112180/pexels-photo-8112180.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Pricing background"
            className="w-full h-full object-cover opacity-5"
          />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-2xl text-gray-600 mb-12">
            Start free. Scale as you grow. Cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-8 py-3 rounded-full font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-8 py-3 rounded-full font-medium transition-all ${
                billingPeriod === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Yearly
              <span className="ml-2 text-sm text-blue-600">Save 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 ${
                plan.popular
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl scale-105'
                  : 'bg-gray-50 text-gray-900'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className={`text-sm mb-6 ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                {plan.description}
              </p>

              <div className="mb-8">
                {plan.price[billingPeriod] !== null ? (
                  <>
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold">${plan.price[billingPeriod]}</span>
                      <span className={`ml-2 ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                        /month
                      </span>
                    </div>
                    {billingPeriod === 'yearly' && plan.price.yearly !== 0 && (
                      <p className={`text-sm mt-2 ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                        Billed ${plan.price.yearly * 12}/year
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-3xl font-bold">Custom</div>
                )}
              </div>

              <Link
                to={plan.name === 'Enterprise' ? '/contact' : '/register'}
                className={`block w-full py-4 rounded-xl font-medium text-center mb-8 transition-all ${
                  plan.popular
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className={`w-6 h-6 mr-3 mt-0.5 flex-shrink-0 ${
                        plan.popular ? 'text-blue-200' : 'text-blue-600'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className={plan.popular ? 'text-blue-50' : 'text-gray-700'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            Frequently asked questions
          </h2>

          <div className="space-y-6">
            <details className="group bg-white rounded-2xl p-6 cursor-pointer">
              <summary className="text-xl font-semibold text-gray-900 list-none flex items-center justify-between">
                Can I change plans later?
                <svg
                  className="w-6 h-6 text-gray-400 group-open:rotate-180 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately,
                and we'll prorate any payments.
              </p>
            </details>

            <details className="group bg-white rounded-2xl p-6 cursor-pointer">
              <summary className="text-xl font-semibold text-gray-900 list-none flex items-center justify-between">
                Is there a free trial for Pro?
                <svg
                  className="w-6 h-6 text-gray-400 group-open:rotate-180 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Yes! You get a 14-day free trial of Pro with no credit card required. Cancel anytime during
                the trial and you won't be charged.
              </p>
            </details>

            <details className="group bg-white rounded-2xl p-6 cursor-pointer">
              <summary className="text-xl font-semibold text-gray-900 list-none flex items-center justify-between">
                What payment methods do you accept?
                <svg
                  className="w-6 h-6 text-gray-400 group-open:rotate-180 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                We accept all major credit cards (Visa, MasterCard, American Express) and PayPal.
                Enterprise customers can also pay via invoice.
              </p>
            </details>

            <details className="group bg-white rounded-2xl p-6 cursor-pointer">
              <summary className="text-xl font-semibold text-gray-900 list-none flex items-center justify-between">
                Do you offer discounts for nonprofits or education?
                <svg
                  className="w-6 h-6 text-gray-400 group-open:rotate-180 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Yes! We offer special pricing for nonprofits, educational institutions, and students.
                Contact our sales team to learn more about available discounts.
              </p>
            </details>

            <details className="group bg-white rounded-2xl p-6 cursor-pointer">
              <summary className="text-xl font-semibold text-gray-900 list-none flex items-center justify-between">
                What happens to my data if I cancel?
                <svg
                  className="w-6 h-6 text-gray-400 group-open:rotate-180 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Your data remains accessible for 30 days after cancellation. You can export everything
                during this time. After 30 days, your data is permanently deleted.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Still have questions?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Our team is here to help you choose the right plan
          </p>
          <Link
            to="/contact"
            className="inline-block px-10 py-5 bg-blue-600 text-white text-xl rounded-2xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl font-medium"
          >
            Contact sales
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
