import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { groupService, Group } from '../services/groupService';

const GroupsListPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await groupService.list();
      setGroups(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">My Groups</h1>
      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
      )}
      <div className="grid gap-3">
        {groups.map((g) => (
          <Link
            to={`/groups/${g._id}`}
            key={g._id}
            className="block p-4 border rounded hover:bg-gray-50"
          >
            <div className="font-medium">{g.name}</div>
            <div className="text-sm text-gray-500">Members: {g.members?.length ?? 0}</div>
          </Link>
        ))}
        {!loading && groups.length === 0 && (
          <div className="text-sm text-gray-500">You are not a member of any groups yet.</div>
        )}
      </div>
    </div>
  );
};

export default GroupsListPage;
