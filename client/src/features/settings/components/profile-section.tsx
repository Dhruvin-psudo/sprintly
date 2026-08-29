import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ChangePasswordForm } from "@/features/settings/components/change-password-form";
import { User, Mail, Shield, CalendarDays } from "lucide-react";
import type { ReactNode } from "react";

interface InfoItemProps {
    icon: typeof User;
    label: string;
    value?: string;
    children?: ReactNode;
}

function InfoItem({ icon: Icon, label, value, children }: InfoItemProps) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
            <Icon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                {children ?? <p className="text-sm font-medium mt-0.5">{value}</p>}
            </div>
        </div>
    );
}

function ProfileSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-64 mt-1" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="size-16 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                    <Separator />
                    <div className="grid gap-4 sm:grid-cols-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 rounded-lg" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export function ProfileSection() {
    const { data: user, isLoading } = useCurrentUser();

    if (isLoading) return <ProfileSkeleton />;
    if (!user) return null;

    const initials =
        `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U";
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

    return (
        <div className="space-y-6">
            {/* Profile Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                        Your account details and profile information.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Avatar + Name */}
                    <div className="flex items-center gap-4">
                        <Avatar className="size-16">
                            <AvatarFallback className="bg-gradient-brand text-white text-xl font-bold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-lg font-semibold">{fullName}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Info Grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <InfoItem icon={Mail} label="Email" value={user.email} />
                        <InfoItem
                            icon={Shield}
                            label="Role"
                            value={user.currentRole?.name ?? "No role"}
                        />
                        <InfoItem icon={User} label="Status">
                            <Badge
                                variant="outline"
                                className={
                                    user.status === "ACTIVE"
                                        ? "bg-emerald-500/10 text-emerald-600 border-transparent mt-0.5"
                                        : "bg-amber-500/10 text-amber-600 border-transparent mt-0.5"
                                }
                            >
                                {user.status}
                            </Badge>
                        </InfoItem>
                        <InfoItem
                            icon={CalendarDays}
                            label="Member since"
                            value={new Date(user.createdAt).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                            })}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                        Update your password to keep your account secure.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChangePasswordForm />
                </CardContent>
            </Card>
        </div>
    );
}
