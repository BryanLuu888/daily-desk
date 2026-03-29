import Panel from "@/components/ui/Panel";
import DateDisplay from "@/components/DateDisplay";
import TodoPanel from "@/components/panels/TodoPanel";
import MealPlannerPanel from "@/components/panels/MealPlannerPanel";
import WeatherPanel from "@/components/panels/WeatherPanel";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <header className="mx-auto mb-8 max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900">Daily Desk</h1>
        <DateDisplay />
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Panel title="Today Summary">
          <p className="text-sm text-gray-500">Coming soon...</p>
        </Panel>

        <Panel title="To-Do" className="row-span-2">
          <TodoPanel />
        </Panel>

        <Panel title="Meal Planner" className="row-span-2">
          <MealPlannerPanel />
        </Panel>

        <Panel title="Calendar">
          <p className="text-sm text-gray-500">Coming soon...</p>
        </Panel>

        <Panel title="Weather">
          <WeatherPanel />
        </Panel>

        <Panel title="Morning Briefing">
          <p className="text-sm text-gray-500">Coming soon...</p>
        </Panel>
      </main>
    </div>
  );
}
