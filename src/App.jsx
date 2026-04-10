import { useEffect, useState } from "react";
import Papa from "papaparse";
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
  const [values, setValues] = useState([0, 0, 0, 0]);

  const fetchData = () => {
    const url =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vSN5qPhWup61lFgFwM89RmJKmCK_cE3dpoIWB0nrMAJ8m__DG9JHPsAkFDxlisDkYMxw1y4LjUkEzDt/pub?gid=0&single=true&output=csv";

    Papa.parse(url, {
      download: true,
      complete: (result) => {
        const rows = result.data;
        const percentageRow = rows[8];

        const tankValues = percentageRow
          .slice(2, 6)
          .map((v) => parseFloat(v) || 0);

        setValues(tankValues);
      },
    });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const labels = ["Tank 1", "Tank 2", "Tank 3", "Tank 4"];

  const colors = ["#4CAF50", "#2196F3", "#FFC107", "#F44336"];

  return (
    <div style={{ padding: 20 }}>
      {/* TOP BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20}}>
        <h1>Nitrogen Tank Status</h1>

        <div style={{ fontSize: 72, fontWeight: "bold" }}>
          <Clock />
        </div>
      </div>

      <div style={{ display: "flex", gap: 20, flexWrap: "nowrap", justifyContent: "center"}}>
        {values.map((val, i) => {
          const data = {
            labels: [labels[i], "Remaining"],
            datasets: [
              {
                data: [val, 1 - val],
                backgroundColor: [colors[i], "#e0e0e0"],
                borderWidth: 0,
                centerValue: val,
              },
            ],
          };

          const options = {
            cutout: "75%",
            plugins: {
              tooltip: {
                callbacks: {
                  label: (ctx) => `${(ctx.raw * 100).toFixed(0)}%`,
                },
              },
              legend: {
                display: false,
              },
            },
          };

          return (
            <div key={i} style={{ width: 300, textAlign: "center" }}>
              <h3>{labels[i]}</h3>
              <Doughnut data={data} options={options} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;