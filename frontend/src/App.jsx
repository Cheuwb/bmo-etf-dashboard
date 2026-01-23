import React, { useState, useEffect } from "react";
import axios from "axios";
import CompositionTable from "./components/CompositionTable";
import TopHoldingsChart from "./components/TopHoldingsChart";
import PerformanceLineChart from "./components/PerformanceLineChart";

function App() {
  const [weightsFile, setWeightsFile] = useState(null);
  const [pricesFile, setPricesFile] = useState(null);
  const [compData, setCompData] = useState([]);
  const [perfData, setPerfData] = useState([]);
  const [timeRange, setTimeRange] = useState("MAX");
  const [message, setMessage] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "weight",
    direction: "desc",
  });
  const [priceChanges, setPriceChanges] = useState([]);
  const [topHoldings, setTopHoldings] = useState([]);
  const [fullPriceHistory, setFullPriceHistory] = useState([]);
  const [hoverData, setHoverData] = useState(null);
  // dynamic N holdings bar chart
  const [topN, setTopN] = useState(5); // Default project requirement
  // Feature to change static top 5 holdings to N holdings based on slider
  const fetchTopHoldings = async (n) => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/top-holdings", {
        params: { n: n },
      });
      setTopHoldings(res.data);
    } catch (error) {
      console.error("Error fetching top holdings:", error);
    }
  };
  // Top Holdings is now handled with useEffect guarded by the loading of composition data from axios -> backend
  // Remove the end-point call here beacuse of race condition against useEffect;
  // Using a safety guard compData > 0 to control population of topHoldins bar chart.
  // Slider to trigger re-render on react, fetching new data via fetchTopHoldings end point method
  useEffect(() => {
    if (compData.length > 0) {
      fetchTopHoldings(topN);
    }
  }, [topN, compData.length]);

  // sorting logic for data table (asecnding and descending)
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // making sorted changes to the data
  const getSortedData = () => {
    let sortableData = [...compData];
    sortableData.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sortableData;
  };

  const getActivePrices = () => {
    if (!hoverData || fullPriceHistory.length === 0) return null;

    const found = fullPriceHistory.find((row) => row.date === hoverData.date);
    return found;
  };

  const activePrices = getActivePrices();

  useEffect(() => {
    if (compData.length === 0) return;
    const fetchDate = hoverData?.date || null;
    Promise.all([
    axios.get("http://127.0.0.1:8000/api/holding-price-change", {params: { date: fetchDate }}),
    axios.get("http://127.0.0.1:8000/api/top-holdings", {params: {n: topN, date: fetchDate }})
    ])
    .then(([priceChangesRes, topHoldingsRes]) => {
        setPriceChanges(priceChangesRes.data);
        setTopHoldings(topHoldingsRes.data);
    })
    .catch((err) => {
        console.error("Error updateing price changes:", err);
    });
  }, [hoverData?.date, topN, compData.length]);

  // Data-tabe max weight
  const maxWeight =
    compData.length > 0 ? Math.max(...compData.map((item) => item.weight)) : 0;

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
      const [compRes, perfRes, changeRes, priceHistRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/composition"),
        axios.get("http://127.0.0.1:8000/api/performance"),
        axios.get("http://127.0.0.1:8000/api/holding-price-change"),
        axios.get("http://127.0.0.1:8000/api/full-price-history"),
      ]);
      setCompData(compRes.data);
      setPerfData(perfRes.data);
      setPriceChanges(changeRes.data);
      setFullPriceHistory(priceHistRes.data);
      setMessage("Update Complete!");
    } catch (error) {
      setMessage("Error processing files.");
      console.error("Upload error:", error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#0c0c0c",
        color: "white",
        overflow: "hidden",
      }}
    >
      {/* CSV Upload + Buttons */}
      <aside
        style={{
          width: "450px",
          borderRight: "1px solid #222",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          flexShrink: 0,
        }}
      >
        <div style={{ padding: "30px", flexShrink: 0 }}>
          <div style={{ marginBottom: "30px", textAlign: "center" }}>
            <img
              src="https://www.bmo.com/dist/images/logos/bmo-blue-on-transparent-en.svg"
              alt="BMO Logo"
              style={{
                width: "120px",
                height: "auto",
                display: "block",
                margin: "0 auto",
              }}
            />
            <p
              style={{
                color: "#888",
                fontSize: "10px",
                marginTop: "10px",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              ETF Price Monitor
            </p>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Weight csv upload button*/}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{
                  fontSize: "11px",
                  color: weightsFile ? "#0079c1" : "#888",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>1. Portfolio Weights (CSV)</span>
                {weightsFile && <span>✓ SELECTED</span>}
              </label>
              <input
                type="file"
                onChange={(e) => setWeightsFile(e.target.files[0])}
                accept=".csv"
                style={{
                  fontSize: "12px",
                  color: "#ccc",
                  padding: "8px",
                  backgroundColor: "#080808",
                  borderRadius: "5px",
                  border: "1px dashed #333",
                }}
              />
            </div>

            {/* Price csv upload button*/}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{
                  fontSize: "11px",
                  color: pricesFile ? "#0079c1" : "#888",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>2. Historical Prices (CSV)</span>
                {pricesFile && <span>✓ SELECTED</span>}
              </label>
              <input
                type="file"
                onChange={(e) => setPricesFile(e.target.files[0])}
                accept=".csv"
                style={{
                  fontSize: "12px",
                  color: "#ccc",
                  padding: "8px",
                  backgroundColor: "#080808",
                  borderRadius: "5px",
                  border: "1px dashed #333",
                }}
              />
            </div>

            <button
              onClick={onUploadAndProcess}
              disabled={!weightsFile || !pricesFile} // both files uploaded to process
              style={{
                backgroundColor:
                  !weightsFile || !pricesFile ? "#222" : "#0079c1",
                color: !weightsFile || !pricesFile ? "#555" : "white",
                border: "none",
                padding: "12px",
                borderRadius: "5px",
                cursor: !weightsFile || !pricesFile ? "not-allowed" : "pointer",
                fontWeight: "bold",
                marginTop: "10px",
                transition: "all 0.3s ease",
              }}
            >
              Calculate Dashboard
            </button>

            <p
              style={{
                margin: 0,
                color: "#888",
                fontSize: "12px",
                textAlign: "center",
              }}
            >
              {message}
            </p>
          </div>
        </div>

        {/* Data Table */}
        {compData.length > 0 && (
          <CompositionTable
            data={getSortedData()}
            onSort={requestSort}
            priceChanges={priceChanges}
            maxWeight={maxWeight}
            activePrices={activePrices}
          />
        )}
      </aside>

      {/* Dashboard content for timeseries plot and top N holdings chart*/}
      <main
        style={{
          flex: 1,
          padding: "30px",
          overflow: "hidden",
          backgroundColor: "#080808",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Time series plot */}
        <PerformanceLineChart
          perfData={perfData}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          onMouseMove={(e) => {
            if (e && e.activeLabel) {
              setHoverData({ date: e.activeLabel });
            }
          }}
          onMouseLeave={() => setHoverData(null)}
        />

        {/* Top N Holdings, Vertical Bar  Chart */}
        <div
          style={{
            display: "flex",
            alignItems: "center", //Added: Aligns the topN text with the slider
            gap: "15px",
            color: "white",
          }}
        >
          <label style={{ marginRight: "10px", fontSize: "14px" }}>
            Show Top: <strong>{topN}</strong>
          </label>
          <input
            type="range"
            min="1"
            max={Math.min(compData.length, 20)} //Limiting to top 20 etfs as it may get too crowded, ETF2 only has 20 anyways, used as standard
            value={topN}
            onChange={(e) => setTopN(parseInt(e.target.value))}
            style={{ cursor: "pointer", accentColor: "#3b82f6" }}
          />
        </div>
        <TopHoldingsChart data={topHoldings} />
      </main>
    </div>
  );
}

export default App;
