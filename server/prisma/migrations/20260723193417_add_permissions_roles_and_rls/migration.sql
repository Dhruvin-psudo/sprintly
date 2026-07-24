-- AlterTable roles
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "description" VARCHAR(255);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "resource" VARCHAR(100) NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable Row Level Security (RLS)
ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organization_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tags" ENABLE ROW LEVEL SECURITY;

-- Create RLS tenant isolation policies
CREATE POLICY tenant_isolation_tags ON "tags"
  FOR ALL
  USING (
    current_setting('app.current_org_id', true) IS NULL OR
    current_setting('app.current_org_id', true) = '' OR
    "organization_id"::text = current_setting('app.current_org_id', true)
  );

CREATE POLICY tenant_isolation_org_members ON "organization_members"
  FOR ALL
  USING (
    current_setting('app.current_org_id', true) IS NULL OR
    current_setting('app.current_org_id', true) = '' OR
    "organization_id"::text = current_setting('app.current_org_id', true) OR
    "user_id"::text = current_setting('app.current_user_id', true)
  );

CREATE POLICY tenant_isolation_roles ON "roles"
  FOR ALL
  USING (
    current_setting('app.current_org_id', true) IS NULL OR
    current_setting('app.current_org_id', true) = '' OR
    "organization_id" IS NULL OR
    "organization_id"::text = current_setting('app.current_org_id', true)
  );

CREATE POLICY tenant_isolation_organizations ON "organizations"
  FOR ALL
  USING (
    current_setting('app.current_org_id', true) IS NULL OR
    current_setting('app.current_org_id', true) = '' OR
    "id"::text = current_setting('app.current_org_id', true)
  );
