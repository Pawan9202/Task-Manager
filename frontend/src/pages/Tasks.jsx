import { useState, useEffect } from 'react';
import { taskAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import { Filter, Loader2, Search } from 'lucide-react';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [pagination, setPagination] = useState({ page: 1, total: 0 });

  useEffect(() => {
    setLoading(true);
    taskAPI.getAll({ ...filters, page: pagination.page, limit: 20 })
      .then(res => {
        setTasks(res.data.data.tasks);
        setPagination(prev => ({ ...prev, total: res.data.data.pagination.total, pages: res.data.data.pagination.pages }));
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load tasks'))
      .finally(() => setLoading(false));
  }, [filters, pagination.page]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await taskAPI.updateStatus(taskId, newStatus);
      setTasks(prev => prev.map(t => t._id === taskId ? res.data.data : t));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const statusColors = { '': 'All', 'todo': 'To Do', 'in-progress': 'In Progress', 'done': 'Done' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <p className="text-gray-500 mt-1">Manage and track all tasks</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            >
              {Object.entries(statusColors).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Filter className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your filters or create a new task</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {tasks.map(task => (
              <TaskCard key={task._id} task={task} onStatusChange={handleStatusChange} showProject />
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">Page {pagination.page} of {pagination.pages}</span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Tasks;
