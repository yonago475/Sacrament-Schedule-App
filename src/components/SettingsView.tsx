import React, { useState } from 'react';
import type { Member, NewMember } from '../types';
import { Priesthood } from '../types';

interface SettingsViewProps {
  members: Member[];
  addMember: (member: NewMember) => void;
  updateMember: (member: Member) => void;
  deleteMember: (memberId: string) => void;
}

const MemberForm: React.FC<{
    memberToEdit: Member | null;
    onSave: (member: Omit<Member, 'id'> & { id?: string }) => void;
    onCancel: () => void;
}> = ({ memberToEdit, onSave, onCancel }) => {
    const [name, setName] = useState(memberToEdit?.name || '');
    const [priesthood, setPriesthood] = useState(memberToEdit?.priesthood || Priesthood.DEACON);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave({ id: memberToEdit?.id, name, priesthood });
    };
    
    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">{memberToEdit ? 'メンバー編集' : 'メンバー追加'}</h3>
            <div className="space-y-4">
                 <input
                    type="text"
                    placeholder="名前"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    aria-label="Member Name"
                />
                <select
                    value={priesthood}
                    onChange={(e) => setPriesthood(e.target.value as Priesthood)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="Priesthood"
                >
                    {Object.values(Priesthood).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <div className="flex justify-end space-x-3">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">キャンセル</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600">{memberToEdit ? '更新' : '追加'}</button>
                </div>
            </div>
        </form>
    );
}

const SettingsView: React.FC<SettingsViewProps> = ({ members, addMember, updateMember, deleteMember }) => {
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const handleSave = (memberData: Omit<Member, 'id'> & { id?: string }) => {
        const { id, ...newMemberData } = memberData;
        if (id) { // Editing existing member
            updateMember({ ...newMemberData, id } as Member);
        } else { // Adding new member
            addMember(newMemberData as NewMember);
        }
        setEditingMember(null);
        setIsAdding(false);
    };
    
    const handleDelete = (memberId: string) => {
        if (window.confirm('このメンバーを削除してもよろしいですか？')) {
            deleteMember(memberId);
        }
    };
    
    const handleAddNew = () => {
        setEditingMember(null);
        setIsAdding(true);
    };

    const handleEdit = (member: Member) => {
        setIsAdding(false);
        setEditingMember(member);
    };

    const handleCancel = () => {
        setEditingMember(null);
        setIsAdding(false);
    };
    
    const showForm = isAdding || editingMember !== null;

    return (
        <div className="p-4 sm:p-6 flex-grow overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-800 mb-4">設定</h2>
            
            <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-slate-700 mb-2">メンバー管理</h3>
                {!showForm && (
                    <button 
                        onClick={handleAddNew}
                        className="w-full mb-6 px-4 py-2 bg-indigo-500 text-white rounded-lg shadow-sm hover:bg-indigo-600 transition-colors"
                    >
                        + 新規メンバーを追加
                    </button>
                )}

                {showForm && <MemberForm memberToEdit={editingMember} onSave={handleSave} onCancel={handleCancel} />}
                
                <div className="space-y-3">
                    {members.map(member => (
                        <div key={member.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-gray-800">{member.name}</p>
                                <p className="text-sm text-gray-500">{member.priesthood}</p>
                            </div>
                            <div className="space-x-2">
                                <button onClick={() => handleEdit(member)} className="text-sm text-blue-600 hover:underline">編集</button>
                                <button onClick={() => handleDelete(member.id)} className="text-sm text-red-600 hover:underline">削除</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
