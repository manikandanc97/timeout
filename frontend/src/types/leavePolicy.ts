export type LeavePolicyIconKey =
  | 'BookOpen'
  | 'CalendarClock'
  | 'FileCheck'
  | 'Users'
  | 'Scale';

export type LeavePolicySection =
  | {
      kind: 'text';
      iconKey: LeavePolicyIconKey;
      title: string;
      body: string;
    }
  | {
      kind: 'cards';
      iconKey: LeavePolicyIconKey;
      title: string;
      cards: { title: string; body: string }[];
    }
  | {
      kind: 'list';
      iconKey: LeavePolicyIconKey;
      title: string;
      items: string[];
    };

export type LeavePolicyDocument = {
  intro: string;
  footer: string;
  sections: LeavePolicySection[];
};
