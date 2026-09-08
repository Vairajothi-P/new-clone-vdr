import MainSidebar from '@/components/MainSidebar';

export default function CommunicationLayout({ children }) {
  return (
    <div className="flex w-full h-screen overflow-hidden bg-[#F8F9FB] font-sans">
      <MainSidebar />
      <main className="flex-1 min-w-0 h-full overflow-hidden flex flex-col relative">
        {children}
      </main>
    </div>
  );
}
