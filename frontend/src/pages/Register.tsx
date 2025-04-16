import { useState } from "react";
import axios from "axios";

function Register() {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleRegister = async () => {
    try {
      const response = await axios.post("http://localhost:3001/register", {
        username,
        email,
        password,
      });

      console.log("登録成功！", response.data);
      alert("ユーザー登録が完了しました！");
    } catch (error) {
      console.error("登録エラー:", error);
      alert("登録に失敗しました。");
    }
  };

  return (
    <div>
      <h1>ユーザー登録</h1>
      <input
        type="text"
        placeholder="ユーザー名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={handleRegister}>登録</button>
    </div>
  );
}

export default Register;
