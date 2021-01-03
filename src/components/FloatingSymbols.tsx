import React from "react";

interface FloatingSymbolsProps {

}

export const FloatingSymbols: React.FC<FloatingSymbolsProps> = () => {
    return (
      <div className="mathsymbols" aria-hidden="true">
          {[...Array(3)].map((item, idx) => (
            <React.Fragment key={idx}>
              <div className="mathsymbol plus">+</div>
              <div className="mathsymbol times">&times;</div>
              <div className="mathsymbol minus">–</div>
              <div className="mathsymbol div">÷</div>
            </React.Fragment>
          ))}
      </div>
    );
  };