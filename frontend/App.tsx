import { useState } from "react";
import { API_URL } from "./config";

function App() {
  const [result, setResult] = useState("");

  async function testBackend() {
    try {
      const res = await fetch(`${API_URL}/db-test`);
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult("❌ Could not connect to backend");
      console.error(err);
    }
  }

  return (
    <div>
      <h1>CampusConnect</h1>
      <button onClick={testBackend}>Test Backend</button>
      <pre>{result}</pre>
    </div>
  );
}

export default App;
