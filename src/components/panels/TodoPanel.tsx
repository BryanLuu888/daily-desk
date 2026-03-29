"use client";

import { useState } from "react";
import { usePersistedReducer } from "@/lib/usePersistedReducer";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

type Action =
  | { type: "ADD_TASK"; text: string }
  | { type: "TOGGLE_TASK"; id: string }
  | { type: "SET_DO_NEXT"; id: string | null };

interface State {
  tasks: Task[];
  doNextId: string | null;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TASK":
      return {
        ...state,
        tasks: [
          ...state.tasks,
          { id: crypto.randomUUID(), text: action.text, completed: false },
        ],
      };
    case "TOGGLE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, completed: !t.completed } : t
        ),
        doNextId:
          state.doNextId === action.id ? null : state.doNextId,
      };
    case "SET_DO_NEXT":
      return { ...state, doNextId: action.id };
    default:
      return state;
  }
}

const initialState: State = {
  tasks: [
    { id: "starter-1", text: "Review morning emails", completed: false },
    { id: "starter-2", text: "Plan weekly meals", completed: false },
    { id: "starter-3", text: "Update project notes", completed: false },
  ],
  doNextId: null,
};

export default function TodoPanel() {
  const [state, dispatch] = usePersistedReducer("todo", reducer, initialState);
  const [input, setInput] = useState("");

  function handleAdd() {
    const trimmed = input.trim();
    if (!trimmed) return;
    dispatch({ type: "ADD_TASK", text: trimmed });
    setInput("");
  }

  function handleDoNext() {
    const incomplete = state.tasks.filter((t) => !t.completed);
    if (incomplete.length === 0) {
      dispatch({ type: "SET_DO_NEXT", id: null });
      return;
    }

    const currentIndex = incomplete.findIndex((t) => t.id === state.doNextId);
    const nextIndex = (currentIndex + 1) % incomplete.length;
    dispatch({ type: "SET_DO_NEXT", id: incomplete[nextIndex].id });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Quick add */}
      <div className="flex gap-2">
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
        <button
          onClick={handleAdd}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
        >
          Add
        </button>
      </div>

      {/* Task list */}
      <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
        {state.tasks.map((task) => (
          <li
            key={task.id}
            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${
              state.doNextId === task.id
                ? "border-l-4 border-indigo-500 bg-indigo-50"
                : "border-l-4 border-transparent"
            }`}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => dispatch({ type: "TOGGLE_TASK", id: task.id })}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span
              className={
                task.completed
                  ? "text-gray-400 line-through"
                  : "text-gray-900"
              }
            >
              {task.text}
            </span>
          </li>
        ))}
      </ul>

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
