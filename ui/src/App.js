import { useDispatch, useSelector } from 'react-redux';

import Schema from './Schema';
import SchemaInput from './SchemaInput';
import { setSchema } from './features/schemaSlice';

import './App.css';

function App() {
  const schema = useSelector((state) => state.schema.schema);
  const dispatch = useDispatch();

  let schemaDisplay;
  if (schema) {
    schemaDisplay = <>
      <button className='back' onClick={() => dispatch(setSchema(null))}>&lt; Back</button>
      <Schema schema={schema} />
    </>;
  } else {
    schemaDisplay = <SchemaInput />;
  }

  return (
    <div className="App">
      <header>
        <img src="/logo.png" alt="jsonoid" />
        <span>JSON schema inference</span>
      </header>
      {schemaDisplay}
    </div>
  );
}

export default App;
