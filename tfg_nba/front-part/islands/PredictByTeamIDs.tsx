import { useEffect, useState } from "preact/hooks";

type Team = {
  id: number;
  name: string;
};

export default function PredictByTeamIDs() {
  const [equipos, setEquipos] = useState<Team[]>([]);
  const [local, setLocal] = useState<number | null>(null);
  const [visitante, setVisitante] = useState<number | null>(null);
  const [probabilidad, setProbabilidad] = useState<number | null>(null);
  const [Loading, setLoading] = useState(false); // Nuevo estado

  useEffect(() => {
    fetch("/api/equipos")
      .then((res) => res.json())
      .then((data: Team[]) => {
        setEquipos(data);
      })
  }, []);

  const handle = async (e: Event) => {
    e.preventDefault();

    if (local === null || visitante === null) {
      alert("Selecciona ambos equipos.");
      return;
    }

    if (local === visitante) {
      alert("Los equipos no pueden ser iguales.");
      return;
    }

    setLoading(true);
    setProbabilidad(null);

    const res = await fetch("/api/predecir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        equipo1_id: local,
        equipo2_id: visitante,
      }),
    });

    const data = await res.json();
    console.log("Respuesta del servidor:", data);
    setProbabilidad(data.probabilidad_victoria_local);
    setLoading(false);

  };

  return (
    <div class="prediction-container">
      <h1 class="prediction-title">🏀 Predicción de Partido NBA</h1>
      <form onSubmit={handle} class="prediction-form">
        <div class="prediction-form-group">
          <label class="prediction-title">🏠 Equipo Local</label>
          <select
            class="prediction-select"
            value={local ?? ""}
            onChange={(e) => setLocal(Number(e.currentTarget.value))}
            disabled={Loading}
          >
            <option value="" disabled>Selecciona equipo local</option>
            {equipos.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div class="prediction-form-group">
          <label class="prediction-title">✈️ Equipo Visitante</label>
          <select
            class="prediction-select"
            value={visitante ?? ""}
            onChange={(e) => setVisitante(Number(e.currentTarget.value))}
            disabled={Loading}
          >
            <option value="" disabled>Selecciona equipo visitante</option>
            {equipos.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" class="prediction-submit" disabled={Loading} >
          {Loading ? "⏳ Procesando..." : "🔮 Predecir resultado"}
        </button>
      </form>

      {probabilidad !== null && !Loading && (
        <div class="prediction-result">
          <p class="form-title">
            🏆 Probabilidad de victoria del equipo local:
          </p>
          <span class="prediction-percentage">
            {probabilidad?.toFixed(2) ?? 'N/A'}%
          </span>
        </div>
      )}
    </div>
  );
}
