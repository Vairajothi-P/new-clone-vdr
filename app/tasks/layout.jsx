import MainSidebar from '@/components/MainSidebar';
import { TasksProvider } from '@/components/tasks/TasksContext';
import TasksHeader from '@/components/tasks/TasksHeader';
import TasksNav from '@/components/tasks/TasksNav';
import TasksModalsWrapper from '@/components/tasks/TasksModalsWrapper';

export default function TasksLayout({ children }) {
  return (
    <TasksProvider>
      <div className="flex w-full h-screen overflow-hidden bg-[#F8F9FB] font-sans relative">
        <MainSidebar />
        <main className="flex-1 min-w-0 h-full overflow-hidden flex flex-col relative z-10">
          <TasksHeader />
          <TasksNav />
          <div className="flex-1 overflow-y-auto bg-[#F8F9FB] relative flex flex-col min-w-0">
            {children}
          </div>
        </main>
      </div>
      <TasksModalsWrapper />
    </TasksProvider>
  );
}
