import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useMutation, useParameterizedQuery } from 'react-fetching-library';

import { setSchema } from './features/schemaSlice';

import './SchemaInput.css';

const inferSchemaAction = (jsonl) => ({
  headers: {'Content-Type': 'text/plain'},
  method: 'POST',
  endpoint: '/api/discover-schema',
  body: jsonl,
});

const fetchExampleAction = (example) => ({
  headers: {'Accept-Encoding': 'text/plain'},
  method: 'GET',
  endpoint: `/jsonl/${example}`,
});


function SchemaInput() {
  const [json, setJson] = useState('');
  const [example, setExample] = useState('');
  const { loading: inferLoading, mutate } = useMutation(inferSchemaAction);
  const { loading: exampleLoading, query } = useParameterizedQuery(fetchExampleAction);
  const dispatch = useDispatch()

  return (
    <div className='SchemaInput'>
      <div>Select an example collection of documents:</div>
      <select disabled={inferLoading || exampleLoading} value={example} onChange={async (e) => {
        setExample(e.target.value);
        const {error: queryError, payload: exampleJson} = await query(e.target.value);
        if (queryError) {
          alert('Failed to load example');
          console.error(queryError);
        } else {
          setJson(exampleJson);
        }
      }}>
        <option value="">(None)</option>
        <option value="coins.jsonl">Coin Registry</option>
        <option value="mr-robot.jsonl">Mr. Robot (TVmaze)</option>
        <option value="nobel.jsonl">Nobel Prize</option>
        <option value="rickandmorty.jsonl">Rick and Morty characters</option>
        <option value="earthquakes.jsonl">USGS - Earthquakes</option>
        <option value="senators.jsonl">US Senators</option>
      </select>
      <div style={{textAlign: 'center'}}>or</div>
      <div>Enter a collection of JSON documents (one per line):</div>
        <textarea disabled={inferLoading} value={json} onChange={e => {
          setExample('');
          setJson(e.target.value);
        }} />
        <button disabled={inferLoading || exampleLoading} onClick={async () => {
          const {error: mutationError, payload: schema} = await mutate(json);

          if (mutationError) {
            alert('Failed to infer schema');
            console.error(mutationError);
          } else {
            dispatch(setSchema(schema));
          }
        }}>Extract Schema</button>
    </div>
  );
}

export default SchemaInput;
