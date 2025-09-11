"use client";

import { RoleGate } from "@/components/auth/role-gate";
import { FormSucess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { admin } from "@/data/admin";
import { UserRole } from "@prisma/client";
import { toast } from "sonner";

export const AdminPage = () => {
  const onServerActionClick = () => {
    admin().then((data) => {
      if (data.error) toast.error(data.error);
      if (data.success) toast.success(data.success);
    });
  };
  return (
    
    <Card className="w-[600px]">
      <CardHeader>
        <p className="text-2xl font-semibold text-center">Admin</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <RoleGate allowedRole={UserRole.ADMIN}>
          <FormSucess message="You are allowed to see this content!" />
        </RoleGate>
        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-md">
          <p className="text-sm font-medium">Admin-only Server Action</p>
          <Button onClick={onServerActionClick}>Click to test</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPage;
