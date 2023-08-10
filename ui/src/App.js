import { useDispatch, useSelector } from 'react-redux';

import GithubCorner from 'react-github-corner';
import Schema from './Schema';
import SchemaInput from './SchemaInput';
import { setSchema } from './features/schemaSlice';

import './App.css';

function App() {
  const schema = useSelector((state) => state.schema.schema);
  const dispatch = useDispatch();

  let schemaDisplay;
  let backButton;
  if (schema) {
    schemaDisplay = <Schema schema={schema} />;
    backButton = <button className='back' onClick={() => dispatch(setSchema(null))}>&lt; Back</button>;
  } else {
    schemaDisplay = <SchemaInput />;
  }

  return (
    <div className="App">
      <header>
        <img src="/logo.png" alt="jsonoid" />
        <span>JSON schema inference</span>
        {backButton}
      </header>
      {schemaDisplay}
      <GithubCorner href="https://github.com/dataunitylab/jsonoid-discovery" />
    </div>
  );
}

export default App;
