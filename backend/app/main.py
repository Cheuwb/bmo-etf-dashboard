import io
import os
import shutil
from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "data"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# upload CSV to a data directory with overwrite
# TODO: allow multipel CSV, header detection + naming -> allow uploaded CSVs to be re-used
def get_processed_data():
    """
    Upload and overwrite the latest files in the data directory (upload directory)
    After uploading, create the relevant data frames as prices and weights data frames for further processing
    By other functions

    Returns:
        Prices data frame is the collection of ticker price per date
        Weights data frame is ticker symbol: and weight allocation relative to it's ETF
    """
    weights_path = os.path.join(UPLOAD_DIR, 'weights.csv')
    prices_path = os.path.join(UPLOAD_DIR, 'prices.csv')
    
    if not os.path.exists(weights_path) or not os.path.exists(prices_path):
        return None, None

    weights_df = pd.read_csv(weights_path)
    prices_df = pd.read_csv(prices_path)

    prices_df['DATE'] = pd.to_datetime(prices_df['DATE'])
    prices_df = prices_df.sort_values('DATE')

    weight_map = dict(zip(weights_df['name'], weights_df['weight']))
    relevant_tickers = weights_df['name'].tolist()

    prices_df['ETF_VALUE'] = 0
    for ticker in relevant_tickers:
        if ticker in prices_df.columns:
            prices_df['ETF_VALUE'] += prices_df[ticker] * weight_map[ticker]

    return prices_df.round(3), weights_df.round(3)

def calculate_performance_dict(prices_df):
    """
    Calculate chart data as date by ETF value for TimeSeriesPlot / PerformanceLinerChart

    Returns: 
        list of dictionary objects using date, value as k-v pairs
    """
    chart_data = prices_df[['DATE', 'ETF_VALUE']].copy()
    chart_data['date'] = chart_data['DATE'].dt.strftime('%Y-%m-%d')
    chart_data = chart_data.rename(columns={'ETF_VALUE': 'value'}).round(3)
    return chart_data[['date', 'value']].to_dict(orient='records')

# --- ENDPOINTS ---

@app.post("/api/upload-process")
async def upload_and_process(
    weights_file: UploadFile = File(...), 
    prices_file: UploadFile = File(...)
):
    """
    Renames the uploaded files to a standard name so that it can be re-used / processed by other FastApi end points
    Choosing to use weights.csv for ETF weighting csv files, and prices.csv for ticker + date price related csv file.

    Returns:
        Void - stores the uploaded files in the data directory path
    """
    #Light sanitation against bad files
    for file in [weights_file, prices_file]:
            if not file.filename.lower().endswith(".csv"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File '{file.filename}' is not a CSV. Both files must be .csv format."
                )

    for file, target in [(weights_file, "weights.csv"), (prices_file, "prices.csv")]:
        file_location = os.path.join(UPLOAD_DIR, target)
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    
    return {"message": "Files uploaded and processed successfully"}

@app.get("/api/performance")
def get_performance():
    """
    Takes the performance of the line-chart (time series plot) and calculates the price of ETF

    Returns:
        Price of ETF by date
    
    See:
        calculate_performance_dict(prices_df)
    """
    prices, _ = get_processed_data()
    if prices is None: return []
    return calculate_performance_dict(prices)

@app.get("/api/composition")
def get_composition():
    """
    Takes the data frames and transform into a list of dictionaries.

    Returns:
        A list of dictionary objects with key-value pairs such as:
        [
            {"name" : "A"},
            {"weight" : 0.05},
            {"latest_price" 20.05}
            ]
    """
    prices, weights = get_processed_data()
    if prices is None: return []
    
    latest_prices_row = prices.iloc[-1]
    composition = weights.to_dict(orient='records')
    
    for item in composition:
        ticker = item['name']
        price = round(float(latest_prices_row.get(ticker, 0)), 3)
        item['latest_price'] = price
        
    return composition

@app.get("/api/holding-price-change")
def get_holding_price_change():
    """
    Calculates the price differece between the current latest price and the previous date's price

    Returns:
        A list of dictionary objects with keys:
            increased: boolean
            change_amount: int
    """
    prices, weights = get_processed_data()
    if prices is None or weights is None: return []

    # Get the two most recent rows of prices
    latest_row = prices.iloc[-1]
    prev_row = prices.iloc[-2]

    # Convert weights to a list of dicts (just like top-holdings)
    data = weights.to_dict(orient='records')

    for item in data:
        ticker = item['name']
        
        # Get prices for this specific ticker from the price rows
        current = latest_row.get(ticker, 0)
        previous = prev_row.get(ticker, 0)
        
        # Add your boolean logic directly to the dictionary
        item['increased'] = bool(current >= previous)
        item['change_amount'] = round(current - previous, 3)

    # Return the whole list (FastAPI turns this List of Dicts into JSON)
    return data

@app.get("/api/top-holdings")
def get_top_holdings():
    """
    Endpoint to only return the top-5 holdings by largest weight*price.

    Returns:
    Top 5 list of [
        name: string,
        weight: float,
        holding_value: float
        ]
    """
    prices, weights = get_processed_data()
    if prices is None: return []
    
    latest_prices_row = prices.iloc[-1]
    data = weights.to_dict(orient='records')
    
    for item in data:
        ticker = item['name']
        price = latest_prices_row.get(ticker, 0)
        item['holding_value'] = round(item['weight'] * price, 3)
    
    sorted_data = sorted(data, key=lambda x: x.get('holding_value', 0), reverse=True)
    return sorted_data[:5]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)