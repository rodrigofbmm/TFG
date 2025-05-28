import { useState } from "preact/hooks";

const stats = {
  teamScore: "Puntos promedio",
  assists: "Asistencias promedio",
  blocks: "Bloqueos promedio",
  steals: "Robos promedio",
  turnovers: "Pérdidas promedio",
  fieldGoalsPercentage: "Porcentaje de tiros de campo",
  threePointersPercentage: "Porcentaje de triples",
  freeThrowsPercentage: "Porcentaje de tiros libres",
  reboundsTotal: "Rebotes totales",
  plusMinusPoints: "Plus/Minus puntos",
  MVP_points: "MVP puntos",
  MVP_assists: "MVP asistencias",
  MVP_rebounds: "MVP rebotes",
  MVP_fg: "MVP % tiros de campo",
};


const stat = Object.keys(stats);
const iniciales = Object.fromEntries(stat.map((stat) => [stat, ""]));

export default function PredictPage() {
  const [local, setLocal] = useState({ ...iniciales });
  const [visitante, setVisitante] = useState({ ...iniciales });
  const [probabilidad, setProbabilidad] = useState(null);

  const handleChange = (setter) => (field, value) => {
    setter((prev) => ({ ...prev, [field]: value }));
  };

  const buildTeamData = (team, isHome) => {
    const data = Object.fromEntries(
      stat.map((field) => [field, parseFloat(team[field])])
    );

    data.eficienciaOfensiva = data.teamScore / (data.turnovers + 1);
    data.impactoDefensa = data.steals + data.blocks;
    data.ratioAsistenciasTurnovers = data.assists / (data.turnovers + 1);
    data.eficienciaTiro = (data.fieldGoalsPercentage + 1.5 * data.threePointersPercentage) / 2;
    data.impactoMVP = 
      data.MVP_points * 1 + 
      data.MVP_assists * 0.7 + 
      data.MVP_rebounds * 0.5 + 
      10 * 0.3;

    data.isHome = isHome;

    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    const eq1Data = buildTeamData(local, 1);
    const eq2Data = buildTeamData(visitante, 0);

    const res = await fetch("http://localhost:8008/predecir-estadisticas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ equipo1: eq1Data, equipo2: eq2Data }),
    });

    const data = await res.json();
    setProbabilidad(data.probabilidad_victoria_local);
};

  const TeamForm = ({ team, setTeam, title }) => (
    <div class="form-box">
      <h2 class="prediction-title">{title}</h2>
      {stat.map((field) => (
        <div class="form-group">
          <label class="form-label">{stats[field]}</label>
          <input
            type="number"
            step="any"
            required
            placeholder={stats[field]}
            class="form-input"
            value={team[field]}
            onChange={(e) => handleChange(setTeam)(field, e.target.value)}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div class="container">
      <h1 class="title">¿Quién ganará?</h1>
      <form onSubmit={handleSubmit}>
        <div class="form">
          <TeamForm team={local} setTeam={setLocal} title="🏠 Equipo Local" />
          <TeamForm team={visitante} setTeam={setVisitante} title="🛫 Equipo Visitante" />
        </div>
        <div class="button-container">
          <button type="submit" class="submit-button">
            Predecir
          </button>
        </div>
      </form>

      {probabilidad !== null && !isNaN(probabilidad) && (
        <div class="result-box">
          <h3 class="result-title">Resultado de la Predicción</h3>
          <p class="result-text">
            Probabilidad de victoria del equipo <span class="highlight">local</span>:{" "}
            <span class="prediction-percentage">{probabilidad.toFixed(2)}%</span>
          </p>
        </div>
      )}
    </div>
  );
}
