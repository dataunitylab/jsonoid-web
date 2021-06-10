import {useState} from 'react';
import { useParameterizedQuery } from 'react-fetching-library';

const checkBloomFilter = (path, value) => ({
  method: 'GET',
  endpoint: `/api/check-bloom?path=${path}&value=${value}`
});


function CheckBloom({namespace}) {
  const [bloomCheck, setBloomCheck] = useState('');
  const [valueFound, setValueFound] = useState(undefined);
  const {loading, query} = useParameterizedQuery(checkBloomFilter);

  let found;
  if (valueFound) {
    found = <span>Value may be present at this path</span>;
  } else if (typeof valueFound !== 'undefined') {
    found = <span>Value is not present at this path</span>;
  } else {
    found = <></>;
  }

  return <div style={{padding: '1em'}}>
    <input disabled={loading} value={bloomCheck} onChange={e => {
      setValueFound(undefined);
      setBloomCheck(e.target.value);
    }} type="text" style={{padding: '1em', width: '10em'}} />
    <button disabled={loading} style={{fontSize: '1em', margin: '1em', padding: '0.5em'}} onClick={async () => {
      const path = "/" + namespace.filter((e, i) => i % 2 === 1).join("/");
      const {payload, error} = await query(path, bloomCheck);
      if (error) {
        alert(`Error checking containment: ${payload.error}`)
        setValueFound(undefined);
      } else {
        setValueFound(payload.matches);
      }
    }}>Test</button>
    {found}
  </div>;
}

export default CheckBloom;
