import React from "react";
import { HelmetProvider } from 'react-helmet-async';
import GetAufgaben from "./components/GetAufgaben";
import './App.css';

function App() {
  return (
        <main>
           <HelmetProvider>
              <GetAufgaben />
          </HelmetProvider>
        </main>
  );
}

export default App;
