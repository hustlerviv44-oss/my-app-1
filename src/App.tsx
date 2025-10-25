import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Toaster, toast } from "sonner";
import { useEffect, useState } from "react";

export default function App() {
  const scheduleData = useQuery(api.schedule.getScheduleData);
  const initializeSchedule = useMutation(api.schedule.initializeSchedule);
  const scheduleNotification = useMutation(api.schedule.scheduleNotification);
  const pendingNotifications = useQuery(api.schedule.getPendingNotifications);
  const markNotificationSent = useMutation(api.schedule.markNotificationSent);

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Initialize schedule data if it doesn't exist
  useEffect(() => {
    if (scheduleData === null) {
      initializeSchedule();
    }
  }, [scheduleData, initializeSchedule]);

  // Handle notifications
  useEffect(() => {
    if (pendingNotifications && pendingNotifications.length > 0) {
      pendingNotifications.forEach((notification) => {
        toast(`📚 Class Reminder`, {
          description: `${notification.classCode} starts in 15 minutes at ${notification.room}`,
          duration: 8000,
        });
        markNotificationSent({ notificationId: notification._id });
      });
    }
  }, [pendingNotifications, markNotificationSent]);

  if (scheduleData === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading your schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Header currentTime={currentTime} />
        <ScheduleView 
          scheduleData={scheduleData} 
          currentTime={currentTime}
          scheduleNotification={scheduleNotification}
        />
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
          }
        }}
      />
    </div>
  );
}

function Header({ currentTime }: { currentTime: Date }) {
  const formatCurrentTime = () => {
    return currentTime.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="mb-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
          Class Schedule
        </h1>
        <p className="text-slate-600 text-lg font-medium">
          {formatCurrentTime()}
        </p>
      </div>
    </div>
  );
}

function ScheduleView({ scheduleData, currentTime, scheduleNotification }: {
  scheduleData: any;
  currentTime: Date;
  scheduleNotification: any;
}) {
  if (!scheduleData) return null;

  const { registeredCourses, classTimetable } = scheduleData;

  // Get current day and next working day
  const getCurrentDay = () => {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[currentTime.getDay()];
  };

  const getNextWorkingDay = () => {
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    const currentDay = getCurrentDay();
    
    if (currentDay === 'FRIDAY') return 'MONDAY';
    if (currentDay === 'SATURDAY' || currentDay === 'SUNDAY') return 'MONDAY';
    
    const currentIndex = days.indexOf(currentDay);
    return days[currentIndex + 1] || 'MONDAY';
  };

  const currentDay = getCurrentDay();
  const nextDay = getNextWorkingDay();

  // Get today's classes
  const todaysClasses = currentDay === 'SATURDAY' || currentDay === 'SUNDAY' 
    ? [] 
    : classTimetable[currentDay] || [];

  // Get tomorrow's classes
  const tomorrowsClasses = classTimetable[nextDay] || [];

  // Helper function to get course details
  const getCourseDetails = (code: string) => {
    return registeredCourses.find((course: any) => course.code === code);
  };

  // Helper function to get class status
  const getClassStatus = (startTime: string, endTime: string) => {
    const now = currentTime;
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startDateTime = new Date(now);
    startDateTime.setHours(startHour, startMin, 0, 0);
    
    const endDateTime = new Date(now);
    endDateTime.setHours(endHour, endMin, 0, 0);
    
    if (now < startDateTime) {
      const diffMs = startDateTime.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins <= 15) {
        return { 
          status: 'starting-soon', 
          text: `Starting in ${diffMins}m`, 
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      }
      return { 
        status: 'upcoming', 
        text: `Starts ${startTime}`, 
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    } else if (now >= startDateTime && now <= endDateTime) {
      return { 
        status: 'ongoing', 
        text: 'Live Now', 
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else {
      return { 
        status: 'finished', 
        text: `Ended ${endTime}`, 
        color: 'text-slate-400',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200'
      };
    }
  };

  // Schedule notifications for today's classes
  useEffect(() => {
    todaysClasses.forEach((classItem: any) => {
      const course = getCourseDetails(classItem.code);
      if (!course) return;

      const [hour, min] = classItem.start.split(':').map(Number);
      const classDate = new Date(currentTime);
      classDate.setHours(hour, min, 0, 0);
      
      // Schedule notification 15 minutes before
      const notificationTime = new Date(classDate.getTime() - 15 * 60 * 1000);
      
      if (notificationTime > currentTime) {
        scheduleNotification({
          classCode: classItem.code,
          className: course.name,
          startTime: classItem.start,
          room: classItem.room,
          scheduledFor: notificationTime.getTime(),
        });
      }
    });
  }, [todaysClasses, currentTime, scheduleNotification]);

  const getNextDayDate = () => {
    const tomorrow = new Date(currentTime);
    const daysUntilNext = nextDay === 'MONDAY' && (currentDay === 'FRIDAY' || currentDay === 'SATURDAY' || currentDay === 'SUNDAY')
      ? (currentDay === 'FRIDAY' ? 3 : currentDay === 'SATURDAY' ? 2 : 1)
      : 1;
    tomorrow.setDate(tomorrow.getDate() + daysUntilNext);
    return tomorrow;
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'theory': return '📖';
      case 'practical': return '🔬';
      case 'lab': return '💻';
      default: return '📚';
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Today's Schedule - Main Panel */}
      <div className="lg:col-span-2">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Today's Classes
            </h2>
            <p className="text-slate-600">
              {currentDay === 'SATURDAY' || currentDay === 'SUNDAY' 
                ? '🎉 No classes today - Enjoy your weekend!' 
                : `${currentDay.charAt(0) + currentDay.slice(1).toLowerCase()}, ${currentTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}
            </p>
          </div>

          {todaysClasses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">☀️</div>
              <p className="text-xl text-slate-600 font-medium">Free day ahead!</p>
              <p className="text-slate-500 mt-2">No classes scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todaysClasses.map((classItem: any, index: number) => {
                const course = getCourseDetails(classItem.code);
                const status = getClassStatus(classItem.start, classItem.end);
                
                return (
                  <div 
                    key={index} 
                    className={`${status.bgColor} ${status.borderColor} border-2 rounded-xl p-5 transition-all duration-200 hover:shadow-md hover:scale-[1.01]`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{getTypeIcon(course?.type)}</span>
                          <h3 className="text-lg font-bold text-slate-800">
                            {classItem.code}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color} ${status.bgColor} border ${status.borderColor}`}>
                            {status.text}
                          </span>
                        </div>
                        <p className="text-slate-700 font-medium mb-1">
                          {course?.name || 'Unknown Course'}
                        </p>
                        <p className="text-slate-600 text-sm">
                          👨‍🏫 {course?.faculty || 'TBA'}
                        </p>
                        {classItem.typeNote && (
                          <p className="text-slate-500 text-sm mt-1">
                            ℹ️ {classItem.typeNote}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-slate-800">
                          {classItem.start}
                        </p>
                        <p className="text-sm text-slate-600">
                          to {classItem.end}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-slate-600">
                        📍 {classItem.room}
                      </span>
                      <span className="text-slate-500">
                        {course?.type || 'Unknown'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Tomorrow's Preview */}
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-5">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Tomorrow
            </h3>
            <p className="text-slate-600 text-sm">
              {nextDay.charAt(0) + nextDay.slice(1).toLowerCase()}, {getNextDayDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>

          {tomorrowsClasses.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">🎈</div>
              <p className="text-slate-500 text-sm">No classes tomorrow</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tomorrowsClasses.map((classItem: any, index: number) => {
                const course = getCourseDetails(classItem.code);
                
                return (
                  <div key={index} className="bg-white/80 rounded-lg p-3 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getTypeIcon(course?.type)}</span>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">
                            {classItem.code}
                          </p>
                          <p className="text-xs text-slate-600">
                            {course?.name?.substring(0, 25)}...
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-700">
                          {classItem.start}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-5 text-white">
          <h3 className="text-lg font-bold mb-3">📊 Quick Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-blue-100">Total Courses</span>
              <span className="font-bold">{registeredCourses.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-100">Today's Classes</span>
              <span className="font-bold">{todaysClasses.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-100">Tomorrow's Classes</span>
              <span className="font-bold">{tomorrowsClasses.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
