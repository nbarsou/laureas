import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

const SettingsPage = async () => {
  const session = await auth();

  return (
    <div>
      <p>User Role: {session?.user.role ? session.user.role : "No role"}</p>
      <p>User Session: {JSON.stringify(session, null, 2)}</p>

      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <Button variant="default" type="submit">
          Sign out
        </Button>
      </form>
    </div>
  );
};

export default SettingsPage;
