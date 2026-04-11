/** Allowed `iconKey` values for leave policy sections (matches frontend Lucide icons). */
export const LEAVE_POLICY_ICON_KEYS = [
  'BookOpen',
  'CalendarClock',
  'FileCheck',
  'Users',
  'Scale',
];

const ALLOWED_ICONS = new Set(LEAVE_POLICY_ICON_KEYS);

/** Built-in policy when `Organization.leavePolicy` is null. */
export const DEFAULT_LEAVE_POLICY = {
  intro:
    'The guidelines below reflect common corporate practice. Your organisation may define exact entitlements, blackout dates, and approval levels—always follow internal HR communications and your employment contract when they differ from this summary.',
  footer:
    'Questions? Contact your manager or HR. For system issues with Timeout, reach out to your IT or HR operations contact.',
  sections: [
    {
      kind: 'text',
      iconKey: 'BookOpen',
      title: 'Purpose & scope',
      body: 'This policy explains how leave is earned, requested, approved, and recorded for employees. It applies to all full-time and part-time staff unless your employment contract or local law specifies otherwise. The company may update this policy; the version in the Timeout app is the one in effect.',
    },
    {
      kind: 'cards',
      iconKey: 'CalendarClock',
      title: 'Types of leave',
      cards: [
        {
          title: 'Annual leave',
          body: 'For planned time away from work, rest, and personal commitments. Typically accrued over the calendar or financial year (as defined by your organisation). Requests should be submitted in advance and approved by your manager based on team coverage and business needs.',
        },
        {
          title: 'Sick leave',
          body: 'For illness, injury, or medical appointments. Short absences may be self-declared; longer or repeated absences may require a medical certificate or fit-to-work note at HR or manager request. Misuse of sick leave may lead to disciplinary action.',
        },
        {
          title: 'Maternity leave',
          body: 'For employees who are pregnant or have recently given birth, aligned with applicable employment and maternity-benefit laws in your country. Duration, pay, and notice rules follow statute and company guidelines; HR will confirm eligibility and paperwork.',
        },
        {
          title: 'Paternity / partner leave',
          body: 'For new parents to support their family around birth or adoption. Entitlement and duration are set by company policy and local law; apply through the same process as other leave types with reasonable advance notice where possible.',
        },
      ],
    },
    {
      kind: 'list',
      iconKey: 'FileCheck',
      title: 'Applying for leave',
      items: [
        'Submit requests through Timeout (Apply Leave) with start and end dates, leave type, and a clear reason where required.',
        'Plan annual leave ahead where you can; last-minute requests may be declined if coverage is insufficient.',
        'For emergencies, notify your manager (and HR if needed) as soon as possible, then record the absence in the system when you are able to.',
        'You can track status (pending, approved, rejected) under My Leaves.',
      ],
    },
    {
      kind: 'list',
      iconKey: 'Users',
      title: 'Approval & balancing',
      items: [
        'Managers approve leave based on operational needs, fairness across the team, and policy rules. HR may be involved for long absences, statutory leave, or exceptions.',
        'Public holidays and weekly off-days are usually excluded when counting working days for leave, unless your contract says otherwise.',
        'Leave balances shown in Timeout reflect approved records; contact HR if you believe a balance is incorrect.',
      ],
    },
    {
      kind: 'list',
      iconKey: 'Scale',
      title: 'General rules',
      items: [
        'Probation: leave during probation may be limited or require additional approval—follow your offer letter or HR guidance.',
        'Carry forward & lapse: annual leave may be carried forward up to a cap defined by the company; unused leave may lapse at year-end unless policy allows encashment or special carry-over.',
        'Concurrent leave: do not take other paid work or activities that conflict with the purpose of approved leave without prior approval.',
        'Notice period / resignation: leave during notice may be restricted or subject to manager and HR approval.',
      ],
    },
  ],
};

/**
 * @param {unknown} raw
 * @returns {{ ok: true, value: typeof DEFAULT_LEAVE_POLICY } | { ok: false, message: string }}
 */
export function validateLeavePolicy(raw) {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, message: 'Policy must be a JSON object' };
  }

  const { intro, footer, sections } = raw;

  if (typeof intro !== 'string' || intro.length > 8000) {
    return { ok: false, message: 'Intro must be a string (max 8000 characters)' };
  }
  if (typeof footer !== 'string' || footer.length > 4000) {
    return { ok: false, message: 'Footer must be a string (max 4000 characters)' };
  }
  if (!Array.isArray(sections) || sections.length < 1 || sections.length > 20) {
    return { ok: false, message: 'Sections must be a non-empty array (max 20)' };
  }

  const outSections = [];

  for (let i = 0; i < sections.length; i += 1) {
    const s = sections[i];
    if (!s || typeof s !== 'object') {
      return { ok: false, message: `Section ${i + 1} is invalid` };
    }

    const { kind, iconKey, title } = s;
    if (kind !== 'text' && kind !== 'cards' && kind !== 'list') {
      return { ok: false, message: `Section ${i + 1}: invalid kind` };
    }
    if (typeof iconKey !== 'string' || !ALLOWED_ICONS.has(iconKey)) {
      return { ok: false, message: `Section ${i + 1}: invalid iconKey` };
    }
    if (typeof title !== 'string' || !title.trim() || title.length > 200) {
      return { ok: false, message: `Section ${i + 1}: title is required (max 200 characters)` };
    }

    if (kind === 'text') {
      if (typeof s.body !== 'string' || s.body.length > 20000) {
        return { ok: false, message: `Section ${i + 1}: body must be a string (max 20000 characters)` };
      }
      outSections.push({
        kind: 'text',
        iconKey,
        title: title.trim(),
        body: s.body,
      });
    } else if (kind === 'cards') {
      if (!Array.isArray(s.cards) || s.cards.length < 1 || s.cards.length > 12) {
        return { ok: false, message: `Section ${i + 1}: cards must have 1–12 items` };
      }
      const cards = [];
      for (let j = 0; j < s.cards.length; j += 1) {
        const c = s.cards[j];
        if (!c || typeof c !== 'object') {
          return { ok: false, message: `Section ${i + 1}, card ${j + 1}: invalid` };
        }
        if (typeof c.title !== 'string' || !c.title.trim() || c.title.length > 150) {
          return { ok: false, message: `Section ${i + 1}, card ${j + 1}: title required` };
        }
        if (typeof c.body !== 'string' || c.body.length > 8000) {
          return { ok: false, message: `Section ${i + 1}, card ${j + 1}: body invalid` };
        }
        cards.push({ title: c.title.trim(), body: c.body });
      }
      outSections.push({
        kind: 'cards',
        iconKey,
        title: title.trim(),
        cards,
      });
    } else {
      if (!Array.isArray(s.items) || s.items.length < 1 || s.items.length > 40) {
        return { ok: false, message: `Section ${i + 1}: list must have 1–40 items` };
      }
      const items = [];
      for (let j = 0; j < s.items.length; j += 1) {
        const it = s.items[j];
        if (typeof it !== 'string' || !it.trim() || it.length > 2000) {
          return { ok: false, message: `Section ${i + 1}, item ${j + 1}: invalid text` };
        }
        items.push(it.trim());
      }
      outSections.push({
        kind: 'list',
        iconKey,
        title: title.trim(),
        items,
      });
    }
  }

  return {
    ok: true,
    value: {
      intro: intro.trim(),
      footer: footer.trim(),
      sections: outSections,
    },
  };
}
