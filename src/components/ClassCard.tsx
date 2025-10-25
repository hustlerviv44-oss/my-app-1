import { Id } from "../../convex/_generated/dataModel";

interface Course {
  code: string;
  name: string;
  type: string;
  faculty: string;
}

interface ScheduleItem {
  _id: Id<"schedule">;
  startTime: string;
  endTime: string;
  courseCode: string;
  room: string;
  typeNote?: string;
  course: Course;
}

interface ClassCardProps {
  scheduleItem: ScheduleItem;
  showFullDetails: boolean;
}

export function ClassCard({ scheduleItem, showFullDetails }: ClassCardProps) {
  const { startTime, endTime, room, typeNote, course } = scheduleItem;

  // Calculate class status
  const now = new Date();
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startDateTime = new Date();
  startDateTime.setHours(startHour, startMinute, 0, 0);
  
  const endDateTime = new Date();
  endDateTime.setHours(endHour, endMinute, 0, 0);

  const isOngoing = now >= startDateTime && now <= endDateTime;
  const isUpcoming = now < startDateTime;
  const isPast = now > endDateTime;

  let statusColor = "bg-gray-100 text-gray-600";
  let statusText = "Completed";
  let statusIcon = "✓";
  
  if (isOngoing) {
    statusColor = "bg-green-100 text-green-700 border-green-200";
    statusText = "Ongoing";
    statusIcon = "🔴";
  } else if (isUpcoming) {
    statusColor = "bg-blue-100 text-blue-700 border-blue-200";
    statusText = `Starts in ${Math.ceil((startDateTime.getTime() - now.getTime()) / (1000 * 60))} mins`;
    statusIcon = "⏰";
  }

  // Get type color
  const getTypeColor = (type: string) => {
    return type === "Practical" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700";
  };

  if (!showFullDetails) {
    // Minimal detail for tomorrow's preview
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-green-400 rounded-full"></div>
          <div>
            <p className="font-medium text-gray-900">{course.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">
            {startTime} - {endTime}
          </p>
        </div>
      </div>
    );
  }

  // Full detail for today's schedule
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-bold text-lg text-gray-900">
              {course.code} - {course.name}
            </h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(course.type)}`}>
              {course.type}
            </span>
          </div>
          <p className="text-gray-600 mb-2">👨‍🏫 {course.faculty}</p>
          {typeNote && (
            <p className="text-sm text-purple-600 font-medium mb-2">📝 {typeNote}</p>
          )}
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColor}`}>
          <span className="mr-1">{statusIcon}</span>
          {statusText}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-600">
            <span className="mr-1">🕐</span>
            <span className="font-medium">{startTime} - {endTime}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <span className="mr-1">📍</span>
            <span className="font-medium">{room}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
