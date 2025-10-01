import { getUser, isAuthenticated } from "@/lib/actions/user";
import HeaderContent from "./HeaderContent";
import { getTotalUnrespondedApplication } from "@/lib/actions/application";

const Header = async () => {
  const authenticated = await isAuthenticated();
  const user = authenticated ? await getUser() : null;
  let applications = null;
  if (authenticated && user && user.role === "BUSINESS_OWNER") {
    try {
      applications = await getTotalUnrespondedApplication();
    } catch (e) {
      console.log("Error, ", e);
      applications = null;
    }
  }
  return (
    <HeaderContent user={user} totalUnrespondedApplications={applications} />
  );
};

export default Header;
