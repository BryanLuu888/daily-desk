"use client";

import { usePersistedReducer } from "@/lib/usePersistedReducer";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type Day = (typeof DAYS)[number];

interface MealState {
  [day: string]: { lunch: string; dinner: string };
}

type MealAction = {
  type: "SET_MEAL";
  day: Day;
  meal: "lunch" | "dinner";
  value: string;
};

function initState(): MealState {
  const state: MealState = {};
  for (const day of DAYS) {
    state[day] = { lunch: "", dinner: "" };
  }
  return state;
}

function reducer(state: MealState, action: MealAction): MealState {
  switch (action.type) {
    case "SET_MEAL":
      return {
        ...state,
        [action.day]: {
          ...state[action.day],
          [action.meal]: action.value,
        },
      };
    default:
      return state;
  }
}

function getTodayAbbreviation(): Day | null {
  const dayIndex = new Date().getDay(); // 0=Sun, 1=Mon, ...
  const map: Record<number, Day> = {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
  };
  return map[dayIndex] ?? null;
}

export default function MealPlannerPanel() {
  const [state, dispatch] = usePersistedReducer("meals", reducer, initState());
  const today = getTodayAbbreviation();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="pb-2 pr-2 text-left text-xs font-semibold uppercase text-gray-400">
              Day
            </th>
            <th className="pb-2 px-1 text-left text-xs font-semibold uppercase text-gray-400">
              Lunch
            </th>
            <th className="pb-2 pl-1 text-left text-xs font-semibold uppercase text-gray-400">
              Dinner
            </th>
          </tr>
        </thead>
        <tbody>
          {DAYS.map((day) => (
            <tr
              key={day}
              className={
                day === today ? "bg-indigo-50 rounded" : ""
              }
            >
              <td className="py-1 pr-2 text-xs font-medium text-gray-700 whitespace-nowrap">
                {day}
              </td>
              <td className="py-1 px-1">
                <input
                  type="text"
                  value={state[day].lunch}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_MEAL",
                      day,
                      meal: "lunch",
                      value: e.target.value,
                    })
                  }
                  placeholder="—"
                  className="w-full rounded border border-gray-200 bg-transparent px-2 py-1 text-xs text-gray-800 placeholder-gray-300 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                />
              </td>
              <td className="py-1 pl-1">
                <input
                  type="text"
                  value={state[day].dinner}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_MEAL",
                      day,
                      meal: "dinner",
                      value: e.target.value,
                    })
                  }
                  placeholder="—"
                  className="w-full rounded border border-gray-200 bg-transparent px-2 py-1 text-xs text-gray-800 placeholder-gray-300 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
