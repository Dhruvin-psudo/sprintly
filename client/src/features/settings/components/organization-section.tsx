import { useState } from "react";
import { useOrganizations } from "@/features/organization/hooks/use-organizations";
import { useCurrentOrganization } from "@/features/organization/hooks/use-current-organization";
import { useSwitchOrganization } from "@/features/organization/hooks/use-switch-organization";
import { CreateOrganizationDialog } from "@/features/organization/components/create-organization-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Plus, ArrowRightLeft } from "lucide-react";

function OrgSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-60" />
                </div>
                <Skeleton className="h-8 w-20" />
            </CardHeader>
            <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div className="flex items-center gap-3">
                            <Skeleton className="size-10 rounded-lg" />
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-3 w-40" />
                            </div>
                        </div>
                        <Skeleton className="h-8 w-20" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export function OrganizationSection() {
    const { data: organizations, isLoading } = useOrganizations();
    const { data: currentOrg } = useCurrentOrganization();
    const switchMutation = useSwitchOrganization();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    if (isLoading) return <OrgSkeleton />;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Organizations</CardTitle>
                        <CardDescription>
                            Manage your organizations and switch between them.
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="gap-1.5 cursor-pointer"
                    >
                        <Plus className="size-3.5" /> New
                    </Button>
                </CardHeader>
                <CardContent>
                    {!organizations?.length ? (
                        <div className="p-6 text-center text-muted-foreground">
                            <Building2 className="size-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No organizations found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/60">
                            {organizations.map((org) => {
                                const isActive = org.id === currentOrg?.id;
                                return (
                                    <div
                                        key={org.id}
                                        className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                <Building2 className="size-4 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium truncate">{org.name}</p>
                                                    {isActive && (
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-emerald-500/10 text-emerald-600 border-transparent text-[10px]"
                                                        >
                                                            Active
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">{org.slug} • {org.plan}</p>
                                            </div>
                                        </div>
                                        {!isActive && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => switchMutation.mutate(org.id)}
                                                disabled={switchMutation.isPending}
                                                className="gap-1.5 shrink-0 cursor-pointer"
                                            >
                                                <ArrowRightLeft className="size-3.5" />
                                                Switch
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <CreateOrganizationDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
            />
        </div>
    );
}
