import './App.css';
import React from "react";
import GetAufgaben from "./components/GetAufgaben";

const style = {
  bg: `h-screen w-screen p-4 bg-gradient-to-r from-[#2f80ed] to-[#1cb5e0]`,
  container: `bg-slate-100 max-w-[500px] w-full m-auto rounded-md shadow-xl p-4`,
};

function App() {
  return (
    <div className={style.bg}>
      <div className={style.container}>
        <main>
          <GetAufgaben />
        </main>
      </div>
    </div>
  );
}

export default App;