import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ClassCard } from "./ClassCard";

export function TomorrowsPreview() {
  const tomorrowsSchedule = useQuery(api.schedule.getTomorrowsSchedule);

  const today = new Date();
  const tomorrow = new Date(today);
  
  // Calculate next working day
  let nextDay = today.getDay() + 1;
  if (nextDay === 6 || nextDay === 0 || nextDay === 7) {
    nextDay = 1; // Monday
    tomorrow.setDate(today.getDate() + (8 - today.getDay())); // Next Monday
  } else {
    tomorrow.setDate(today.getDate() + 1);
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const nextDayName = dayNames[nextDay];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b bg-green-50">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          🌅 Tomorrow's Preview
        </h2>
        <p className="text-green-700 font-medium">
          {formatDate(tomorrow)}
        </p>
      </div>

      <div className="p-6">
        {tomorrowsSchedule && tomorrowsSchedule.length > 0 ? (
          <div className="space-y-3">
            {tomorrowsSchedule.map((item) => (
              <ClassCard key={item._id} scheduleItem={item} showFullDetails={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎉</div>
            <p className="font-medium">No classes tomorrow!</p>
          </div>
        )}
      </div>
    </div>
  );
}
