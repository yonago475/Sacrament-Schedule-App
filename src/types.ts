export enum Priesthood {
  DEACON = '執事',
  TEACHER = '教師',
  PRIEST = '祭司',
  MELCHIZEDEK = 'メルキゼデク',
}

export interface Member {
  id: string;
  name: string;
  priesthood: Priesthood;
}

export type NewMember = Omit<Member, 'id'>;

export type Duty = string;

// Structure: { 'YYYY-MM-DD': { 'DutyName': 'MemberId' | null, ... }, ... }
export type Assignments = Record<string, Record<Duty, string | null>>;

export type ActiveView = 'schedule' | 'members' | 'settings';