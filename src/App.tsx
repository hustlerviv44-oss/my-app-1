import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { useEffect } from "react";
import { TodaysSchedule } from "./components/TodaysSchedule";
import { TomorrowsPreview } from "./components/TomorrowsPreview";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-blue-600">📚 Class Schedule</h2>
        <SignOutButton />
      </header>
      <main className="flex-1">
        <Content />
      </main>
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const initializeData = useMutation(api.schedule.initializeExampleData);

  useEffect(() => {
    if (loggedInUser) {
      initializeData();
    }
  }, [loggedInUser, initializeData]);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Unauthenticated>
        <div className="text-center py-12 px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">📚 Student Schedule</h1>
          <p className="text-xl text-gray-600 mb-8">Track your classes and never miss one!</p>
          <SignInForm />
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="space-y-6 p-4">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {loggedInUser?.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-gray-600">Academic Year 2025-26 / Autumn Semester</p>
          </div>

          {/* Today's Schedule - Full Detail */}
          <TodaysSchedule />

          {/* Tomorrow's Preview - Minimal Detail */}
          <TomorrowsPreview />

          <div className="text-center text-sm text-gray-500 mt-8 p-4">
            <p>💡 <strong>Note:</strong> This shows your actual class schedule for easy reference.</p>
          </div>
        </div>
      </Authenticated>
    </div>
  );
}
