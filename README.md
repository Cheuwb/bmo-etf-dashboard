<h2>Get started 📦 Project Setup Guide</h2>

🚀 Quick Start Prerequisites

    Python 3.8+ and Node.js 16+ installed


<h3>1. Clone the repository</h3>

```bash
git clone https://github.com/yourusername/project-name.git
cd project-name
```

<h3>2. Backend Setup (Python/FastAPI)</h3>

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload
```
<p>Backend running at: http://127.0.0.1:8000</p>

<h3>3. Frontend Setup (React/Vite)</h3>
<p>In a second terminal</p>

```bash
# Navigate to frontend (from project root)
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
Frontend running at: http://localhost:5173/


<h2>Troubleshooting 🔧 </h2>
<h3>Virtual Environment Issues (Windows)</h3>

<p>Make sure you have execution policy for windows</p>

```bash
# If scripts are disabled:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

<h3>Running Functional Unit Tests</h3>
CD into backkend directory of the project and run the command:

```bash
pytest
```

<h2>
Usage 📝 APPENDIX A.
<br>
API End Points
</h2>
<table>
    <tr><th width="220rem">Header</th><th>Description</th></tr>
<tr></tr>
    <tr><td valign="top"><pre>/api/upload-process</pre>
	<p>POST</p>
	</td>
    <td valign="top"><p>Upload two csv files to the backend for processing</p>
    <i>Curl Examples:</i><br>
    <br>

Curl:<br>
```BASH
curl -X POST "http://127.0.0.1:8000/api/upload-process" \
  -F "weights_file=@weights.csv" \
  -F "prices_file=@prices.csv"
```
<h2></h2>
Response: <br><br>

```httpx
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "Files uploaded and processed successfully"
}
```

</td></tr>
<tr></tr>
    <tr><td valign="top"><pre>/api/performance</pre>
      <p>GET</p>
    </td>
    <td valign="top">
    Request is used to get the performance of the ETF. The calculation is based on the weight and price of the underlying holdings.<br>
	<br>
    <i>Examples:</i>
<br><br>

<h2></h2>
Response: <br><br>

```httpx
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "date": "2017-01-01",
    "value": 60.819
  },
  {
    "date": "2017-01-02",
    "value": 60.799
  }
]
```

</td></tr>
<tr></tr>
    <tr><td valign="top"><pre>/api/composition</pre>
      <p>GET</p>
    </td>
    <td valign="top">
    Request is used to get the holdings of the ETF. Generates a table of the constituent, weights, and last price that make up the ETF.<br>
  <br>
    <i>Examples:</i>
<br><br>

<h2></h2>
Response: <br><br>

```httpx
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "name": "Z",
    "weight": 0.097,
    "latest_price": 53.699
  },
  {
    "name": "U",
    "weight": 0.155,
    "latest_price": 72.484
  }
]
```


</td></tr>
<tr></tr>
    <tr><td valign="top"><pre>/api/holding-price-change</pre>
      <p>GET</p>
    </td>
    <td valign="top">
    Request is used to get the current lastest price of each constituent in the ETF and compares it to the previous price. As a boolean, used to mark increase or decrease of value.<br>
  <br>
    <i>Examples:</i>
<br><br>

<h2></h2>
Response: <br><br>

```httpx
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "name": "Z",
    "weight": 0.097,
    "increased": true,
    "change_amount": 3.729
  },
  {
    "name": "U",
    "weight": 0.155,
    "increased": false,
    "change_amount": -2.056
  }
]
```


</td></tr>
<tr></tr>
    <tr><td valign="top"><pre>/api/top-holdings</pre>
      <p>GET</p>
    </td>
    <td valign="top">
    Request is used to get the top 5 holindgs of the ETF using the formula, weight * last price.<br>
  <br>
    <i>Examples:</i>
<br><br>

<h2></h2>
Response: <br><br>

```httpx
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "name": "U",
    "weight": 0.155,
    "holding_value": 11.235
  },
  {
    "name": "F",
    "weight": 0.146,
    "holding_value": 7.169
  },
  {
    "name": "W",
    "weight": 0.033,
    "holding_value": 6.311
  },
  {
    "name": "X",
    "weight": 0.122,
    "holding_value": 5.9
  },
  {
    "name": "Z",
    "weight": 0.097,
    "holding_value": 5.209
  }
]
```
</td></tr> </table>
<h2>Project Assumptions</h2>

- Time Series Plot "Zoom"
  - Zoomable time series plot zooming function can be used through buttons instead of scroll wheel
  - This is because there are not enough data points to make use of the zooming
  - Current known meta-data of the price is limited, zooming in on any particular day or time won't generate any additional information
 
- Data Table (Etf Composition):
  - Interactive table, can be interactions such as sorting by ascending / descending prices, ticker name
  - No sandbox edits to the data table - ready only fixed structure of the CSV data being read in
    - The user can make changes to the CSV using an editor and re-upload the file to see change comparisons
   
- Bar chart:
  - Vertical bar chart sorted by biggest holding weight

- CSV files and multiupload
	- It's assumed that there needs to be at least two files uploaded at the same time for the ETF Price Monitor to display data
      - This is because by having two paths of upload, it allows the user to mix and match different ETF weights on the same price data
        -  For example, you may have two ETFs with the same basket of constituents, however, the weight allocation within the ETF is different per constituent.
        -  This allows the user to compare performance of different weightings on the same historical price data, to compare performances different weight allocations.

- Future CSV upload featuers:
  - The user only requires ETF weight and ETF prices to generate their data, currently the web app can only handle these two files at a time, the user has no specified requirement to upload multiple ETF weighting to compare against the price
  - Although this can be an additional feature update to compare the performance of both ETFs
  - This assumption is made because currently, the data table which shows the composition of the ETF can only handle one ETF, if there are more than one ETF uploaded, the UI/UX will need to be updated to allow this kind of comparison feature.
  - Thus it is also assumed that when uploading a new ETF, all data on the previous ETF will be replaced with the new ETF.
  - Only valid .CSV files with the proper headings and data will be uploaded through the front-end
  - Currently the only safeguard is making sure that a .csv file is uploaded, however have not coded any additional error handling on checking valid formatting of the CSV
  - Additionally, it's assumed that the user will know to upload the appropriate CSV pairs to generate the data they require for this ETF dashboard
    - This includes non-empty CSV files
   
- Single page:
  - No additional scrolling / scroll bar, fit as much UI/UX on a single page as possible
  - Can reload elements through buttons tabs if required for more space (I didn't use any for this project)
 
- Float Precision:
  - I rounded to 3 decimal places because that was the lowest precision given for historical prices. To match this, calculations were also rounded to 3 decimal places.	

<h2>Technology Choices</h2>
<h3>Backend: Python</h3>

- FastAPI: create the end points, bridge between backend and frontend
- Uvicorn: webserver to run the api end points
- Pandas: data processing and filtering using data frames

<p>I decided to use Python for the back-end because that is what the team uses at the BMO Capital Markets' Data Cognition Team. I took this opportunity to familirize and learn as much as possible through this project on what might be expected of me
if I were to be able to work for the team. In a job description look-up on google it mentions fastAPI, so that is what I decided to use alongside Python to develop the REST api end points. The backend is used to do the heavy-lifting, mostly making use of Pandas data frames to structure the data and to apply transoformations and math at the cost of latency (network round-trip). By using a backend with Python and Pnadas library can support much larger CSV files as well, incase a large CSV processing may lag or crash the browser if it was front-end only. In the future can may be use this to connect to a database as well.</p>
<p>The back end is designed to:</p>

- Process the CSV files
- Transform into JSON readable for the front-end to process into tables / charts / graphs

<h3>Frontend: Javascript</h3>

- React: create the UI and states
- Axios: create HTTP requests to Uvicorn web server
- Recharts: generate the graphs and charts given JSON format
- Vite: Code bundler to optimize run-time for web browser

<p>Using a standard front-end development framework. Used React because I have used it a bit in the past, next time I would like to try Vue. I decided to use Recharts because it was the first library recommendation to implement charts on React, and it the JSON date value formatting worked with it.</p>

<h2>UI/UX Design Choices</h2>

- Data table:

  At first the data table was just Ticker symbol and numbers (Weight, Latest Price), but I added additional UI elements to allow it to give more information / allow human processing of the information.
  - I added a relative weighted bar to have a clearer visualization on how the weighting may be, additional to just numbers (as it's harder to see at a glance).
  - Added additional information to the latest price, re-labelled as "latest price change". I thought this would be an additional benefit to the user to see the latest price, along with some visual information.
  - I didn't add a % change because of the ETF context, to avoid information overload only price up or down on the ticker is included, this is because the ETF price is dependent on both the weight and latest price, so it may be irrelevant to have a % chance on each ticker symbol, (i.e high % gain on a ticker, but the weighting is low). Most of the cummulative ticker weight * price change information can be seen on Time Series Plot.

- Time Series Plot:
  - I didn't use a mouse wheel zoom as there was not enough data, or relevant data to process by zooming in very close to each individual point. The time series data is very spread out, so a zoom using buttons seemed more appropriate. If the time series data was more refined like hourly, or minute by minute data, then a more granular zoom may be required via mouse wheel scrolling so the user can choose the granularity of data being processed.
 
- Bar Chart Top 5 Holdings:
  - Not much design choice here, I thought that because I am using a horizontal weighted bar on the data table, it may look nicer to have a vertical bar chart instead for variety. The Top 5 holdings is sorted by weight, and there is no additional sorting to be applied.
    I intended this to be just a statc view and go chart for a quick glance on what is the top 5 holdings in comparison to the current performance of the ETF on time series chart. Thus I decided to place it under the time-series chart for visual closeness.

- Upload buttons:
  - Future design consideration drop-down menu or some kind of menu-viewer to see which CSVs are already uploaded.
    - no need to re-upload the same CSVs each time
    - quicker access to all uploaded weight and prices CSVs for comparison
    - Important if the price-data csv is very rich and large file.
  - By having two upload buttons it was faster to proto-type the web application given the assumption that only 1 of each CSV is required for the web application to run.
  - Upload buttons to denote / label on which button uploads which CSV.
  - The update complete is static if both CSVs are uploaded without issue, in the future could probably make it a more dynamic state by removing this text once data is populated.
