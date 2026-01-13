import React, { useState } from 'react';
import axios from 'axios';
import CompositionTable from './components/CompositionTable';
import TopHoldingsChart from './components/TopHoldingsChart';
import PerformanceLineChart from './components/PerformanceLineChart';

function App() {
  const [weightsFile, setWeightsFile] = useState(null);
  const [pricesFile, setPricesFile] = useState(null);
  const [compData, setCompData] = useState([]);
  const [perfData, setPerfData] = useState([]);
  const [timeRange, setTimeRange] = useState("MAX");
  const [message, setMessage] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'weight', direction: 'desc' });
  const [topHoldings, setTopHoldings] = useState([]);
  const [priceChanges, setPriceChanges] = useState([]);

  // sorting logic for data table (asecnding and descending)
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // making sorted changes to the data
  const getSortedData = () => {
    let sortableData = [...compData];
    sortableData.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortableData;
  };



  // Data-tabe max weight
  const maxWeight = compData.length > 0 ? Math.max(...compData.map(item => item.weight)) : 0;

  // Axios API request calls to back end Python
  // Posting CSV and getting data back as JSON
  const onUploadAndProcess = async () => {
    if (!weightsFile || !pricesFile) return alert("Select both files.");
    const formData = new FormData();
    formData.append("weights_file", weightsFile);
    formData.append("prices_file", pricesFile);
    try {
      setMessage("Processing...");
      await axios.post("http://127.0.0.1:8000/api/upload-process", formData);
      const compRes = await axios.get("http://127.0.0.1:8000/api/composition");
      setCompData(compRes.data);
      const perfRes = await axios.get("http://127.0.0.1:8000/api/performance");
      const holdingsRes = await axios.get("http://127.0.0.1:8000/api/top-holdings");
      setTopHoldings(holdingsRes.data);
      setPerfData(perfRes.data);
      const changesRes = await axios.get("http://127.0.0.1:8000/api/holding-price-change");
      setPriceChanges(changesRes.data);
      setMessage("Update Complete!");
    } catch (error) {
      setMessage("Error processing files.");
      console.error("Upload error:", error);
    }
  };


  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#0c0c0c', color: 'white', overflow: 'hidden' }}>

      {/* CSV Upload + Buttons */}
      <aside style={{ width: '450px', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0 }}>
        <div style={{ padding: '30px', flexShrink: 0 }}>
          <div style={{ marginBottom: '30px', textAlign: 'center' }}>
            <img
              src="https://www.bmo.com/dist/images/logos/bmo-blue-on-transparent-en.svg"
              alt="BMO Logo"
              style={{
                width: '120px',
                height: 'auto',
                display: 'block',
                margin: '0 auto'
              }}
            />
            <p style={{
              color: '#888',
              fontSize: '10px',
              marginTop: '10px',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
            ETF Price Monitor
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Weight csv upload button*/}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{
                fontSize: '11px',
                color: weightsFile ? '#0079c1' : '#888',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>1. Portfolio Weights (CSV)</span>
                {weightsFile && <span>✓ SELECTED</span>}
              </label>
              <input
                type="file"
                onChange={(e) => setWeightsFile(e.target.files[0])}
                accept=".csv"
                style={{
                  fontSize: '12px',
                  color: '#ccc',
                  padding: '8px',
                  backgroundColor: '#080808',
                  borderRadius: '5px',
                  border: '1px dashed #333'
                }}
              />
            </div>

            {/* Price csv upload button*/}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{
                fontSize: '11px',
                color: pricesFile ? '#0079c1' : '#888',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>2. Historical Prices (CSV)</span>
                {pricesFile && <span>✓ SELECTED</span>}
              </label>
              <input
                type="file"
                onChange={(e) => setPricesFile(e.target.files[0])}
                accept=".csv"
                style={{
                  fontSize: '12px',
                  color: '#ccc',
                  padding: '8px',
                  backgroundColor: '#080808',
                  borderRadius: '5px',
                  border: '1px dashed #333'
                }}
              />
            </div>

            <button
              onClick={onUploadAndProcess}
              disabled={!weightsFile || !pricesFile} // both files uploaded to process
              style={{
                backgroundColor: (!weightsFile || !pricesFile) ? '#222' : '#0079c1',
                color: (!weightsFile || !pricesFile) ? '#555' : 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '5px',
                cursor: (!weightsFile || !pricesFile) ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                marginTop: '10px',
                transition: 'all 0.3s ease'
              }}
            >
              Calculate Dashboard
            </button>

            <p style={{ margin: 0, color: '#888', fontSize: '12px', textAlign: 'center' }}>{message}</p>
          </div>
        </div>

        {/* Data Table */}
        {compData.length > 0 && (
          <CompositionTable
            data={getSortedData()}
            onSort={requestSort}
            priceChanges={priceChanges}
            maxWeight={maxWeight}
          />
        )}
      </aside>

      {/* Dashboard content for timeseries plot and top 5 holdings chart*/}
      <main style={{ flex: 1, padding: '30px', overflow: 'hidden', backgroundColor: '#080808', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Time series plot */}
        <PerformanceLineChart
          perfData={perfData}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
        />

        {/* Top 5 Holdings, Vertical Bar  Chart */}
        <TopHoldingsChart data={topHoldings} />
      </main>
    </div>
  );
}

export default App;