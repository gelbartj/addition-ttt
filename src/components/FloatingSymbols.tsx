interface FloatingSymbolsProps {
    show: boolean
}

const FloatingSymbols: React.FC<FloatingSymbolsProps> = ({ show }) => {
    return (
      <div className="mathsymbols" aria-hidden="true">
        {show &&
          [...Array(3)].map((item, idx) => (
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