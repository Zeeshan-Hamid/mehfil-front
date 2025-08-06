import React, { useState, useEffect } from "react";
import styles from "./ChecklistView.module.css";
import apiService from "../../utils/api.js";

const ChecklistView = ({ eventId, eventTitle, onClose }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newTodo, setNewTodo] = useState({
    taskName: "",
    startDate: "",
    endDate: "",
    member: "",
    status: "pending",
    description: ""
  });

  useEffect(() => {
    if (eventId) {
      fetchTodos();
    }
  }, [eventId]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getEventTodos(eventId);
      if (response.data && response.data.todos) {
        setTodos(response.data.todos);
      }
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError('Failed to load checklist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async () => {
    if (!newTodo.taskName || !newTodo.startDate || !newTodo.endDate) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const todoData = {
        ...newTodo,
        startDate: new Date(newTodo.startDate).toISOString(),
        endDate: new Date(newTodo.endDate).toISOString()
      };

      const response = await apiService.createEventTodo(eventId, todoData);
      if (response.data && response.data.todo) {
        setTodos([...todos, response.data.todo]);
        setShowAddModal(false);
        setNewTodo({
          taskName: "",
          startDate: "",
          endDate: "",
          member: "",
          status: "pending",
          description: ""
        });
      }
    } catch (err) {
      console.error('Error creating todo:', err);
      alert('Failed to create task. Please try again.');
    }
  };

  const handleEditTodo = async () => {
    if (!editingTodo.taskName || !editingTodo.startDate || !editingTodo.endDate) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const todoData = {
        ...editingTodo,
        startDate: new Date(editingTodo.startDate).toISOString(),
        endDate: new Date(editingTodo.endDate).toISOString()
      };

      const response = await apiService.updateEventTodo(eventId, editingTodo._id, todoData);
      if (response.data && response.data.todo) {
        setTodos(todos.map(todo => todo._id === editingTodo._id ? response.data.todo : todo));
        setShowEditModal(false);
        setEditingTodo(null);
      }
    } catch (err) {
      console.error('Error updating todo:', err);
      alert('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTodo = async (todoId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await apiService.deleteEventTodo(eventId, todoId);
        setTodos(todos.filter(todo => todo._id !== todoId));
      } catch (err) {
        console.error('Error deleting todo:', err);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  const handleToggleStatus = async (todoId, currentStatus) => {
    try {
      const response = await apiService.toggleTodoCompletion(eventId, todoId);
      if (response.data && response.data.todo) {
        setTodos(todos.map(todo => todo._id === todoId ? response.data.todo : todo));
      }
    } catch (err) {
      console.error('Error toggling todo status:', err);
      alert('Failed to update task status. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'in-progress':
        return '#FF9800';
      case 'pending':
        return '#F44336';
      default:
        return '#666';
    }
  };

  return (
    <div className={styles["checklist-overlay"]}>
      <div className={styles["checklist-modal"]}>
        <div className={styles["checklist-header"]}>
          <h2>Checklist for {eventTitle}</h2>
          <button className={styles["close-btn"]} onClick={onClose}>×</button>
        </div>

        <div className={styles["checklist-content"]}>
          <div className={styles["checklist-actions"]}>
            <button 
              className={styles["add-task-btn"]} 
              onClick={() => setShowAddModal(true)}
            >
              + Add Task
            </button>
          </div>

          {loading ? (
            <div className={styles["loading"]}>Loading checklist...</div>
          ) : error ? (
            <div className={styles["error"]}>{error}</div>
          ) : todos.length === 0 ? (
            <div className={styles["empty-state"]}>
              No tasks found. Add your first task to get started!
            </div>
          ) : (
            <div className={styles["checklist-table"]}>
              <table>
                <thead>
                  <tr>
                    <th>Task Name</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Member</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {todos.map((todo) => (
                    <tr key={todo._id}>
                      <td>{todo.taskName}</td>
                      <td>{formatDate(todo.startDate)}</td>
                      <td>{formatDate(todo.endDate)}</td>
                      <td>{todo.member || '-'}</td>
                      <td>
                        <span 
                          className={styles["status-badge"]}
                          style={{ backgroundColor: getStatusColor(todo.status) }}
                        >
                          {todo.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles["action-buttons"]}>
                          <input
                            type="checkbox"
                            checked={todo.status === 'completed'}
                            onChange={() => handleToggleStatus(todo._id, todo.status)}
                            className={styles["status-checkbox"]}
                          />
                          <button 
                            onClick={() => {
                              setEditingTodo(todo);
                              setShowEditModal(true);
                            }}
                            className={styles["edit-btn"]}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteTodo(todo._id)}
                            className={styles["delete-btn"]}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Task Modal */}
        {showAddModal && (
          <div className={styles["modal-overlay"]}>
            <div className={styles["modal"]}>
              <h3>Add New Task</h3>
              <div className={styles["form-group"]}>
                <label>Task Name *</label>
                <input
                  type="text"
                  value={newTodo.taskName}
                  onChange={(e) => setNewTodo({ ...newTodo, taskName: e.target.value })}
                  placeholder="Enter task name"
                />
              </div>
              <div className={styles["form-group"]}>
                <label>Start Date *</label>
                <input
                  type="date"
                  value={newTodo.startDate}
                  onChange={(e) => setNewTodo({ ...newTodo, startDate: e.target.value })}
                />
              </div>
              <div className={styles["form-group"]}>
                <label>End Date *</label>
                <input
                  type="date"
                  value={newTodo.endDate}
                  onChange={(e) => setNewTodo({ ...newTodo, endDate: e.target.value })}
                />
              </div>
              <div className={styles["form-group"]}>
                <label>Member</label>
                <input
                  type="text"
                  value={newTodo.member}
                  onChange={(e) => setNewTodo({ ...newTodo, member: e.target.value })}
                  placeholder="Enter member name"
                />
              </div>
              <div className={styles["form-group"]}>
                <label>Description</label>
                <textarea
                  value={newTodo.description}
                  onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                  placeholder="Enter task description"
                  rows="3"
                />
              </div>
              <div className={styles["modal-actions"]}>
                <button onClick={() => setShowAddModal(false)}>Cancel</button>
                <button onClick={handleAddTodo}>Add Task</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Task Modal */}
        {showEditModal && editingTodo && (
          <div className={styles["modal-overlay"]}>
            <div className={styles["modal"]}>
              <h3>Edit Task</h3>
              <div className={styles["form-group"]}>
                <label>Task Name *</label>
                <input
                  type="text"
                  value={editingTodo.taskName}
                  onChange={(e) => setEditingTodo({ ...editingTodo, taskName: e.target.value })}
                  placeholder="Enter task name"
                />
              </div>
              <div className={styles["form-group"]}>
                <label>Start Date *</label>
                <input
                  type="date"
                  value={editingTodo.startDate ? editingTodo.startDate.split('T')[0] : ''}
                  onChange={(e) => setEditingTodo({ ...editingTodo, startDate: e.target.value })}
                />
              </div>
              <div className={styles["form-group"]}>
                <label>End Date *</label>
                <input
                  type="date"
                  value={editingTodo.endDate ? editingTodo.endDate.split('T')[0] : ''}
                  onChange={(e) => setEditingTodo({ ...editingTodo, endDate: e.target.value })}
                />
              </div>
              <div className={styles["form-group"]}>
                <label>Member</label>
                <input
                  type="text"
                  value={editingTodo.member || ''}
                  onChange={(e) => setEditingTodo({ ...editingTodo, member: e.target.value })}
                  placeholder="Enter member name"
                />
              </div>
              <div className={styles["form-group"]}>
                <label>Description</label>
                <textarea
                  value={editingTodo.description || ''}
                  onChange={(e) => setEditingTodo({ ...editingTodo, description: e.target.value })}
                  placeholder="Enter task description"
                  rows="3"
                />
              </div>
              <div className={styles["modal-actions"]}>
                <button onClick={() => setShowEditModal(false)}>Cancel</button>
                <button onClick={handleEditTodo}>Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChecklistView; 