/**
 * Dashboard page — shows task statistics and recent activity
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import StatCard from '../components/StatCard';
import TaskCard from '../components/TaskCard';
import { LayoutDashboard, CheckCircle, Clock, AlertCircle, FolderOpen, Loader2, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardAPI.getStats()
      .then(res => setStats(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
  }

  if (error) {
    return <div className="max-w-7xl mx-auto px-4 py-8"><div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div></div>;
  }

  const { overview, projects, byPriority, recentTasks } = stats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your tasks and projects</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Tasks" value={overview.totalTasks} icon={<LayoutDashboard className="w-6 h-6" />} color="primary" />
        <StatCard title="Completed" value={overview.completedTasks} icon={<CheckCircle className="w-6 h-6" />} color="green" subtitle={`${overview.completionRate}% completion rate`} />
        <StatCard title="In Progress" value={overview.inProgressTasks} icon={<Clock className="w-6 h-6" />} color="yellow" />
        <StatCard title="Overdue" value={overview.overdueTasks} icon={<AlertCircle className="w-6 h-6" />} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Tasks</h2>
              <Link to="/tasks" className="text-sm text-primary-600 hover:text-primary-700">View all</Link>
            </div>
            {recentTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <LayoutDashboard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No tasks yet. Create a project to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTasks.map(task => (
                  <TaskCard key={task._id} task={task} showProject />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Projects</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Total</span>
                <span className="font-semibold">{projects.total}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-green-700">Active</span>
                <span className="font-semibold text-green-700">{projects.active}</span>
              </div>
            </div>
            <Link to="/projects" className="mt-4 w-full block text-center py-2 text-sm text-primary-600 hover:text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">
              Manage Projects
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">By Priority</h2>
            <div className="space-y-3">
              {['urgent', 'high', 'medium', 'low'].map(priority => (
                <div key={priority} className="flex items-center justify-between">
                  <span className="capitalize text-gray-600">{priority}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${
                        priority === 'urgent' ? 'bg-red-500' :
                        priority === 'high' ? 'bg-orange-500' :
                        priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} style={{ width: `${overview.totalTasks ? ((byPriority[priority] || 0) / overview.totalTasks) * 100 : 0}%` }} />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{byPriority[priority] || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
