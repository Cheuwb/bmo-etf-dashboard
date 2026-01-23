import React, { memo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, LabelList
} from 'recharts';

const TopHoldingsChart = ({ data }) => {
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
      <h3 style={{ 
        margin: '0 0 15px 0', 
        fontSize: '14px', 
        color: '#888', 
        textTransform: 'uppercase', 
        letterSpacing: '1px', 
        flexShrink: 0 
      }}>
        Top 5 Holdings by Value
      </h3>
      
      <div style={{ flex: 1, width: '100%', minHeight: 0, position: 'relative' }}>
        {data.length > 0 ? (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#FFFFFF" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#FFFFFF" 
                  fontSize={13} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `$${val}`} 
                />
                <Tooltip
                  cursor={{ fill: '#1a1a1a' }}
                  contentStyle={{
                    backgroundColor: '#111',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#3b82f6', paddingTop: '4px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}
                  formatter={(val) => [`$${val.toFixed(3)}`, 'Value']}
                />
                <Bar dataKey="holding_value" radius={[4, 4, 0, 0]} barSize={40}>
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={'#3b82f6'} 
                    />
                  ))}
                  <LabelList 
                    dataKey="holding_value" 
                    position="top" 
                    formatter={(val) => `$${val.toFixed(2)}`} 
                    style={{ fill: '#FFFFFF', fontSize: '13px' }} 
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
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

export default memo(TopHoldingsChart);