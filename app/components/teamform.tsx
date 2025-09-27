// components/TeamForm.tsx
import { useState, useEffect } from 'react';
import { TeamFormData, Team } from '../types';

interface TeamFormProps {
  onSubmit: (team: TeamFormData) => void;
  editingTeam?: Team | null;
}

export default function TeamForm({ onSubmit, editingTeam }: TeamFormProps) {
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    logo: '',
    country: ''
  });

  useEffect(() => {
    if (editingTeam) {
      setFormData({
        name: editingTeam.name,
        logo: editingTeam.logo,
        country: editingTeam.country
      });
    }
  }, [editingTeam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onSubmit(formData);
    
    if (!editingTeam) {
      setFormData({ name: '', logo: '', country: '' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">
        {editingTeam ? 'تعديل الفريق' : 'إضافة فريق جديد'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">اسم الفريق</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">رابط الشعار</label>
          <input
            type="url"
            name="logo"
            value={formData.logo}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/logo.png"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">الدولة</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-200"
        >
          {editingTeam ? 'تحديث الفريق' : 'إضافة الفريق'}
        </button>
      </form>
    </div>
  );
}