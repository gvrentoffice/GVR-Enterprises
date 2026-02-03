export default function AgentLoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Standalone layout for login page - no sidebar, no navigation
    // This overrides the parent agent layout
    return (
        <div className="min-h-screen w-full">
            {children}
        </div>
    );
}
