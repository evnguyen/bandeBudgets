import { useDispatch, useSelector } from "react-redux";
import { isLoading } from "budget-app-store/src/budget/budgetSlice";
// import { collection, addDoc } from "firebase/firestore";
// import { db } from "../../firebase";
import "./index.css";

function Dashboard() {
  // const store = useStore();
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.budget.isLoading);

  console.log(loading);

  return (
    <>
      <button className="App">
        <a
          className="App-link"
          onClick={() => {
            dispatch(isLoading(true));
          }}
        >
          Learn React
        </a>
      </button>

      <button
        onClick={async () => {
          fetch("/api/test").then((res) => console.log(res));
        }}
      >
        Add Document to firebase
      </button>
    </>
  );
}

export default Dashboard;
