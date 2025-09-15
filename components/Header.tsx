import { getUser, isAuthenticated } from "@/lib/actions/user";
import HeaderContent from "./HeaderContent";

const Header = async () => {
  const authenticated = await isAuthenticated();
  const user = authenticated ? await getUser() : null;
  return <HeaderContent user={user} />;
};

export default Header;
