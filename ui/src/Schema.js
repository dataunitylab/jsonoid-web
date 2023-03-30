import {useState} from 'react';
import produce from 'immer';
import ReactJson from 'react-json-view';
import CheckBloom from './CheckBloom';
import Histogram from './Histogram';

const removeProps = ['bloomFilter', 'examples', 'distinctValues', 'histogram', 'statistics', 'fieldPresence', 'lengthHistogram', 'hll']

function stripMeta(schema) {
  for (const prop in schema) {
    if (removeProps.includes(prop)) {
      delete schema[prop];
    } else if (typeof(schema[prop]) == 'object') {
      stripMeta(schema[prop]);
    }
  }
  return schema;
}

function findMeta(schema, namespace) {
  if (namespace.length === 0) {
    return schema;
  } else {
    return findMeta(schema[namespace[0]], namespace.slice(1));
  }
}

function showMeta(schema, namespace) {
  const meta = findMeta(schema, namespace);

  let histogram;
  if (meta.histogram && meta.histogram.length > 1) {
    histogram = <div>
      <h2>Histogram</h2>
      <Histogram data={meta.histogram} />
    </div>;
  }

  let lengthHistogram;
  if (meta.lengthHistogram && meta.lengthHistogram.length > 1) {
    lengthHistogram = <div>
      <h2>Length Histogram</h2>
      <Histogram data={meta.lengthHistogram} />
    </div>;
  }

  let stats;
  if (meta.statistics && meta.statistics.total > 1) {
    stats = <div>
      <h2>Statistics</h2>
      <table cellPadding={10}>
        <tr>
          <td>Mean</td>
          <td>{meta.statistics.mean}</td>
        </tr>
        <tr>
          <td>Standard deviation</td>
          <td>{meta.statistics.stdev.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Variance</td>
          <td>{meta.statistics.variance.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Skewness</td>
          <td>{meta.statistics.skewness.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Kurtosis</td>
          <td>{meta.statistics.kurtosis.toFixed(2)}</td>
        </tr>
      </table>
    </div>;
  }

  let distinct;
  if (meta.distinctValues) {
    distinct = <div>
      <h2>Distinct Values</h2>
      {meta.distinctValues}
    </div>;
  }

  let fieldPresence;
  if (meta.fieldPresence) {
    fieldPresence = <div>
      <h2>Object Key Presence</h2>
      <table cellPadding={10}>
        <tbody>
          {Object.keys(meta.fieldPresence).sort((k1, k2) => meta.fieldPresence[k2] - meta.fieldPresence[k1]).map(key =>
            <tr key={key}>
              <td>{key}</td>
              <td>{(meta.fieldPresence[key] * 100).toFixed(2)}%</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>;
  }

  let examples;
  if (meta.examples) {
    const sortedExamples = [...meta.examples].sort();
    examples = <div>
      <h2>Samples</h2>
      <div style={{maxHeight: '200px', overflow: 'scroll'}}>
        {sortedExamples.map((sample, index) => <div key={index}>{sample}</div>)}
      </div>
    </div>;
  }

  let checkBloom;
  if (meta.type === 'string') {
    checkBloom = <div>
      <h2>Check containment</h2>
      <div><em>This may produce false positives, but not false negatives.</em></div>
      <CheckBloom namespace={namespace} />
    </div>;
  }

  return <div>
    {fieldPresence}
    {histogram}
    {lengthHistogram}
    {stats}
    {distinct}
    {examples}
    {checkBloom}
  </div>;
}

function Schema({schema}) {
  const [namespace, setNamespace] = useState([]);
  const displaySchema = produce(schema, stripMeta);

  return <div style={{width: '100%', display: 'flex', overflow: 'hidden'}}>
    <div style={{overflow: 'scroll'}}>
      <ReactJson
        src={displaySchema}
        name={false}
        enableClipboard={false}
        displayObjectSize={false}
        displayDataTypes={false}
        onSelect={x => setNamespace(x.namespace)}/>
    </div>
    <div style={{overflow: 'scroll', padding: '2em'}}>
      <h1>{namespace.filter((e, i) => i % 2).join('.')}</h1>
      {showMeta(schema, namespace)}
    </div>
  </div>;
}

export default Schema;
