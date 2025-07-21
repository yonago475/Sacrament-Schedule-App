import React from 'react';
import type { Member } from '../types';

interface MembersViewProps {
  members: Member[];
}

const MembersView: React.FC<MembersViewProps> = ({ members }) => {
    return (
        <div className="p-4 sm:p-6 flex-grow overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-800 mb-4">メンバー一覧</h2>
            
            <div className="space-y-3">
                {members.length > 0 ? members.map(member => (
                    <div key={member.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                        <p className="font-semibold text-gray-800">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.priesthood}</p>
                    </div>
                )) : (
                    <p className="text-gray-500 text-center mt-8">メンバーが登録されていません。</p>
                )}
            </div>
        </div>
    );
};
