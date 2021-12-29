import React from 'react';
import CounterContainer from './CounterContainer';

const Other = () => {
  const { other, setOther } = CounterContainer.usePicker(['other', 'setOther']);

  console.log('other render')


  return (
    <div>
      <span>other: </span>
      {other}
      <button type="button" onClick={() => setOther((o) => `${o}y`)}>
        ADD
      </button>
    </div>
  );
};

export default React.memo(Other);
