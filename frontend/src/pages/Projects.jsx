/**
 * Projects page — list all projects, create new ones (admin only)
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { FolderKanban, Plus, Users, Loader2, Trash2, Calendar } from 'lucide-react';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '', members: [], color: '#3B82F6' });

  useEffect(() => {
    Promise.all([projectAPI.getAll(), userAPI.getAll()])
      .then(([projectsRes, usersRes]) => {
        setProjects(projectsRes.data.data.projects);
        setUsers(usersRes.data.data.users.filter(u => u._id !== user.id));
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [user.id]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await projectAPI.create(formData);
      setProjects(prev => [res.data.data, ...prev]);
      setShowCreateModal(false);
      setFormData({ name: '', description: '', members: [], color: '#3B82F6' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await projectAPI.delete(id);
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const toggleMember = (userId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(m => m !== userId)
        : [...prev.members, userId]
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">Manage your team projects</p>
        </div>
        {user.role === 'admin' && (
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}

      {projects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <FolderKanban className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
          <p className="text-gray-500 mt-1">{user.role === 'admin' ? 'Create your first project to get started' : 'Ask an admin to add you to a project'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Link key={project._id} to={`/projects/${project._id}`} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: project.color + '20' }}>
                  <FolderKanban className="w-5 h-5" style={{ color: project.color }} />
                </div>
                {user.role === 'admin' && (
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(project._id); }} className="p-1.5 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
              {project.description && <p className="text-sm text-gray-500 line-clamp-2 mb-4">{project.description}</p>}
              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{project.members?.length || 0} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create project modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="My Project" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" rows={3} placeholder="Project description..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Color</label>
            <div className="flex gap-2">
              {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map(color => (
                <button key={color} type="button" onClick={() => setFormData({ ...formData, color })} className={`w-8 h-8 rounded-full transition-transform ${formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`} style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Team Members</label>
            <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
              {users.map(u => (
                <label key={u._id} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.members.includes(u._id)} onChange={() => toggleMember(u._id)} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm">{u.name}</span>
                  <span className="text-xs text-gray-400 capitalize">({u.role})</span>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">Create Project</button>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
