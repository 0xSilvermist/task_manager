import { useEffect, useMemo, useState } from "react";
import { createTask, deleteTask, fetchTasks, updateTask } from "./api";
import Modal from "./Modal";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function monthKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`; // YYYY-MM
}

function dateKey(y, m, d) {
  return `${y}-${pad2(m)}-${pad2(d)}`; // YYYY-MM-DD
}

export default function App() {
  const [current, setCurrent] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return dateKey(d.getFullYear(), d.getMonth() + 1, d.getDate());
  });

  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [error, setError] = useState("");
  const [editModal, setEditModal] = useState({ isOpen: false, task: null, title: "", notes: "" });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, task: null });

  const month = monthKey(current);

  useEffect(() => {
    (async () => {
      try {
        setError("");
        const data = await fetchTasks(month);
        setTasks(data);
      } catch (e) {
        setError(e.message || "Error");
      } finally {
      }
    })();
  }, [month]);

  const tasksByDate = useMemo(() => {
    const map = new Map();
    for (const t of tasks) {
      const dateStr = t.task_date;
      const date = new Date(dateStr);
      const key = dateKey(date.getFullYear(), date.getMonth() + 1, date.getDate());
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(t);
    }
    return map;
  }, [tasks]);

  const selectedTasks = tasksByDate.get(selectedDate) || [];

  const year = current.getFullYear();
  const monthIndex = current.getMonth(); // 0-11
  const firstDay = new Date(year, monthIndex, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7; // Monday=0
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

  const cells = [];
  
  // Дни от предишния месец
  const prevYear = monthIndex === 0 ? year - 1 : year;
  const prevMonthIdx = monthIndex === 0 ? 11 : monthIndex - 1;
  if (startWeekday > 0) {
    for (let i = startWeekday - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      cells.push({ day, month: 'prev', year: prevYear, monthIdx: prevMonthIdx });
    }
  }
  
  // Дни от текущия месец
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month: 'current', year, monthIdx: monthIndex });
  }
  
  // Дни от следващия месец (за да напълним до точно 42 клетки)
  const nextYear = monthIndex === 11 ? year + 1 : year;
  const nextMonthIdx = monthIndex === 11 ? 0 : monthIndex + 1;
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, month: 'next', year: nextYear, monthIdx: nextMonthIdx });
  }

  async function onAddTask() {
    if (!newTitle.trim()) return;
    try {
      setError("");
      await createTask({
        task_date: selectedDate,
        title: newTitle.trim(),
        notes: newNotes.trim() || null,
      });
      setNewTitle("");
      setNewNotes("");
      const data = await fetchTasks(month);
      setTasks(data);
    } catch (e) {
      setError(e.message || "Error");
    }
  }

  async function onToggleDone(t) {
    try {
      setError("");
      await updateTask(t.id, { is_done: !t.is_done });
      const data = await fetchTasks(month);
      setTasks(data);
    } catch (e) {
      setError(e.message || "Error");
    }
  }

  function openEditModal(t) {
    setEditModal({ isOpen: true, task: t, title: t.title, notes: t.notes || "" });
  }

  function closeEditModal() {
    setEditModal({ isOpen: false, task: null, title: "", notes: "" });
  }

  async function handleEditSave() {
    if (!editModal.title.trim()) return;
    try {
      setError("");
      await updateTask(editModal.task.id, { 
        title: editModal.title.trim(), 
        notes: editModal.notes.trim() || null 
      });
      const data = await fetchTasks(month);
      setTasks(data);
      closeEditModal();
    } catch (e) {
      setError(e.message || "Error");
    }
  }

  function openDeleteModal(t) {
    setDeleteModal({ isOpen: true, task: t });
  }

  function closeDeleteModal() {
    setDeleteModal({ isOpen: false, task: null });
  }

  async function handleDeleteConfirm() {
    try {
      setError("");
      await deleteTask(deleteModal.task.id);
      const data = await fetchTasks(month);
      setTasks(data);
      closeDeleteModal();
    } catch (e) {
      setError(e.message || "Error");
    }
  }

  function prevMonth() {
    setCurrent(new Date(year, monthIndex - 1, 1));
  }

  function nextMonth() {
    setCurrent(new Date(year, monthIndex + 1, 1));
  }

  const monthName = current.toLocaleString(undefined, { month: "long", year: "numeric" });
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="max-w-[900px] mx-auto my-8 px-4 font-sans text-gray-800">
      <header className="flex items-center justify-between mb-4">
        <button 
          onClick={prevMonth}
          className="bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          ◀
        </button>
        <h1 className="m-0 text-xl font-semibold capitalize">{monthName}</h1>
        <button 
          onClick={nextMonth}
          className="bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          ▶
        </button>
      </header>
      {error && (
        <div className="bg-red-100 text-red-900 px-2.5 py-2.5 rounded-lg mb-3">
          {error}
        </div>
      )}
      <div className="mb-5">
  <div className="grid grid-cols-7 gap-1.5 mb-1">
    {weekdays.map((w) => (
      <div
        key={w}
        className="text-center text-[11px] font-medium text-gray-500 py-1"
      >
        {w}
      </div>
    ))}
  </div>

  <div
    className="grid grid-cols-7 gap-1.5"
    style={{ gridTemplateRows: "repeat(6, 90px)" }}
  >
    {cells.map((cell, idx) => {
      const key = dateKey(cell.year, cell.monthIdx + 1, cell.day);
      const count = (tasksByDate.get(key) || []).length;
      const isSelected = key === selectedDate;
      const isOtherMonth = cell.month !== "current";

      return (
        <button
          key={idx}
          className={`
            border rounded-xl p-2 h-full cursor-pointer relative
            transition-all duration-150 flex flex-col
            ${
              isOtherMonth
                ? "bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100"
                : isSelected
                ? "bg-indigo-50 border-indigo-300"
                : "bg-white border-gray-200 hover:bg-indigo-50 hover:shadow-sm"
            }
          `}
          onClick={() => setSelectedDate(key)}
        >
          <div className={`text-sm ${isOtherMonth ? "font-normal text-gray-400" : "font-semibold"}`}>
            {cell.day}
          </div>

          {count > 0 && (
            <div
              className={`absolute top-1.5 right-1.5 text-[11px] px-1.5 py-0.5 rounded-full ${
                isOtherMonth ? "bg-gray-200 text-gray-500" : "bg-indigo-100 text-gray-700"
              }`}
            >
              {count}
            </div>
          )}
        </button>
      );
    })}
  </div>
</div>

      <section className="bg-white border border-gray-200 rounded-2xl p-4">
        <h2 className="m-0 mb-3 text-[15px] font-semibold">Tasks for {selectedDate}</h2>
        <div className="flex gap-2 flex-wrap mb-3">
          <input
            placeholder="Task title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 min-w-[200px] px-2.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            placeholder="Notes (optional)..."
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            className="flex-1 min-w-[200px] px-2.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            onClick={onAddTask}
            className="px-3.5 py-2 border-none rounded-lg bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700 transition-colors"
          >
            Add
          </button>
        </div>
        {selectedTasks.length === 0 ? (
          <div className="text-gray-500 my-2">No tasks for this day.</div>
        ) : (
          <ul className="list-none p-0 m-0 grid gap-2.5">
            {selectedTasks.map((t) => (
              <li 
                key={t.id} 
                className={`border border-gray-200 rounded-xl p-2.5 ${t.is_done ? 'opacity-65' : ''}`}
              >
                <label className="flex gap-2 items-center font-medium mb-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!t.is_done}
                    onChange={() => onToggleDone(t)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className={t.is_done ? 'line-through' : ''}>{t.title}</span>
                </label>
                {t.notes && (
                  <div className="text-[13px] text-gray-600 ml-6 mt-1">
                    {t.notes}
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => openEditModal(t)}
                    className="bg-transparent border border-gray-300 rounded-lg px-2.5 py-1 cursor-pointer text-xs hover:bg-gray-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => openDeleteModal(t)}
                    className="bg-transparent border border-gray-300 rounded-lg px-2.5 py-1 cursor-pointer text-xs hover:bg-gray-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Edit Modal */}
      <Modal 
        isOpen={editModal.isOpen} 
        onClose={closeEditModal}
        title="Edit Task"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={editModal.title}
              onChange={(e) => setEditModal({ ...editModal, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Task title..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditSave();
                if (e.key === 'Escape') closeEditModal();
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={editModal.notes}
              onChange={(e) => setEditModal({ ...editModal, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Notes..."
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={closeEditModal}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEditSave}
              disabled={!editModal.title.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal 
        isOpen={deleteModal.isOpen} 
        onClose={closeDeleteModal}
        title="Delete Task"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete "{deleteModal.task?.title}"? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={closeDeleteModal}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

