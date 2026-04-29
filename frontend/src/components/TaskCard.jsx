import { Calendar, Flag, User as UserIcon } from 'lucide-react';

const statusColors = {
  'todo': 'bg-gray-100 text-gray-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  'done': 'bg-green-100 text-green-700'
};

const priorityColors = {
  'low': 'text-green-600',
  'medium': 'text-yellow-600',
  'high': 'text-orange-600',
  'urgent': 'text-red-600'
};

const TaskCard = ({ task, onStatusChange, showProject = false }) => {
  const isOverdue = task.isOverdue && task.status !== 'done';

  return (
    <div className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow ${isOverdue ? 'border-red-300' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[task.status]}`}>
              {task.status}
            </span>
            <span className={`flex items-center gap-1 text-xs font-medium ${priorityColors[task.priority]}`}>
              <Flag className="w-3 h-3" />
              {task.priority}
            </span>
            {isOverdue && <span className="text-xs font-medium text-red-600">Overdue</span>}
          </div>
          <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
          {task.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <UserIcon className="w-3.5 h-3.5" />
            <span>{task.assignedTo?.name || 'Unassigned'}</span>
          </div>
          {task.dueDate && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
          {showProject && task.project && (
            <span className="text-primary-600 font-medium">{task.project.name}</span>
          )}
        </div>
        {onStatusChange && task.status !== 'done' && (
          <button
            onClick={() => onStatusChange(task._id, task.status === 'todo' ? 'in-progress' : 'done')}
            className="text-xs px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {task.status === 'todo' ? 'Start' : 'Complete'}
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
