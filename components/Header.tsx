import { getUser } from "@/lib/actions/user";
import HeaderContent from "./HeaderContent";

const Header = async () => {
  const user = await getUser();
  return <HeaderContent user={user} />;
};

export default Header;
