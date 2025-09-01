import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

const SettingsPage = async () => {
  const session = await auth();
  return (
    <div>
      {JSON.stringify(session, null, 2)}
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
