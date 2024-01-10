import { useDispatch, useSelector } from "react-redux";
import { getUser } from "budget-app-store/src/budget/budgetSlice";
import "./index.css";

function Dashboard() {
  const dispatch = useDispatch();
  const userData = useSelector(getUser);

  console.log(userData);

  return (
    <>
      <button className="App">
        <a
          className="App-link"
          onClick={() => {
            // dispatch(isLoading(true));
          }}
        >
          Learn React
        </a>
      </button>

      <button
        onClick={async () => {
          fetch("/api/test", {
            headers: {
              idtoken: userData.idToken,
            },
          }).then((res) => console.log(res));
        }}
      >
        Add Document to firebase
      </button>
    </>
  );
}

export default Dashboard;
