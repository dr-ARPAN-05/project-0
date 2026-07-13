import { useEffect, useState } from 'react';
import { Plus, Trash2, Gift, Power } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const BLANK_FORM = {
  product: 'mentorship',
  plan_key: '',
  name: '',
  tagline: '',
  features: '',
  price_paise: '',
  billing_period: 'one_time',
  duration_days: '',
  schedule_type: 'pick_date',
  is_group: false,
  max_redemptions: '',
};

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = () => {
    supabase
      .from('plans')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        setPlans(data || []);
        setLoading(false);
      });
  };

  useEffect(load, []);

  const resetForm = () => setForm(BLANK_FORM);

  const applyFreeSessionPreset = () => {
    setForm({
      ...BLANK_FORM,
      plan_key: `free_session_${Date.now().toString(36)}`,
      name: 'Free Mentorship Session',
      tagline: 'On the house — limited spots',
      features: 'One-time 1-on-1 Zoom session\nPersonalised strategy & doubt-clearing',
      price_paise: '0',
      billing_period: 'one_time',
      schedule_type: 'pick_date',
      max_redemptions: '10',
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        product: form.product,
        plan_key: form.plan_key.trim(),
        name: form.name.trim(),
        tagline: form.tagline.trim() || null,
        features: form.features
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
        price_paise: Math.round(Number(form.price_paise) * 100) || 0,
        billing_period: form.billing_period,
        duration_days: form.duration_days ? Number(form.duration_days) : null,
        schedule_type: form.schedule_type,
        is_group: form.is_group,
        max_redemptions: form.max_redemptions ? Number(form.max_redemptions) : null,
      };
      const { error: err } = await supabase.from('plans').insert(payload);
      if (err) throw err;
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (plan) => {
    await supabase.from('plans').update({ is_active: !plan.is_active }).eq('id', plan.id);
    load();
  };

  const remove = async (plan) => {
    await supabase.from('plans').delete().eq('id', plan.id);
    load();
  };

  return (
    <div>
      <form onSubmit={handleSave} className="rounded-2xl border border-line bg-panel p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-white">Create a new plan</div>
          <button
            type="button"
            onClick={applyFreeSessionPreset}
            className="flex items-center gap-1.5 rounded-lg border border-amber/40 bg-amber/10 px-3 py-1.5 text-xs font-medium text-amber transition hover:bg-amber/20"
          >
            <Gift size={13} /> Free session preset
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Plan key (unique)">
            <input
              required
              value={form.plan_key}
              onChange={(e) => setForm((f) => ({ ...f, plan_key: e.target.value }))}
              placeholder="e.g. personal_session"
              className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-white placeholder:text-white/25"
            />
          </Field>
          <Field label="Product">
            <select
              value={form.product}
              onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))}
              className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-white"
            >
              <option value="mentorship">Mentorship</option>
            </select>
          </Field>
          <Field label="Name">
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-white"
            />
          </Field>
          <Field label="Tagline">
            <input
              value={form.tagline}
              onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
              className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-white"
            />
          </Field>
          <Field label="Price (₹, 0 = free)">
            <input
              type="number"
              min="0"
              step="1"
              required
              value={form.price_paise}
              onChange={(e) => setForm((f) => ({ ...f, price_paise: e.target.value }))}
              className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-white"
            />
          </Field>
          <Field label="Billing period">
            <select
              value={form.billing_period}
              onChange={(e) => setForm((f) => ({ ...f, billing_period: e.target.value }))}
              className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-white"
            >
              <option value="one_time">One-time</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </Field>
          <Field label="Valid for (days, blank = no expiry)">
            <input
              type="number"
              min="1"
              value={form.duration_days}
              onChange={(e) => setForm((f) => ({ ...f, duration_days: e.target.value }))}
              className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-white"
            />
          </Field>
          <Field label="Scheduling">
            <select
              value={form.schedule_type}
              onChange={(e) => setForm((f) => ({ ...f, schedule_type: e.target.value }))}
              className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-white"
            >
              <option value="pick_date">Student picks a one-off date</option>
              <option value="pick_weekly">Student picks a recurring weekday</option>
              <option value="admin_sets">Admin sets the date (group sessions)</option>
            </select>
          </Field>
          <Field label="Max free claims (blank = unlimited)">
            <input
              type="number"
              min="1"
              value={form.max_redemptions}
              onChange={(e) => setForm((f) => ({ ...f, max_redemptions: e.target.value }))}
              className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-white"
            />
          </Field>
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="is_group"
              checked={form.is_group}
              onChange={(e) => setForm((f) => ({ ...f, is_group: e.target.checked }))}
              className="h-4 w-4 rounded border-line"
            />
            <label htmlFor="is_group" className="text-sm text-white/60">
              Group plan
            </label>
          </div>
        </div>

        <Field label="Features (one per line)">
          <textarea
            value={form.features}
            onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
            rows={3}
            className="mt-1 w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-white"
          />
        </Field>

        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="mt-4 flex items-center gap-1.5 rounded-lg bg-violet px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-soft disabled:opacity-50"
        >
          <Plus size={14} /> {saving ? 'Saving…' : 'Create plan'}
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {loading ? (
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
        ) : (
          plans.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border border-line bg-panel px-4 py-3">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  p.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/10 text-white/40'
                }`}
              >
                {p.is_active ? 'active' : 'inactive'}
              </span>
              <div className="flex-1">
                <div className="text-sm text-white">
                  {p.name} <span className="ml-1 text-xs text-white/30">{p.plan_key}</span>
                </div>
                <div className="text-xs text-white/40">
                  {p.price_paise === 0 ? 'Free' : `₹${(p.price_paise / 100).toLocaleString('en-IN')}`} ·{' '}
                  {p.billing_period} · {p.schedule_type}
                  {p.max_redemptions ? ` · max ${p.max_redemptions} claims` : ''}
                </div>
              </div>
              <button onClick={() => toggleActive(p)} className="text-white/40 hover:text-white" title="Toggle active">
                <Power size={14} />
              </button>
              <button onClick={() => remove(p)} className="text-white/30 hover:text-red-400" title="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-white/45">{label}</label>
      {children}
    </div>
  );
}
