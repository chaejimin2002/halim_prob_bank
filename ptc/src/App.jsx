import React from "react";
import WorksheetBuilder from "./WorksheetBuilder";
import WorksheetEditor from "./WorksheetEditor";
import { Routes, Route, Link } from "react-router-dom";
import "katex/dist/katex.min.css";

function Home() {
  return <WorksheetBuilder />;
}

function QuestionId() {
  return <WorksheetEditor />;
}


export default function App() {
  return (
    <div>
      <nav>
        <Link to="/">홈</Link> | <Link to="/question/1">문제 1</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/question/:id" element={<QuestionId />} />
      </Routes>
    </div>
  );
}