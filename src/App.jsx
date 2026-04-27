import { useEffect, useState } from "react";
import Papa from "papaparse";
import { useRef } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

// 👉 Plugin for centering text
const centerTextPlugin = {
  id: "centerText",
  beforeDraw(chart) {
    const { ctx, width, height } = chart;

    const meta = chart.data.datasets[0];
    const value = meta?.centerValue;

    const safeValue =
      typeof value === "number" && !isNaN(value) ? value : 0;

    ctx.save();
    ctx.font = "bold 48px Arial";
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
      `${(safeValue * 100).toFixed(0)}%`,
      width / 2,
      height / 2
    );

    ctx.restore();
  },
};

ChartJS.register(centerTextPlugin);

function Clock() { //Running clock to get the current time
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return time.toLocaleTimeString();
}

function App() { bulk code for webpage
  const requestIdRef = useRef(0);
  //sets the initial values
  const [values, setValues] = useState([0, 0, 0, 0]);
  const [weather, setWeather] = useState({ temp: "--", humidity: "--", city: "Loading...", iconUrl: ""})

  // Fetch weather from the Internet
  const fetchWeather = async () => {
    const API_KEY = import.meta.env.VITE_WEATHER_KEY; // 👈 Put your key here
    const CITY = 'Waterloo,CA'; // 👈 Change to your city
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&units=metric&appid=${API_KEY}`; //uses open weather map

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.main && data.weather) {
        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`; //fetching icons

        setWeather({
          temp: Math.round(data.main.temp),
          humidity: data.main.humidity,
          city: data.name,
          iconUrl: iconUrl
        });
      }
    } catch (error) {
      console.error("Weather fetch failed:", error);
    }
  };

  const fetchData = () => { //fetching data from the google sheets for N2 tank values
    const currentRequestId = ++requestIdRef.current; 
    const url =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vSN5qPhWup61lFgFwM89RmJKmCK_cE3dpoIWB0nrMAJ8m__DG9JHPsAkFDxlisDkYMxw1y4LjUkEzDt/pub?gid=0&single=true&output=csv"  +
    `&t=${Date.now()}`;



    Papa.parse(url, {
      download: true,
      complete: (result) => {
        if (currentRequestId !== requestIdRef.current) return;
        const rows = result.data;
        const percentageRow = rows[8];

        const tankValues = percentageRow
          .slice(2, 6)
          .map((v) => parseFloat(v));

        if (tankValues.every((v) => !isNaN(v))) {
          setValues(tankValues);
        }
      },
    });
  };

  useEffect(() => {  //sets interval for when we fetch tank and weather values
    fetchData(); //Tank data
    fetchWeather(); //Initial weather fetch

    const tankInterval = setInterval(fetchData, 10000);

    const weatherInterval = setInterval(fetchWeather, 600000);

    return () => {
      clearInterval(tankInterval);
      clearInterval(weatherInterval);
    };
  }, []);

  //labels & colors
  const labels = ["Tank 1", "Tank 2", "Tank 3", "Tank 4"];

  const colors = ["#4CAF50", "#F44336", "#2196F3", "#FFC107"];

  //creating UI
  return (
    <div style={{ marginTop: 20, fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      {/* TOP BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0 }}>Nitrogen Tank Status</h1>
        </div>
        <p style={{ margin: 0, color: '#666', fontWeight: 'bold', fontSize: '1.2rem' }}>
             📍 {weather.city}
        </p>
        <div style={{ padding: 20, fontSize: 72, fontWeight: "bold" }}>
          <Clock />
        </div>
      </div>

      {/* CHARTS */}
      <div style={{ display: "flex", gap: 0, flexWrap: "nowrap", justifyContent: "center", marginBottom: 0 }}>
        {values.map((val, i) => {
          const data = {
            labels: [labels[i], "Remaining"],
            datasets: [{
              data: [val, 1 - val],
              backgroundColor: [colors[i], "#e0e0e0"],
              borderWidth: 0,
              centerValue: val,
            }],
          };

          const options = {
            cutout: "75%",
            plugins: {
              legend: { display: false },
              tooltip: { enabled: true }
            },
          };

          return (
            <div key={i} style={{ flex: "1 1 0", minWidth: 0, textAlign: "center", background: 'white', padding: '15px' }}>
              <h3 style={{ marginTop: 0 }}>{labels[i]}</h3>
              <Doughnut data={data} options={options} />
            </div>
          );
        })}
      </div>

      {/* BOTTOM BAR: AMBIENT DATA FROM INTERNET */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-around", 
        padding: 10,
        marginTop: 0, 
        background: '#ffffff', 
        color: 'white', 
        alignItems: 'center'
      }}>

        <div style={{ textAlign: 'center' }}>
          {/* Using a <div> instead of <span> to avoid inherited text styles */}
          <div style={{ 
            textTransform: 'uppercase', 
            fontSize: '2rem', 
            letterSpacing: '2px', 
            color: '#000000' // Light gray
          }}>
            Outdoor Temp
          </div>

            {/* We override the global h2 color by using inline color here */}
            <h2 style={{ 
              fontSize: "3rem", 
              margin: "10px 0", 
              color: '#000000', // FORCE WHITE
              lineHeight: '1' 
            }}>
              {weather.temp}°C
            </h2>
        </div>

        {/* ICON WRAPPER */}
        {weather.iconUrl && (
          <div style={{
            background: '#9f9f9f',        // Slightly darker gray for better contrast
            borderRadius: '50%',
            width: '160px',               // Reduced size slightly to prevent over-stretching
            height: '160px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '4px solid #ffffff', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)', // Soft outer shadow instead of inset
            marginRight: '20px'
          }}>
            <img 
              src={weather.iconUrl} 
              alt="Weather Icon" 
              style={{ 
                width: '140px', 
                height: '140px',
                imageRendering: 'auto' // Set to auto if using @4x
              }} 
            />
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            textTransform: 'uppercase',
            fontSize: '2rem', 
            letterSpacing: '2px', 
            color: '#000000' 
          }}>
            Outdoor Humidity
          </div>
          <h2 style={{ 
            fontSize: "3rem", 
            margin: "10px 0", 
            color: '#000000', // FORCE WHITE
            lineHeight: '1'
          }}>
            {weather.humidity}%
          </h2>
        </div>
      </div>
    </div>
  );
}

export default App;
