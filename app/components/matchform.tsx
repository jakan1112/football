// components/MatchForm.tsx
import { useState, useEffect } from 'react';
import { Team, MatchFormData, Match } from '../types';

interface MatchFormProps {
  teams: Team[];
  onSubmit: (match: Omit<MatchFormData, 'homeTeamId' | 'awayTeamId'> & { homeTeamId: number; awayTeamId: number }) => void;
  editingMatch?: Match | null;
}

export default function MatchForm({ teams, onSubmit, editingMatch }: MatchFormProps) {
  const [formData, setFormData] = useState<MatchFormData>({
    homeTeamId: '',
    awayTeamId: '',
    date: '',
    time: '',
    streamEmbed: '',
    league: ''
  });

  useEffect(() => {
    if (editingMatch) {
      setFormData({
        homeTeamId: editingMatch.homeTeamId.toString(),
        awayTeamId: editingMatch.awayTeamId.toString(),
        date: editingMatch.date,
        time: editingMatch.time,
        streamEmbed: editingMatch.streamEmbed,
        league: editingMatch.league || ''
      });
    }
  }, [editingMatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.homeTeamId || !formData.awayTeamId) return;
    
    onSubmit({
      ...formData,
      homeTeamId: parseInt(formData.homeTeamId),
      awayTeamId: parseInt(formData.awayTeamId)
    });
    
    if (!editingMatch) {
      setFormData({
        homeTeamId: '',
        awayTeamId: '',
        date: '',
        time: '',
        streamEmbed: '',
        league: ''
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">
        {editingMatch ? 'تعديل المباراة' : 'إضافة مباراة جديدة'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-300 mb-2 font-medium">الفريق المضيف</label>
            <select
              name="homeTeamId"
              value={formData.homeTeamId}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">اختر الفريق المضيف</option>
              {teams.map(team => (
                <option key={team.id} value={team.id.toString()}>{team.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2 font-medium">الفريق الضيف</label>
            <select
              name="awayTeamId"
              value={formData.awayTeamId}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">اختر الفريق الضيف</option>
              {teams.map(team => (
                <option key={team.id} value={team.id.toString()}>{team.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-300 mb-2 font-medium">التاريخ</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2 font-medium">الوقت</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-300 mb-2 font-medium">البطولة (اختياري)</label>
          <input
            type="text"
            name="league"
            value={formData.league}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="الدوري السعودي, دوري أبطال أوروبا, etc."
          />
        </div>
        
        <div>
          <label className="block text-gray-300 mb-2 font-medium">كود البث المباشر</label>
          <textarea
            name="streamEmbed"
            value={formData.streamEmbed}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
            placeholder='<iframe src="https://example.com/embed/..." width="100%" height="550" frameborder="0"></iframe>'
            required
          />
          <p className="text-sm text-gray-400 mt-1">الصق كود iframe الكامل هنا</p>
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition duration-200 font-medium"
        >
          {editingMatch ? 'تحديث المباراة' : 'إضافة المباراة'}
        </button>
      </form>
    </div>
  );
}