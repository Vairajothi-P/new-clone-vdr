import DocumentsLayoutWrapper from '@/components/documents/DocumentsLayoutWrapper';

export const metadata = {
    title: 'Documents - Virtual Data Room',
    description: 'Securely browse and manage your VDR documents.',
};

export default function DocumentsLayout({ children }) {
    return (
        <div className="h-screen w-full bg-white flex overflow-hidden font-sans">
            {/* Tier 2 Sidebar & Main Content Wrapper */}
            <DocumentsLayoutWrapper>
                {children}
            </DocumentsLayoutWrapper>
        </div>
    );
}