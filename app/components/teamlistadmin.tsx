// components/TeamListAdmin.tsx
import { Team } from '../types';

interface TeamListAdminProps {
  teams: Team[];
  onEditTeam: (team: Team) => void;
  onDeleteTeam: (teamId: number) => void;
}

export default function TeamListAdmin({ teams, onEditTeam, onDeleteTeam }: TeamListAdminProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Manage Teams</h2>
        <p className="text-gray-400">{teams.length} teams registered</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map(team => (
          <div key={team.id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              {team.logo && (
                <img 
                  src={team.logo} 
                  alt={team.name} 
                  className="w-12 h-12 object-contain rounded-full bg-gray-700 p-1"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjI0IiB5PSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+VEVBTTwvdGV4dD4KPC9zdmc+';
                  }}
                />
              )}
              <div className="flex-1">
                <h3 className="font-bold text-lg">{team.name}</h3>
                <p className="text-gray-400 text-sm">{team.country}</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => onEditTeam(team)}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded text-sm transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDeleteTeam(team.id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-16 bg-gray-800 rounded-lg">
          <div className="text-gray-400 text-lg">No teams registered</div>
          <p className="text-gray-500 mt-2">Add new teams to start scheduling matches</p>
        </div>
      )}
    </div>
  );
}