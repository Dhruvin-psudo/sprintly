import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { User, Building2 } from "lucide-react";
import { ProfileSection } from "@/features/settings/components/profile-section";
import { OrganizationSection } from "@/features/settings/components/organization-section";

const SETTINGS_TABS = [
    { key: "profile", label: "Profile", icon: User },
    { key: "organization", label: "Organization", icon: Building2 },
] as const;

type SettingsTab = (typeof SETTINGS_TABS)[number]["key"];

export function SettingsContainer() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get("tab") as SettingsTab) || "profile";

    return (
        <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
            {/* Page Header */}
            <div className="border-b pb-5">
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your account and organization preferences.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
                {/* Sub-Sidebar */}
                <nav className="w-full sm:w-48 shrink-0 space-y-1">
                    <div className="flex sm:flex-col gap-1 overflow-x-auto pb-2 sm:pb-0">
                        {SETTINGS_TABS.map((tab) => (
                            <Button
                                key={tab.key}
                                variant="ghost"
                                type="button"
                                onClick={() => setSearchParams({ tab: tab.key })}
                                className={cn(
                                    "justify-start gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer whitespace-nowrap h-auto font-normal",
                                    activeTab === tab.key
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                        : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
                                )}
                            >
                                <tab.icon className="size-4" />
                                {tab.label}
                            </Button>
                        ))}
                    </div>
                </nav>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    {activeTab === "profile" && <ProfileSection />}
                    {activeTab === "organization" && <OrganizationSection />}
                </div>
            </div>
        </div>
    );
}
