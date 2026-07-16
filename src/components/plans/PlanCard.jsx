import { useState } from 'react';
import { Check, Users, User, Gift, ShoppingCart, Package, Tag } from 'lucide-react';
import { useCart } from '../../lib/cart';
import { supabase } from '../../lib/supabaseClient';

export default function PlanCard({ plan, allPlans, onClaimed }) {
  const { items, addItem } = useCart();
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState(null);
  const [claimed, setClaimed] = useState(false);

  const isFree = plan.price_paise === 0;
  const inCart = items.some((i) => i.plan_key === plan.plan_key);
  const hasDiscount = plan.compare_at_price_paise > plan.price_paise;
  const discountPct = hasDiscount
    ? Math.round((1 - plan.price_paise / plan.compare_at_price_paise) * 100)
    : null;

  const includedNames =
    plan.is_bundle && plan.bundle_plan_keys
      ? plan.bundle_plan_keys.map((key) => allPlans?.find((p) => p.plan_key === key)?.name || key)
      : [];

  const dealEndsSoon =
    plan.available_to && new Date(plan.available_to) - Date.now() < 3 * 86400000 && new Date(plan.available_to) > Date.now();

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
    <div
      className={`flex flex-col rounded-2xl border p-6 ${
        plan.is_bundle ? 'border-violet/40 bg-panel shadow-glow' : 'border-line bg-panel'
      }`}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {isFree && (
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber/15 px-2.5 py-1 text-[11px] font-medium text-amber">
            <Gift size={12} /> Free
          </div>
        )}
        {hasDiscount && (
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber/15 px-2.5 py-1 text-[11px] font-medium text-amber">
            <Tag size={12} /> {discountPct}% off
          </div>
        )}
        {plan.is_bundle && (
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-violet/15 px-2.5 py-1 text-[11px] font-medium text-lavender">
            <Package size={12} /> Bundle
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            isFree ? 'bg-amber/15 text-amber' : 'bg-violet/15 text-lavender'
          }`}
        >
          {plan.is_bundle ? <Package size={17} /> : plan.is_group ? <Users size={17} /> : <User size={17} />}
        </div>
        <div>
          <div className="font-display font-semibold text-white">{plan.name}</div>
          {plan.tagline && <div className="text-xs text-white/45">{plan.tagline}</div>}
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-1.5">
        {hasDiscount && (
          <span className="text-sm text-white/30 line-through">
            ₹{(plan.compare_at_price_paise / 100).toLocaleString('en-IN')}
          </span>
        )}
        <span className={`font-display text-3xl font-bold ${isFree ? 'text-amber' : 'text-white'}`}>
          {isFree ? 'Free' : `₹${(plan.price_paise / 100).toLocaleString('en-IN')}`}
        </span>
        {!isFree && (
          <span className="text-sm text-white/40">
            /{plan.billing_period === 'monthly' ? 'mo' : plan.billing_period === 'yearly' ? 'yr' : 'session'}
          </span>
        )}
      </div>

      {dealEndsSoon && (
        <p className="mt-1.5 text-[11px] font-medium text-amber">
          Deal ends {new Date(plan.available_to).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </p>
      )}

      {plan.is_bundle && includedNames.length > 0 && (
        <div className="mt-4 rounded-lg border border-line/70 bg-base/60 p-3">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-white/40">Includes</p>
          <ul className="space-y-1">
            {includedNames.map((n) => (
              <li key={n} className="flex items-start gap-2 text-sm text-white/70">
                <Check size={13} className="mt-0.5 shrink-0 text-lavender" /> {n}
              </li>
            ))}
          </ul>
        </div>
      )}

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
