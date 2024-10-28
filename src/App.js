import React from "react";
import TeacherDashboard from "./components/TeacherDashboard";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>윤선생 로블록스 학생 활동</h1>
      </header>
      <main>
        <TeacherDashboard />
      </main>
    </div>
  );
}

export default App;
