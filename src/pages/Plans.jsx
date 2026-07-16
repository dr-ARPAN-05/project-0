import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import PlanCard from '../components/plans/PlanCard.jsx';
import SEO from '../components/SEO.jsx';
import BackButton from '../components/BackButton.jsx';

const PRODUCT_LABELS = {
  mentorship: 'Mentorship',
};

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        setPlans(data || []);
        setLoading(false);
      });
  };

  useEffect(load, []);

  // Plans are visible to everyone (logged in or not); login is only
  // required at checkout. Availability windows are enforced here for
  // display AND again server-side in /api/create-order — this filter is
  // just so nobody sees a plan they can't actually buy yet or anymore.
  const now = Date.now();
  const visible = plans.filter((p) => {
    if (p.available_from && new Date(p.available_from).getTime() > now) return false;
    if (p.available_to && new Date(p.available_to).getTime() < now) return false;
    return true;
  });

  const bundles = visible.filter((p) => p.is_bundle);
  const regular = visible.filter((p) => !p.is_bundle);

  const byProduct = regular.reduce((acc, p) => {
    (acc[p.product] ||= []).push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-base px-5 py-16 md:py-20">
      <BackButton fallback="/" />
      <SEO
        title="Plans — arpansarkar.org"
        description="Browse mentorship and other plans across the arpansarkar.org network."
        path="/plans"
      />
      <div className="mx-auto max-w-5xl">
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-amber">Plans</div>
        <h1 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
          Everything you can unlock
        </h1>
        <p className="mt-3 max-w-xl text-sm text-white/50">
          Buy here, use it on the matching app — a mentorship plan unlocks right on your dashboard
          and on mentorship.arpansarkar.org.
        </p>

        {loading ? (
          <div className="mt-10 h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
        ) : visible.length === 0 ? (
          <p className="mt-10 text-sm text-white/40">No plans available right now — check back soon.</p>
        ) : (
          <>
            {bundles.length > 0 && (
              <div className="mt-12">
                <h2 className="mb-4 font-display text-lg font-semibold text-white">Bundles &amp; deals</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {bundles.map((plan) => (
                    <PlanCard key={plan.plan_key} plan={plan} allPlans={plans} onClaimed={load} />
                  ))}
                </div>
              </div>
            )}

            {Object.entries(byProduct).map(([product, productPlans]) => (
              <div key={product} className="mt-12">
                <h2 className="mb-4 font-display text-lg font-semibold text-white">
                  {PRODUCT_LABELS[product] || product}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {productPlans.map((plan) => (
                    <PlanCard key={plan.plan_key} plan={plan} allPlans={plans} onClaimed={load} />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
