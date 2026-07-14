import { useEffect, useState } from 'react';
import { Plus, Trash2, Link2, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { SLOT_LABELS } from '../../lib/mentorshipLabels';

export default function AdminGroupSessions() {
  const [sessions, setSessions] = useState([]);
  const [groupPlans, setGroupPlans] = useState([]);
  const [form, setForm] = useState({ plan_key: '', session_date: '', session_slot: '19:00', zoom_link: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editLink, setEditLink] = useState('');
  const [savingLink, setSavingLink] = useState(false);

  useEffect(() => {
    supabase
      .from('group_sessions')
      .select('*')
      .order('session_date', { ascending: true })
      .then(({ data }) => setSessions(data || []));

    // Any plan with schedule_type = 'admin_sets' needs its sessions
    // scheduled here — free or paid, single or recurring, whatever
    // plan_key was given on the Plans tab. This used to be a hardcoded
    // 2-option list ('group_session' / 'group_monthly') which meant any
    // custom plan (e.g. a free-session preset) had nowhere to be scheduled.
    supabase
      .from('plans')
      .select('plan_key, name, billing_period, is_active')
      .eq('product', 'mentorship')
      .eq('schedule_type', 'admin_sets')
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        const plans = data || [];
        setGroupPlans(plans);
        if (plans.length > 0) {
          setForm((f) => (f.plan_key ? f : { ...f, plan_key: plans[0].plan_key }));
        }
      });
  }, []);

  const add = async () => {
    if (!form.session_date || !form.session_slot || !form.plan_key) return;
    setSaving(true);
    const { data } = await supabase.from('group_sessions').insert(form).select().single();
    if (data) setSessions((s) => [...s, data]);
    setForm((f) => ({ ...f, session_date: '', zoom_link: '', notes: '' }));
    setSaving(false);
  };

  const remove = async (id) => {
    await supabase.from('group_sessions').delete().eq('id', id);
    setSessions((s) => s.filter((x) => x.id !== id));
  };

  const startEditLink = (s) => {
    setEditingId(s.id);
    setEditLink(s.zoom_link || '');
  };

  const cancelEditLink = () => {
    setEditingId(null);
    setEditLink('');
  };

  const saveLink = async (id) => {
    setSavingLink(true);
    const { data, error } = await supabase
      .from('group_sessions')
      .update({ zoom_link: editLink.trim() || null })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      setSessions((s) => s.map((x) => (x.id === id ? data : x)));
      setEditingId(null);
      setEditLink('');
    }
    setSavingLink(false);
  };

  const planName = (key) => groupPlans.find((p) => p.plan_key === key)?.name || key;

  return (
    <div>
      <div className="rounded-2xl border border-line bg-panel p-5">
        <div className="mb-3 text-sm font-semibold text-white">Add new group session</div>
        {groupPlans.length === 0 ? (
          <p className="text-sm text-white/40">
            No group plans yet. Create one on the Plans tab first — set "Scheduling" to "Admin sets the date
            (group sessions)" — then come back here to schedule its sessions.
          </p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs text-white/45">Plan</label>
                <select
                  value={form.plan_key}
                  onChange={(e) => setForm((f) => ({ ...f, plan_key: e.target.value }))}
                  className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-white"
                >
                  {groupPlans.map((p) => (
                    <option key={p.plan_key} value={p.plan_key}>
                      {p.name} {!p.is_active && '(inactive)'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/45">Date</label>
                <input
                  type="date"
                  value={form.session_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm((f) => ({ ...f, session_date: e.target.value }))}
                  className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/45">Time slot</label>
                <select
                  value={form.session_slot}
                  onChange={(e) => setForm((f) => ({ ...f, session_slot: e.target.value }))}
                  className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-white"
                >
                  {Object.entries(SLOT_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/45">Zoom link (optional now, can add later)</label>
                <input
                  type="url"
                  placeholder="https://zoom.us/j/..."
                  value={form.zoom_link}
                  onChange={(e) => setForm((f) => ({ ...f, zoom_link: e.target.value }))}
                  className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-white placeholder:text-white/25"
                />
              </div>
            </div>
            <button
              onClick={add}
              disabled={saving}
              className="mt-3 flex items-center gap-1.5 rounded-lg bg-violet px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-soft disabled:opacity-50"
            >
              <Plus size={14} /> {saving ? 'Saving…' : 'Add session'}
            </button>
          </>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {sessions.length === 0 && <p className="text-sm text-white/35">No sessions scheduled yet.</p>}
        {sessions.map((s) => (
          <div key={s.id} className="rounded-xl border border-line bg-panel px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-violet/15 px-2.5 py-1 text-[11px] font-medium text-lavender">
                {planName(s.plan_key)}
              </span>
              <div className="flex-1">
                <div className="text-sm text-white">
                  {new Date(s.session_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                <div className="text-xs text-white/40">{SLOT_LABELS[s.session_slot] || s.session_slot}</div>
              </div>
              {editingId !== s.id && (
                <button
                  onClick={() => startEditLink(s)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition ${
                    s.zoom_link
                      ? 'border-line text-white/60 hover:text-white'
                      : 'border-amber-500/40 text-amber-400 hover:border-amber-500/70'
                  }`}
                >
                  <Link2 size={12} /> {s.zoom_link ? 'Edit link' : 'Add link'}
                </button>
              )}
              <button onClick={() => remove(s.id)} className="text-white/30 hover:text-red-400">
                <Trash2 size={14} />
              </button>
            </div>

            {editingId === s.id && (
              <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
                <input
                  autoFocus
                  type="url"
                  placeholder="https://zoom.us/j/..."
                  value={editLink}
                  onChange={(e) => setEditLink(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveLink(s.id)}
                  className="flex-1 rounded-lg border border-line bg-base px-3 py-1.5 text-sm text-white placeholder:text-white/25"
                />
                <button
                  onClick={() => saveLink(s.id)}
                  disabled={savingLink}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet text-white transition hover:bg-violet-soft disabled:opacity-50"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={cancelEditLink}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-white/50 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {editingId !== s.id && s.zoom_link && (
              <div className="mt-1 truncate pl-[52px] text-xs text-white/30">{s.zoom_link}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
