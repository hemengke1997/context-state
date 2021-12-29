import React from "react";
import CounterContainer from "./CounterContainer";

const Counter = () => {
  const { count, increment } = CounterContainer.usePicker([
    "count",
    "increment",
  ]);

  console.log('counter render')

  return (
    <div>
      <span>current: </span>
      {count}
      <button type="button" onClick={increment}>
        ADD
      </button>
    </div>
  );
};

export default React.memo(Counter);
