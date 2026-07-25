import {
  CreateOrganizationForm,
  type CreateOrganizationFormValues,
} from "@/features/organization/components/create-organization-form";
import { useCreateOrganization } from "@/features/organization/hooks/use-create-organization";

export function CreateOrganizationPage() {
  const createOrgMutation = useCreateOrganization();

  function handleCreateOrg(data: CreateOrganizationFormValues) {
    createOrgMutation.mutate(data);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Create your organization
        </h1>
        <p className="text-sm text-muted-foreground">
          Set up a workspace for your team to collaborate and manage projects
        </p>
      </div>

      <CreateOrganizationForm
        onSubmit={handleCreateOrg}
        isPending={createOrgMutation.isPending}
      />
    </div>
  );
}
