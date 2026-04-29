/**
 * Project Detail — shows tasks, team members, and project stats
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectAPI, taskAPI, dashboardAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import TaskCard from '../components/TaskCard';
import StatCard from '../components/StatCard';
import { Plus, Loader2, ArrowLeft, Users, UserPlus, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [error, setError] = useState('');
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '' });

  useEffect(() => {
    Promise.all([
      projectAPI.getById(id),
      taskAPI.getAll({ project: id, limit: 50 }),
      dashboardAPI.getProjectStats(id),
      userAPI.getAll()
    ])
      .then(([projectRes, tasksRes, statsRes, usersRes]) => {
        setProject(projectRes.data.data);
        setTasks(tasksRes.data.data.tasks);
        setStats(statsRes.data.data);
        setUsers(usersRes.data.data.users.filter(u => !projectRes.data.data.members?.some(m => m._id === u._id || m === u._id)));
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await taskAPI.create({ ...taskForm, project: id });
      setTasks(prev => [res.data.data, ...prev]);
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleAddMember = async (userId) => {
    try {
      const res = await projectAPI.addMember(id, userId);
      setProject(res.data.data);
      setShowAddMemberModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      const res = await projectAPI.removeMember(id, userId);
      setProject(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await taskAPI.updateStatus(taskId, newStatus);
      setTasks(prev => prev.map(t => t._id === taskId ? res.data.data : t));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
  }

  if (error && !project) {
    return <div className="max-w-7xl mx-auto px-4 py-8"><div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/projects" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: project.color + '20' }}>
            <span className="text-xl" style={{ color: project.color }}>{project.name[0]}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            {project.description && <p className="text-gray-500 mt-1">{project.description}</p>}
          </div>
        </div>
        {user.role === 'admin' && (
          <button onClick={() => setShowTaskModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="w-4 h-4" />
            New Task
          </button>
        )}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total" value={stats.totalTasks} icon={<Users className="w-5 h-5" />} color="primary" />
          <StatCard title="Completed" value={stats.completedTasks} icon={<CheckCircle className="w-5 h-5" />} color="green" subtitle={`${stats.completionRate}% done`} />
          <StatCard title="In Progress" value={stats.inProgressTasks} icon={<Clock className="w-5 h-5" />} color="yellow" />
          <StatCard title="Overdue" value={stats.overdueTasks} icon={<AlertCircle className="w-5 h-5" />} color="red" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Tasks ({tasks.length})</h2>
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500"><p>No tasks yet. Create one to get started.</p></div>
            ) : (
              <div className="space-y-3">
                {tasks.map(task => (
                  <TaskCard key={task._id} task={task} onStatusChange={user.role === 'member' ? handleStatusChange : undefined} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Team</h2>
              {user.role === 'admin' && (
                <button onClick={() => setShowAddMemberModal(true)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <UserPlus className="w-4 h-4 text-primary-600" />
                </button>
              )}
            </div>
            <div className="space-y-2">
              {project.members?.map(member => (
                <div key={member._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary-700">{member.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{member.role}</p>
                    </div>
                  </div>
                  {user.role === 'admin' && member._id !== project.createdBy && (
                    <button onClick={() => handleRemoveMember(member._id)} className="text-gray-400 hover:text-red-600">
                      <span className="text-xs">Remove</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create task modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
            <input type="text" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
              <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
              <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign To</label>
            <select value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required>
              <option value="">Select member</option>
              {project.members?.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">Create Task</button>
        </form>
      </Modal>

      {/* Add member modal */}
      <Modal isOpen={showAddMemberModal} onClose={() => setShowAddMemberModal(false)} title="Add Member">
        <div className="space-y-2">
          {users.length === 0 ? <p className="text-gray-500 text-center py-4">No users available to add</p> : users.map(u => (
            <button key={u._id} onClick={() => handleAddMember(u._id)} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center"><span className="text-xs font-medium text-primary-700">{u.name[0]}</span></div>
              <div><p className="text-sm font-medium">{u.name}</p><p className="text-xs text-gray-400">{u.email}</p></div>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
