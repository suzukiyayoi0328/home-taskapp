import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Mypage from "./pages/Mypage";
import PrivateRoute from "./components/PrivateRoute";
import Settings from "./pages/Settings";
import AddTask from "./pages/AddTask";
import EditTask from "./pages/EditTask";
import CategoryEdit from "./pages/CategoryEdit";
import CalendarPage from "./pages/CalendarPage"; // ← カレンダー追加

// パスは "./pages/CalendarTest" にしてる？

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mypage" element={<Mypage />} />
        <Route path="/add-task" element={<AddTask />} />
        <Route path="/edit-task/:id" element={<EditTask />} />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route path="/edit-category" element={<CategoryEdit />} />
        <Route
          path="/calendar"
          element={
            <PrivateRoute>
              {" "}
              {/* カレンダーもログイン後のみ */}
              <CalendarPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
