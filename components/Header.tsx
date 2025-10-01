import { getUser, isAuthenticated } from "@/lib/actions/user";
import HeaderContent from "./HeaderContent";
import { getTotalUnrespondedApplication } from "@/lib/actions/application";

const Header = async () => {
  const authenticated = await isAuthenticated();
  const user = authenticated ? await getUser() : null;
  let applications = null;
  if (authenticated && user && user.role === "business_owner") {
    try {
      applications = await getTotalUnrespondedApplication();
    } catch (e) {
      applications = null;
    }
  }
  return (
    <HeaderContent user={user} totalUnrespondedApplications={applications} />
  );
};

export default Header;
