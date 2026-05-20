import SettingsLayoutWrapper from '@/components/settings/SettingsLayoutWrapper';
import MainSidebar from '@/components/MainSidebar';

export const metadata = {
  title: 'Settings - Virtual Data Room',
  description: 'Manage your VDR preferences and branding.',
};

export default function SettingsLayout({ children }) {
  return (
    <div className="h-screen w-full bg-white flex overflow-hidden font-sans">
      <MainSidebar />
      <SettingsLayoutWrapper>
        {children}
      </SettingsLayoutWrapper>
    </div>
  );
}
