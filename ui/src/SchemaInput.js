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
  const { loading, mutate } = useMutation(inferSchemaAction);
  const dispatch = useDispatch()

  return (
    <div className='SchemaInput'>
      <div>Enter a collection of JSON documents (one per line):</div>
      <textarea disabled={loading} value={json} onChange={e => setJson(e.target.value)} />
        <button disabled={loading} onClick={async () => {
          const {error: mutationError, payload: schema} = await mutate(json);

          if (mutationError) {
            alert('Failed to infer schema');
            console.error(mutationError);
          }
          dispatch(setSchema(schema));
        }}>Extract Schema</button>
    </div>
  );
}

export default SchemaInput;
