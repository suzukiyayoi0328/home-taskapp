import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react"; // 追加
import Login from "./pages/Login";
import Register from "./pages/Register";
import Mypage from "./pages/Mypage";
import PrivateRoute from "./components/PrivateRoute";
import Settings from "./pages/Settings";
import AddTask from "./pages/AddTask";
import EditTask from "./pages/EditTask";
import CategoryEdit from "./pages/CategoryEdit";
import CalendarPage from "./pages/CalendarPage"; // ← カレンダー追加
function App() {
    // 🌙 ダークモードの初期反映
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            document.body.classList.add("dark");
        }
        else {
            document.body.classList.remove("dark");
        }
    }, []);
    return (_jsx(Router, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Login, {}) }), _jsx(Route, { path: "/register", element: _jsx(Register, {}) }), _jsx(Route, { path: "/mypage", element: _jsx(Mypage, {}) }), _jsx(Route, { path: "/add-task", element: _jsx(AddTask, {}) }), _jsx(Route, { path: "/edit-task/:id", element: _jsx(EditTask, {}) }), _jsx(Route, { path: "/settings", element: _jsx(PrivateRoute, { children: _jsx(Settings, {}) }) }), _jsx(Route, { path: "/edit-category", element: _jsx(CategoryEdit, {}) }), _jsx(Route, { path: "/calendar", element: _jsx(PrivateRoute, { children: _jsx(CalendarPage, {}) }) })] }) }));
}
export default App;
