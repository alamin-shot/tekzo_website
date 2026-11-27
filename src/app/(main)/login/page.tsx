import { Suspense } from "react";
import LoginPage from "@/Components/Login/LoginPage";

const Login = () => {
  return (
    <div>
      <Suspense>
        <LoginPage />
      </Suspense>
    </div>
  );
};

export default Login;
