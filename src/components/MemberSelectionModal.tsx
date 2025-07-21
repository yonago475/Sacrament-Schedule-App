import React from 'react';
import type { Member } from '../types';

interface MemberSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onSelect: (member: Member) => void;
  onUnassign: () => void;
  duty: string;
}

const MemberSelectionModal: React.FC<MemberSelectionModalProps> = ({
  isOpen,
  onClose,
  members,
  onSelect,
  onUnassign,
  duty,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-sm m-4 max-h-[80vh] flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{`「${duty}」担当選択`}</h2>
          <p className="text-sm text-gray-500">担当するメンバーを選択してください</p>
        </div>
        <div className="overflow-y-auto">
            {members.map((member) => (
              <div
                key={member.id}
                onClick={() => onSelect(member)}
                className="p-4 border-b cursor-pointer hover:bg-gray-100 text-gray-700"
              >
                {member.name}
              </div>
            ))}
        </div>
        <div className="p-4 border-t flex flex-col space-y-2">
            <button
                onClick={onUnassign}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
                割り当て解除
            </button>
            <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
            >
                キャンセル
            </button>
        </div>
      </div>
    </div>
  );
};
