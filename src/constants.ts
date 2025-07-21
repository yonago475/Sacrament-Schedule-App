import { Member, Duty, Priesthood } from './types';

export const DUTIES: Duty[] = [
  "祝福パン", // Blessing Bread
  "祝福水",   // Blessing Water
  "パス1",    // Pass 1
  "パス2",    // Pass 2
  "パス3",    // Pass 3
  "パス4"     // Pass 4
];

export const MEMBERS: Member[] = [
  { id: 'm1', name: '佐藤 太郎', priesthood: Priesthood.PRIEST },
  { id: 'm2', name: '鈴木 一郎', priesthood: Priesthood.MELCHIZEDEK },
  { id: 'm3', name: '高橋 三郎', priesthood: Priesthood.TEACHER },
  { id: 'm4', name: '田中 健太', priesthood: Priesthood.TEACHER },
  { id: 'm5', name: '渡辺 雄大', priesthood: Priesthood.DEACON },
  { id: 'm6', name: '伊藤 翼', priesthood: Priesthood.DEACON },
  { id: 'm7', name: '山本 大輔', priesthood: Priesthood.DEACON },
  { id: 'm8', name: '中村 翔', priesthood: Priesthood.DEACON },
  { id: 'm9', name: '小林 直樹', priesthood: Priesthood.PRIEST },
  { id: 'm10', name: '加藤 亮', priesthood: Priesthood.TEACHER },
  { id: 'm11', name: '吉田 拓也', priesthood: Priesthood.DEACON },
  { id: 'm12', name: '山田 蓮', priesthood: Priesthood.MELCHIZEDEK },
];