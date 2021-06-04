import {useState} from 'react';
import LineGraph from 'react-line-graph';

function Histogram({data}) {
  const [value, setValue] = useState('');
  data.sort((a, b) => b[0] - a[0]);
  return <div>
    {value}
    <LineGraph
      data={data}
      smoothing={1}
      hover={true}
      accent={'palevioletred'}
      fillBelow={'rgba(200,67,23,0.1)'}
      onHover={([x, y]) => setValue(x)}
    />
  </div>
}

export default Histogram;
