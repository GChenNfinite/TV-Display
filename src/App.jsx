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

// 👉 Plugin for center text
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

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return time.toLocaleTimeString();
}

function App() {
  const requestIdRef = useRef(0);
  const [values, setValues] = useState([0, 0, 0, 0]);

  const [weather, setWeather] = useState({ temp: "--", humidity: "--", city: "Loading..."})

  // 1. Function to fetch weather from the Internet
  const fetchWeather = async () => {
    const API_KEY = import.meta.env.VITE_WEATHER_KEY; // 👈 Put your key here
    const CITY = 'Waterloo,CA'; // 👈 Change to your city
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&units=metric&appid=${API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.main) {
        setWeather({
          temp: Math.round(data.main.temp),
          humidity: data.main.humidity,
          city: data.name
        });
      }
    } catch (error) {
      console.error("Weather fetch failed:", error);
    }
  };

  const fetchData = () => {
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

  useEffect(() => {
    fetchData(); //Tank data
    fetchWeather(); //Initial weather fetch

    const tankInterval = setInterval(fetchData, 10000);

    const weatherInterval = setInterval(fetchWeather, 600000);

    return () => {
      clearInterval(tankInterval);
      clearInterval(weatherInterval);
    };
  }, []);

  const labels = ["Tank 1", "Tank 2", "Tank 3", "Tank 4"];

  const colors = ["#4CAF50", "#F44336", "#2196F3", "#FFC107"];

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
      <div style={{ display: "flex", gap: 0, flexWrap: "nowrap", justifyContent: "center", marginBottom: 20 }}>
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
        padding: '5px', 
        background: '#ffffff', 
        color: 'white', 
        borderRadius: '15px',
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

        <div style={{ height: '60px', width: '2px', background: 'rgba(255,255,255,0.1)' }}></div>

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