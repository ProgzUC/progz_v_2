import React from "react";
import { useSearchParams } from "react-router-dom";
import { getCompilerSrc } from "../../../utils/compilerMode";
import "./CompilerPage.css";

const CompilerPage = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const src = getCompilerSrc(mode);

  return (
    <div className="compiler-page">
      <header className="compiler-header">
        <h1 className="compiler-title">Code Compiler</h1>
      </header>
      <iframe
        src={src}
        title="Code Compiler"
        className="compiler-iframe"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
};

export default CompilerPage;
