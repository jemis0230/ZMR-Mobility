// "Warranty & Ownership Support" topics.
//
// The default answers below are deliberately neutral: the exact terms (warranty
// periods, NOC timelines, insurance coverage, buyback eligibility, fees) have NOT
// been confirmed by the ZMR team. Staff publish confirmed wording from
// Admin → FAQs by choosing a "Policy topic"; that content then replaces the
// default everywhere (policy page, home section, vehicle pages and FAQs).

export const POLICY_TOPICS = [
  {
    key: 'warranty',
    title: 'Warranty confirmation',
    question: 'What warranty comes with a ZMR vehicle?',
    defaultAnswer:
      'Warranty coverage depends on the vehicle. Where a warranty has been recorded for a vehicle, it is shown on that vehicle’s page. Contact ZMR Mobility to confirm the applicable terms for this vehicle before you buy.',
    pending: ['Warranty duration and what it covers (battery, motor, controller, other parts)', 'Whether any ZMR extended warranty applies, and how a claim is raised'],
  },
  {
    key: 'ownership_transfer',
    title: 'Ownership & registration transfer',
    question: 'How is vehicle ownership (RC) transferred?',
    defaultAnswer:
      'Registration (RC) transfer requirements depend on the vehicle and the RTO. Contact ZMR Mobility to confirm the applicable transfer process, documents and timeline for this vehicle.',
    pending: ['Who handles the RC transfer and what documents the buyer provides', 'Typical transfer timeline and any fees'],
  },
  {
    key: 'noc',
    title: 'NOC assistance',
    question: 'Will I receive an NOC, and how long does it take?',
    defaultAnswer:
      'If a No Objection Certificate (NOC) is required — for example, after a loan closure or an inter-state transfer — contact ZMR Mobility to confirm the assistance available and the applicable processing period for this vehicle.',
    pending: ['When an NOC is required and who obtains it', 'The processing period ZMR can commit to'],
  },
  {
    key: 'insurance',
    title: 'Insurance',
    question: 'Is the vehicle insured, and can the insurance be transferred?',
    defaultAnswer:
      'Insurance status varies by vehicle. Contact ZMR Mobility to confirm whether the vehicle has active insurance, whether it can be transferred to you, and what assistance is available for renewal.',
    pending: ['Whether vehicles are sold with active insurance', 'Insurance transfer / renewal assistance and any costs'],
  },
  {
    key: 'buyback',
    title: 'Vehicle buyback',
    question: 'Does ZMR Mobility offer vehicle buyback?',
    defaultAnswer:
      'Buyback availability and eligibility depend on the vehicle and its condition. Contact ZMR Mobility to confirm whether buyback applies to this vehicle and on what terms.',
    pending: ['Whether buyback is offered, and for which vehicles', 'Eligibility conditions and how the buyback price is determined'],
  },
] as const;

export type PolicyTopicKey = (typeof POLICY_TOPICS)[number]['key'];

export const POLICY_TOPIC_KEYS: readonly PolicyTopicKey[] = POLICY_TOPICS.map((t) => t.key);

export function isPolicyTopic(v: unknown): v is PolicyTopicKey {
  return typeof v === 'string' && (POLICY_TOPIC_KEYS as readonly string[]).includes(v);
}

export function policyTopicTitle(key: string | null | undefined): string | null {
  return POLICY_TOPICS.find((t) => t.key === key)?.title ?? null;
}

export interface PolicyItem {
  key: PolicyTopicKey;
  title: string;
  question: string;
  answer: string;
  /** true when staff have published wording for this topic in Admin → FAQs */
  confirmed: boolean;
}

export const POLICY_CONTACT = {
  phone: '+91 90452 22999',
  phoneHref: 'tel:+919045222999',
  email: 'info@zmrmobility.in',
};
