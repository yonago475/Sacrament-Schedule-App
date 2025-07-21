import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { DUTIES } from './constants';
import type { Duty, Member, Assignments, ActiveView, NewMember } from './types';
import { Priesthood } from './types';
import { CalendarIcon, UsersIcon, SettingsIcon, WarningIcon } from './components/Icons';
import MemberSelectionModal from './components/MemberSelectionModal';
import MembersView from './components/MembersView';
import SettingsView from './components/SettingsView';
import PasswordModal from './components/PasswordModal';
import { db } from './firebaseConfig';
import { ref, onValue, set, update, remove, push } from 'firebase/database';


const getUpcomingSunday = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay(); // 0 = Sunday
  const daysToAdd = (7 - day) % 7;
  date.setDate(date.getDate() + daysToAdd);
  date.setHours(0, 0, 0, 0);
  return date;
};

const formatDate = (date: Date): string => {
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

const dateToKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const BottomNavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center w-full pt-2 pb-1 ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
    {icon}
    <span className="text-xs mt-1">{label}</span>
  </button>
);

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(getUpcomingSunday(new Date()));
  const [assignments, setAssignments] = useState<Assignments>({});
  const [members, setMembers] = useState<Member[]>([]);
  const [unavailableMembers, setUnavailableMembers] = useState<Record<string, string[]>>({});

  const [activeView, setActiveView] = useState<ActiveView>('schedule');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dutyToAssign, setDutyToAssign] = useState<Duty | null>(null);
  const [memberToAddAsUnavailable, setMemberToAddAsUnavailable] = useState<string>('');
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const membersRef = ref(db, 'members');
    const unsubscribe = onValue(membersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const membersArray: Member[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setMembers(membersArray);
      } else {
        setMembers([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const assignmentsRef = ref(db, 'assignments');
    const unsubscribe = onValue(assignmentsRef, (snapshot) => {
      setAssignments(snapshot.val() || {});
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unavailableRef = ref(db, 'unavailableMembers');
    const unsubscribe = onValue(unavailableRef, (snapshot) => {
        setUnavailableMembers(snapshot.val() || {});
    });
    return () => unsubscribe();
  }, []);

  const membersById = useMemo(() => {
    return members.reduce<Record<string, Member>>((acc, member) => {
      acc[member.id] = member;
      return acc;
    }, {});
  }, [members]);
  
  const dateKey = dateToKey(currentDate);
  const currentUnavailableIds = useMemo(() => unavailableMembers[dateKey] || [], [unavailableMembers, dateKey]);

  const handlePrevWeek = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  const handleSelectClick = (duty: Duty) => {
    setDutyToAssign(duty);
    setIsModalOpen(true);
  };
  
  const handleUnassign = () => {
    if (dutyToAssign) {
        const assignmentRef = ref(db, `assignments/${dateKey}/${dutyToAssign}`);
        set(assignmentRef, null);
    }
    setIsModalOpen(false);
    setDutyToAssign(null);
  };

  const handleSelectMember = (member: Member) => {
    if (dutyToAssign) {
      const assignmentRef = ref(db, `assignments/${dateKey}/${dutyToAssign}`);
      set(assignmentRef, member.id);
    }
    setIsModalOpen(false);
    setDutyToAssign(null);
  };
  
  const availableMembersForDuty = useMemo(() => {
    const unavailableIds = unavailableMembers[dateKey] || [];
    const trulyAvailableMembers = members.filter(m => !unavailableIds.includes(m.id));

    if (!dutyToAssign) {
      return trulyAvailableMembers;
    }
    const blessingDuties = ["祝福パン", "祝福水"];
    if (blessingDuties.includes(dutyToAssign)) {
      return trulyAvailableMembers.filter(m => m.priesthood === Priesthood.PRIEST || m.priesthood === Priesthood.MELCHIZEDEK);
    }
    return trulyAvailableMembers;
  }, [dutyToAssign, members, dateKey, unavailableMembers]);

  const currentAssignments = assignments[dateKey] || {};

  const handleAddUnavailable = () => {
    if (!memberToAddAsUnavailable) return;
    const newUnavailableList = [...currentUnavailableIds, memberToAddAsUnavailable];
    const unavailableRef = ref(db, `unavailableMembers/${dateKey}`);
    set(unavailableRef, newUnavailableList);
    setMemberToAddAsUnavailable('');
  };

  const handleRemoveUnavailable = (memberId: string) => {
    const newUnavailableList = currentUnavailableIds.filter(id => id !== memberId);
    const unavailableRef = ref(db, `unavailableMembers/${dateKey}`);
    set(unavailableRef, newUnavailableList);
  };
  
  const handleSettingsClick = () => {
    if (isAuthenticated) {
        setActiveView('settings');
    } else {
        setIsPasswordModalOpen(true);
    }
  };
  
  const handlePasswordSubmit = (password: string) => {
    if (password === '5475') {
        setIsAuthenticated(true);
        setIsPasswordModalOpen(false);
        setActiveView('settings');
        return true;
    }
    return false;
  };
  
  const addMember = (memberData: NewMember) => {
    const newMemberRef = push(ref(db, 'members'));
    set(newMemberRef, memberData);
  };
  
  const updateMember = (member: Member) => {
    const { id, ...data } = member;
    const memberRef = ref(db, `members/${id}`);
    update(memberRef, data);
  };
  
  const deleteMember = (memberId: string) => {
    const memberRef = ref(db, `members/${memberId}`);
    remove(memberRef);
  };

  const membersAvailableToBeMarkedUnavailable = useMemo(() => {
      return members.filter(m => !currentUnavailableIds.includes(m.id));
  }, [members, currentUnavailableIds]);

  const renderContent = () => {
    switch(activeView) {
      case 'schedule':
        return (
          <div className="p-4 sm:p-6 flex-grow overflow-y-auto">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-slate-800">
                  {formatDate(currentDate)}
              </h2>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <button onClick={handlePrevWeek} className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors">前週</button>
              <button onClick={handleNextWeek} className="px-6 py-2 bg-blue-200 text-blue-800 font-semibold rounded-lg hover:bg-blue-300 transition-colors">次週</button>
            </div>
            <div className="space-y-4">
              {DUTIES.map(duty => {
                const memberId = currentAssignments[duty];
                const member = memberId ? membersById[memberId] : null;
                return (
                  <div key={duty} className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-lg text-gray-600">{duty}</span>
                    <button onClick={() => handleSelectClick(duty)} className="text-lg text-blue-600 font-medium hover:underline">
                      {member ? member.name : '選択'}
                    </button>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <WarningIcon className="w-5 h-5 mr-2 text-orange-500" />
                    この日担当できないメンバー
                </h3>
                <div className="space-y-2 mb-4">
                    {currentUnavailableIds.length > 0 ? (
                        currentUnavailableIds.map(memberId => {
                            const member = membersById[memberId];
                            return (
                                <div key={memberId} className="flex justify-between items-center bg-orange-50 p-2 rounded-md">
                                    <span className="text-gray-700">{member ? member.name : '不明なメンバー'}</span>
                                    <button onClick={() => handleRemoveUnavailable(memberId)} className="text-sm text-red-600 hover:underline font-semibold">削除</button>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-sm text-gray-500">いません</p>
                    )}
                </div>
                
                <div className="flex space-x-2">
                    <select
                        value={memberToAddAsUnavailable}
                        onChange={(e) => setMemberToAddAsUnavailable(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        aria-label="Add unavailable member"
                    >
                        <option value="">メンバーを選択...</option>
                        {membersAvailableToBeMarkedUnavailable.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                    <button 
                        onClick={handleAddUnavailable}
                        disabled={!memberToAddAsUnavailable}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400"
                    >
                        追加
                    </button>
                </div>
            </div>

          </div>
        );
      case 'members':
        return <MembersView members={members} />;
      case 'settings':
        return isAuthenticated ? <SettingsView members={members} addMember={addMember} updateMember={updateMember} deleteMember={deleteMember} /> : <div className="p-6 text-center text-gray-500">アクセスするには認証が必要です。</div>;
      default:
        return null;
    }
  }

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-white flex flex-col shadow-2xl">
      <header className="flex justify-center items-center p-4 border-b">
        <h1 className="text-2xl font-bold text-slate-900">聖餐担当表</h1>
      </header>

      <main className="flex-grow flex flex-col">
        {renderContent()}
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="flex justify-around">
          <BottomNavItem icon={<CalendarIcon className="w-6 h-6" />} label="スケジュール" isActive={activeView === 'schedule'} onClick={() => setActiveView('schedule')} />
          <BottomNavItem icon={<UsersIcon className="w-6 h-6" />} label="メンバー" isActive={activeView === 'members'} onClick={() => setActiveView('members')} />
          <BottomNavItem icon={<SettingsIcon className="w-6 h-6" />} label="設定" isActive={activeView === 'settings'} onClick={handleSettingsClick} />
        </div>
      </footer>
      
      <MemberSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        members={availableMembersForDuty}
        onSelect={handleSelectMember}
        onUnassign={handleUnassign}
        duty={dutyToAssign || ''}
      />
      
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handlePasswordSubmit}
      />
    </div>
  );
};
