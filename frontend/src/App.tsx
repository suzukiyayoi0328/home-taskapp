import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Mypage from "./pages/Mypage";
import PrivateRoute from "./components/PrivateRoute";
import Settings from "./pages/Settings";
import AddTask from "./pages/AddTask";
import EditTask from "./pages/EditTask";
import CategoryEdit from "./pages/CategoryEdit";
import CalendarPage from "./pages/CalendarPage";

function App() {
  // ダークモードの初期反映
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/mypage"
          element={
            <PrivateRoute>
              <Mypage />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-task"
          element={
            <PrivateRoute>
              <AddTask />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-task/:id"
          element={
            <PrivateRoute>
              <EditTask />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-category"
          element={
            <PrivateRoute>
              <CategoryEdit />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <PrivateRoute>
              <CalendarPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
