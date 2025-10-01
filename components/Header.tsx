import { getUser, isAuthenticated } from "@/lib/actions/user";
import HeaderContent from "./HeaderContent";
import { getTotalUnrespondedApplication } from "@/lib/actions/application";

const Header = async () => {
  const authenticated = await isAuthenticated();
  const user = authenticated ? await getUser() : null;
  const applications = await getTotalUnrespondedApplication();
  return (
    <HeaderContent user={user} totalUnrespondedApplications={applications} />
  );
};

export default Header;
