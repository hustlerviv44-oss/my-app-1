import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ClassCard } from "./ClassCard";

export function TodaysSchedule() {
  const todaysSchedule = useQuery(api.schedule.getTodaysSchedule);

  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = dayNames[today.getDay()];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b bg-blue-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          📅 Today's Schedule
        </h2>
        <p className="text-lg text-blue-700 font-medium">
          {formatDate(today)}
        </p>
      </div>

      <div className="p-6">
        {todaysSchedule && todaysSchedule.length > 0 ? (
          <div className="space-y-4">
            {todaysSchedule.map((item) => (
              <ClassCard key={item._id} scheduleItem={item} showFullDetails={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-xl font-medium mb-2">No classes today!</p>
            <p className="text-sm">
              {todaysSchedule === undefined ? 'Loading schedule...' : 'Enjoy your free day!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
