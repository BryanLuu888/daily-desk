"use client";

import { useState, useEffect, useCallback } from "react";
import { usePersistedReducer } from "@/lib/usePersistedReducer";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ── Types ─────────────────────────────────────────────── */

type Priority = "high" | "medium" | "low";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  completedAt: string | null;
  order: number;
}

interface State {
  tasks: Task[];
  doNextId: string | null;
}

type Action =
  | { type: "ADD_TASK"; text: string; priority?: Priority }
  | { type: "TOGGLE_TASK"; id: string }
  | { type: "SET_PRIORITY"; id: string; priority: Priority }
  | { type: "REORDER"; activeId: string; overId: string }
  | { type: "SET_DO_NEXT"; id: string | null }
  | { type: "DELETE_TASK"; id: string }
  | { type: "CLEANUP_STALE" };

/* ── Priority helpers ──────────────────────────────────── */

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

const PRIORITY_COLORS: Record<Priority, { dot: string; ring: string }> = {
  high: { dot: "bg-red-500", ring: "ring-red-400" },
  medium: { dot: "bg-yellow-400", ring: "ring-yellow-400" },
  low: { dot: "bg-green-500", ring: "ring-green-400" },
};

function cyclePriority(p: Priority): Priority {
  if (p === "high") return "medium";
  if (p === "medium") return "low";
  return "high";
}

/* ── Reducer ───────────────────────────────────────────── */

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TASK": {
      const maxOrder = state.tasks.reduce((m, t) => Math.max(m, t.order), -1);
      const newTask: Task = {
        id: crypto.randomUUID(),
        text: action.text,
        completed: false,
        priority: action.priority ?? "medium",
        completedAt: null,
        order: maxOrder + 1,
      };
      return { ...state, tasks: [...state.tasks, newTask] };
    }

    case "TOGGLE_TASK": {
      return {
        ...state,
        tasks: state.tasks.map((t) => {
          if (t.id !== action.id) return t;
          const nowCompleted = !t.completed;
          return {
            ...t,
            completed: nowCompleted,
            completedAt: nowCompleted ? new Date().toISOString() : null,
          };
        }),
        doNextId: state.doNextId === action.id ? null : state.doNextId,
      };
    }

    case "SET_PRIORITY":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, priority: action.priority } : t
        ),
      };

    case "REORDER": {
      const tasks = [...state.tasks].sort((a, b) => a.order - b.order);
      const activeIdx = tasks.findIndex((t) => t.id === action.activeId);
      const overIdx = tasks.findIndex((t) => t.id === action.overId);
      if (activeIdx === -1 || overIdx === -1) return state;

      const [moved] = tasks.splice(activeIdx, 1);
      tasks.splice(overIdx, 0, moved);
      const reordered = tasks.map((t, i) => ({ ...t, order: i }));
      return { ...state, tasks: reordered };
    }

    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.id),
        doNextId: state.doNextId === action.id ? null : state.doNextId,
      };

    case "SET_DO_NEXT":
      return { ...state, doNextId: action.id };

    case "CLEANUP_STALE": {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tasks = state.tasks
        .map((t, i) => ({
          ...t,
          priority: t.priority || ("medium" as Priority),
          completedAt:
            t.completedAt !== undefined
              ? t.completedAt
              : t.completed
                ? new Date().toISOString()
                : null,
          order: t.order !== undefined ? t.order : i,
        }))
        .filter((t) => {
          if (!t.completed || !t.completedAt) return true;
          const d = new Date(t.completedAt);
          d.setHours(0, 0, 0, 0);
          return d.getTime() >= today.getTime();
        });
      return { ...state, tasks };
    }

    default:
      return state;
  }
}

/* ── Initial state ─────────────────────────────────────── */

const initialState: State = {
  tasks: [
    { id: "starter-1", text: "Review morning emails", completed: false, priority: "high", completedAt: null, order: 0 },
    { id: "starter-2", text: "Plan weekly meals", completed: false, priority: "medium", completedAt: null, order: 1 },
    { id: "starter-3", text: "Update project notes", completed: false, priority: "low", completedAt: null, order: 2 },
  ],
  doNextId: null,
};

/* ── SortableTaskItem ──────────────────────────────────── */

interface TaskItemProps {
  task: Task;
  isDoNext: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onCyclePriority: () => void;
}

function SortableTaskItem({ task, isDoNext, onToggle, onDelete, onCyclePriority }: TaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const colors = PRIORITY_COLORS[task.priority];

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${
        isDoNext
          ? "border-l-4 border-indigo-500 bg-indigo-50"
          : "border-l-4 border-transparent"
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-gray-400 hover:text-gray-600"
        aria-label="Drag to reorder"
      >
        ⠿
      </button>

      {/* Priority dot (click to cycle) */}
      <button
        onClick={onCyclePriority}
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${colors.dot} hover:ring-2 ${colors.ring}`}
        aria-label={`Priority: ${task.priority}. Click to change.`}
      />

      {/* Task text */}
      <span
        className={`flex-1 truncate ${
          task.completed ? "text-gray-400 line-through" : "text-gray-900"
        }`}
      >
        {task.text}
      </span>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Delete task"
      >
        &times;
      </button>

      {/* Checkbox */}
      <input
        type="checkbox"
        checked={task.completed}
        onChange={onToggle}
        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
      />
    </li>
  );
}

/* ── TodoPanel ─────────────────────────────────────────── */

export default function TodoPanel() {
  const [state, dispatch] = usePersistedReducer("todo", reducer, initialState);
  const [input, setInput] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");

  // Migrate / cleanup stale completed tasks on mount
  useEffect(() => {
    dispatch({ type: "CLEANUP_STALE" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleAdd = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    dispatch({ type: "ADD_TASK", text: trimmed, priority: newPriority });
    setInput("");
  }, [input, newPriority, dispatch]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      dispatch({ type: "REORDER", activeId: String(active.id), overId: String(over.id) });
    }
  }

  function handleDoNext() {
    const incomplete = state.tasks
      .filter((t) => !t.completed)
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || a.order - b.order);

    if (incomplete.length === 0) {
      dispatch({ type: "SET_DO_NEXT", id: null });
      return;
    }

    const currentIndex = incomplete.findIndex((t) => t.id === state.doNextId);
    const nextIndex = (currentIndex + 1) % incomplete.length;
    dispatch({ type: "SET_DO_NEXT", id: incomplete[nextIndex].id });
  }

  const sortedTasks = [...state.tasks].sort((a, b) => a.order - b.order);
  const taskIds = sortedTasks.map((t) => t.id);

  const priorityOptions: Priority[] = ["high", "medium", "low"];

  return (
    <div className="flex flex-col gap-3">
      {/* Quick add */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder="Add a task..."
          className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        {/* Priority selector */}
        <div className="flex gap-1">
          {priorityOptions.map((p) => (
            <button
              key={p}
              onClick={() => setNewPriority(p)}
              className={`h-5 w-5 rounded-full ${PRIORITY_COLORS[p].dot} ${
                newPriority === p ? "ring-2 ring-offset-1 " + PRIORITY_COLORS[p].ring : ""
              }`}
              aria-label={`Set new task priority to ${p}`}
            />
          ))}
        </div>

        <button
          onClick={handleAdd}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
        >
          Add
        </button>
      </div>

      {/* Task list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
            {sortedTasks.map((task) => (
              <SortableTaskItem
                key={task.id}
                task={task}
                isDoNext={state.doNextId === task.id}
                onToggle={() => dispatch({ type: "TOGGLE_TASK", id: task.id })}
                onDelete={() => dispatch({ type: "DELETE_TASK", id: task.id })}
                onCyclePriority={() =>
                  dispatch({ type: "SET_PRIORITY", id: task.id, priority: cyclePriority(task.priority) })
                }
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {/* Do Next button */}
      <button
        onClick={handleDoNext}
        className="mt-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
      >
        Do Next
      </button>
    </div>
  );
}
