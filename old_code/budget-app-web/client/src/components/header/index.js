import { useSelector } from "react-redux";
import { getUser } from "budget-app-store/src/budget/budgetSlice";

function Header() {
  const userData = useSelector(getUser);
  return (
    <>
      <div>Wecome {userData.email}!</div>
    </>
  );
}

export default Header;
