import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const PerformanceLineChart = ({ perfData, timeRange, setTimeRange }) => {
  
   // time series filtering -> time-periods (button zooms)
  const filteredData = useMemo(() => {
    if (!perfData || perfData.length === 0) return [];
    if (timeRange === 'MAX') return perfData;

    const timestamps = perfData.map(d => new Date(d.date).getTime());
    const latestDateTimestamp = Math.max(...timestamps);
    const anchorDate = new Date(latestDateTimestamp);
    let startDate = new Date(anchorDate);

    switch (timeRange) {
      case '1D': startDate.setDate(anchorDate.getDate() - 1); break;
      case '1W': startDate.setDate(anchorDate.getDate() - 7); break;
      case '1M': startDate.setMonth(anchorDate.getMonth() - 1); break;
      case '3M': startDate.setMonth(anchorDate.getMonth() - 3); break;
      case '6M': startDate.setMonth(anchorDate.getMonth() - 6); break;
      case '1Y': startDate.setFullYear(anchorDate.getFullYear() - 1); break;
      case 'YTD': startDate = new Date(anchorDate.getFullYear(), 0, 1); break;
      default: return perfData;
    }
    return perfData.filter(item => new Date(item.date) >= startDate);
  }, [perfData, timeRange]);

  return (
    <div style={{ 
      flex: 1, 
      border: '1px solid #222', 
      backgroundColor: '#111', 
      borderRadius: '15px', 
      padding: '20px', 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: 0 
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '15px', 
        flexShrink: 0 
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: '14px', 
          color: '#888', 
          textTransform: 'uppercase', 
          letterSpacing: '1px' 
        }}>
          Portfolio Performance
        </h3>
        
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          backgroundColor: '#080808', 
          padding: '4px', 
          borderRadius: '8px' 
        }}>
          {['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', 'MAX'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                background: timeRange === range ? '#3b82f6' : 'transparent',
                color: timeRange === range ? 'white' : '#666',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
        {perfData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#444" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                minTickGap={40} 
              />
              <YAxis 
                stroke="#444" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `$${val.toFixed(0)}`} 
                domain={['auto', 'auto']} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#111', 
                  border: '1px solid #333', 
                  borderRadius: '8px', 
                  fontSize: '12px' 
                }} 
                itemStyle={{ color: '#3b82f6' }} 
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 4 }} 
                animationDuration={300} 
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ 
            display: 'flex', 
            height: '100%', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#333' 
          }}>
            Waiting for data...
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceLineChart;