import { getUserOrNull } from "@/lib/actions/user";
import HeaderContent from "./HeaderContent";
import { getTotalUnrespondedApplication } from "@/lib/actions/application";

const Header = async () => {
  const user = await getUserOrNull();

  let applications = null;
  if (user?.role === "BUSINESS_OWNER") {
    try {
      applications = await getTotalUnrespondedApplication();
    } catch (e) {
      console.log("Error getting applications, ", e);
      applications = null;
    }
  }

  return (
    <HeaderContent user={user} totalUnrespondedApplications={applications} />
  );
};

export default Header;
