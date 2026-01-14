import io
from fastapi.testclient import TestClient
from app.main import app 

client = TestClient(app)

def test_performance_endpoint():
    """
    Testing correct formatting for recharts, passing in proper required formatting
    """
    response = client.get("/api/performance")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    
    if len(data) > 0:
        first_item = data[0]
        assert "date" in first_item
        assert "value" in first_item
        assert isinstance(first_item["value"], (int, float))

def test_composition_endpoint():
    """
    Testing composition has the three headers required for the 3 column data table
    """
    response = client.get("/api/composition")
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) > 0
    assert "name" in data[0]
    assert "weight" in data[0]
    assert "latest_price" in data[0]

def test_top_holdings():
    """
    Testing that we recieve at least 5 holdings
    """
    response = client.get("/api/top-holdings")
    assert response.status_code == 200

    data = response.json()
    assert 0 < len(data) <= 5
    assert "holding_value" in data[0]
    assert "name" in data[0]


def test_upload_csv_sucess():
    weight_content = b"name,weight\nA,0.097\nB,0.1"
    prices_header = b"DATE,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z\n"
    prices_row = b"2026-01-01,45.00,52.10,30.45,15.20,120.40,88.15,62.30,10.45,95.20,44.10,32.40,67.80,12.50,55.30,89.10,41.20,23.50,77.40,65.20,9.50,110.30,48.60,33.20,19.40,82.10,54.30"
    prices_content = prices_header + prices_row
    files = {
            "weights_file": ("test_weight.csv", io.BytesIO(weight_content), "text/csv"),
            "prices_file": ("test_prices.csv", io.BytesIO(prices_content), "text/csv")
        }
    
    response = client.post("/api/upload-process", files=files)
    
    assert response.status_code == 200
    assert response.json()["message"] == "Files uploaded and processed successfully"

def test_upload_missing_files():
    files = {"file": ("test.txt", io.BytesIO(b"hello world"), "text/plain")}
    response = client.post("/api/upload-process", files=files)
    
    #Unprocessable Entity because we expect two CSV Files
    assert response.status_code == 422

def test_upload_wrong_file_type():
    files = {
        "weights_file": ("test.txt", io.BytesIO(b"hello"), "text/plain"),
        "prices_file": ("prices.csv", io.BytesIO(b"DATE,ticker\n2026,B"), "text/csv")
    }
    
    response = client.post("/api/upload-process", files=files)
    
    assert response.status_code == 400
    assert f"File 'test.txt' is not a CSV. Both files must be .csv format." in response.json()["detail"]