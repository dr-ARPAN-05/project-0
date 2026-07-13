import { useState } from 'react';
import { Check, Users, User, Gift, ShoppingCart } from 'lucide-react';
import { useCart } from '../../lib/cart';
import { supabase } from '../../lib/supabaseClient';

export default function PlanCard({ plan, onClaimed }) {
  const { items, addItem } = useCart();
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState(null);
  const [claimed, setClaimed] = useState(false);

  const isFree = plan.price_paise === 0;
  const inCart = items.some((i) => i.plan_key === plan.plan_key);

  const handleClaim = async () => {
    setClaiming(true);
    setClaimError(null);
    try {
      const { error } = await supabase.rpc('claim_free_plan', { p_plan_key: plan.plan_key });
      if (error) throw error;
      setClaimed(true);
      onClaimed?.();
    } catch (err) {
      setClaimError(err.message);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-line bg-panel p-6">
      {isFree && (
        <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-amber/15 px-2.5 py-1 text-[11px] font-medium text-amber">
          <Gift size={12} /> Free
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isFree ? 'bg-amber/15 text-amber' : 'bg-violet/15 text-lavender'}`}>
          {plan.is_group ? <Users size={17} /> : <User size={17} />}
        </div>
        <div>
          <div className="font-display font-semibold text-white">{plan.name}</div>
          {plan.tagline && <div className="text-xs text-white/45">{plan.tagline}</div>}
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-1.5">
        <span className={`font-display text-3xl font-bold ${isFree ? 'text-amber' : 'text-white'}`}>
          {isFree ? 'Free' : `₹${(plan.price_paise / 100).toLocaleString('en-IN')}`}
        </span>
        {!isFree && (
          <span className="text-sm text-white/40">
            /{plan.billing_period === 'monthly' ? 'mo' : plan.billing_period === 'yearly' ? 'yr' : 'session'}
          </span>
        )}
      </div>

      {plan.features?.length > 0 && (
        <ul className="mt-5 space-y-2">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-white/60">
              <Check size={14} className={`mt-0.5 shrink-0 ${isFree ? 'text-amber' : 'text-violet-soft'}`} />
              {f}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-6">
        {isFree ? (
          claimed ? (
            <div className="rounded-lg bg-emerald-500/15 py-2.5 text-center text-sm font-semibold text-emerald-400">
              Claimed! Check your dashboard →
            </div>
          ) : (
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="w-full rounded-lg bg-amber py-2.5 text-sm font-semibold text-base transition hover:bg-amber/90 disabled:opacity-50"
            >
              {claiming ? 'Claiming…' : 'Claim for free'}
            </button>
          )
        ) : (
          <button
            onClick={() => addItem(plan)}
            disabled={inCart}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-violet py-2.5 text-sm font-semibold text-white transition hover:bg-violet-soft disabled:opacity-60"
          >
            <ShoppingCart size={14} /> {inCart ? 'In cart' : 'Add to cart'}
          </button>
        )}
        {claimError && <p className="mt-2 text-xs text-red-400">{claimError}</p>}
      </div>
    </div>
  );
}
