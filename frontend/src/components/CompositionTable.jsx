import React from 'react';

// Styling for DataTable
const headerStyle = { 
  padding: '12px 15px', 
  cursor: 'pointer', 
  userSelect: 'none', 
  color: '#888', 
  fontSize: '12px', 
  borderBottom: '1px solid #333' 
};

const cellStyle = { 
  padding: '12px 15px', 
  fontSize: '14px' 
};


const CompositionTable = ({ data, onSort, priceChanges, maxWeight }) => {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '0 30px 30px 30px', minHeight: 0 }}>
      <div style={{ border: '1px solid #333', borderRadius: '10px', backgroundColor: '#111', overflow: 'hidden' }}>
        
        <div style={{ padding: '15px', borderBottom: '1px solid #222', backgroundColor: '#111' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>ETF Composition of {data.length} holdings</h3>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#1a1a1a' }}>
            <tr style={{ textAlign: 'left' }}>
              <th onClick={() => onSort('name')} style={headerStyle}>Ticker</th>
              <th onClick={() => onSort('weight')} style={headerStyle}>Weight</th>
              <th onClick={() => onSort('latest_price')} style={headerStyle}>Price</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const changeData = priceChanges.find(c => c.name === item.name);
              const isUp = changeData?.increased;

              return (
                <tr key={index} style={{ borderBottom: '1px solid #222' }}>
                  <td style={cellStyle}>{item.name}</td>
                  
                  <td style={{ ...cellStyle, width: '200px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#222', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${(item.weight / maxWeight) * 100}%`, 
                          height: '100%', 
                          backgroundColor: '#3b82f6', 
                          borderRadius: '4px' 
                        }} />
                      </div>
                      <span style={{ fontSize: '12px', color: '#999' }}>
                        {(item.weight * 100).toFixed(2)}%
                      </span>
                    </div>
                  </td>

                  <td style={{
                    ...cellStyle,
                    color: isUp ? '#00c805' : '#ff4d4d',
                    transition: 'color 0.3s ease'
                  }}>
                    ${item.latest_price.toFixed(2)}
                    <span style={{ fontSize: '10px', marginLeft: '6px' }}>
                      {isUp ? '▲' : '▼'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default CompositionTable;