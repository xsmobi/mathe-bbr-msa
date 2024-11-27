import './App.css';
import React from "react";
import GetAufgaben from "./components/GetAufgaben";

const style = {
  bg: `h-screen w-screen p-4 bg-gradient-to-r from-[#2f80ed] to-[#1cb5e0]`,
  container: `bg-slate-100 max-w-[500px] w-full m-auto rounded-md shadow-xl p-4`,
  heading: `text-3xl font-bold text-center text-gray-800 p-2 notranslate`,
};

function App() {
  return (
    <div className={style.bg}>
      <div className={style.container}>
      <header className="relative flex items-center justify-center h-20">
        <h1 className="text-3xl font-bold text-blue-500">
          Mathe BBR MSA
        </h1>
        <img
          className="absolute top-0 right-2 h-12 w-12 rounded-md"
          src="https://mathbydoing.app/apple-touch-icon.png"
          alt="schlau.app Logo"
          loading="lazy"
        />
      </header>
        <main>
          {/* <h3>BBR- und MSA-Aufgaben</h3>*/}
          <GetAufgaben /> {/* Render GetAufgaben component only */}
        </main>
      </div>
    </div>
  );
}

export default App;
