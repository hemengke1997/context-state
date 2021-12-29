import React, { useMemo, useState } from 'react';
import CounterContainer from './CounterContainer';
import Counter from './Counter';
import Other from './Other';
import Initial from './Initial';

const App = () => {
  const [initialState, setInitalState] = useState<number>(0);

  const [, setX] = useState<number>();

  return (
    <>
      <button onClick={() => setInitalState(Math.random())}>setInitalState</button>
      <button onClick={() => setX(Math.random())}>setX</button>
      <CounterContainer.Provider
        value={useMemo(
          () => ({
            v: initialState,
            setV: setInitalState,
          }),
          [initialState],
        )}
      >
        <Counter />
        <Other />
        <Initial />
      </CounterContainer.Provider>
    </>
  );
};

export default App;
