import SettingsLayoutWrapper from '@/components/settings/SettingsLayoutWrapper';

export const metadata = {
  title: 'Settings - Virtual Data Room',
  description: 'Manage your VDR preferences and branding.',
};

export default function SettingsLayout({ children }) {
  return (
    <div className="h-screen w-full bg-white flex overflow-hidden font-sans">
      {/* Tier 2 Sidebar & Main Content Wrapper */}
      <SettingsLayoutWrapper>
        {children}
      </SettingsLayoutWrapper>
    </div>
  );
}
