import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  return isLoggedIn() ? children : <Navigate to="/" />;
};

export default PrivateRoute;
