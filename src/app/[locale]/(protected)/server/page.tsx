import { currentUser } from "@/lib/auth";
import { UserInfo } from "../_components/user-info";

const ServerPage = async () => {
  const user = await currentUser();

  return <UserInfo user={user} label="Server component"></UserInfo>;
};

export default ServerPage;
