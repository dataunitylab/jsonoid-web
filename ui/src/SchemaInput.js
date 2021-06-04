import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useMutation } from 'react-fetching-library';

import { setSchema } from './features/schemaSlice';

import './SchemaInput.css';

const inferSchemaAction = (jsonl) => ({
  headers: {'Content-Type': 'text/plain'},
  method: 'POST',
  endpoint: '/api/discover-schema',
  body: jsonl,
});

function SchemaInput() {
  const [json, setJson] = useState('');
  const { loading, payload, mutate } = useMutation(inferSchemaAction);
  const dispatch = useDispatch()

  return (
    <div className='SchemaInput'>
      <textarea disabled={loading} value={json} onChange={e => setJson(e.target.value)} />
        <button disabled={loading} onClick={async () => {
          await mutate(json);
          dispatch(setSchema(payload));
        }}>Extract Schema</button>
    </div>
  );
}

export default SchemaInput;
