import os
import json

# Ruta robusta al archivo JSON
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_FILE = os.path.join(BASE_DIR, "data.json")

def load_data(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)

def save_data(data, file_path):
    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=2, ensure_ascii=False)

def update_stats(old_stats, new_value):
    history = [old_stats["worst"], old_stats["average"], old_stats["best"], new_value]
    return {
        "worst": min(history),
        "average": sum(history) // len(history),
        "best": max(history)
    }

def main():
    data = load_data(JSON_FILE)
    player_id = input("ID del jugador a actualizar: ").strip()

    # Buscar jugador
    player = next((p for p in data["players"] if p["id"] == player_id), None)
    if not player:
        print("❌ Jugador no encontrado.")
        return

    print(f"\n✅ Actualizando stats para {player['name']}...")

    # Actualizar stats por categoría
    for category in ["military", "economy", "technology", "society"]:
        try:
            value = int(input(f"Nuevo valor para {category}: "))
            player["categoryStats"][category] = update_stats(player["categoryStats"][category], value)
        except ValueError:
            print("  ⚠️ Valor inválido, se omite esta categoría.")

    # Aumentar partidas jugadas
    player["matches"] += 1

    # Aumentar puntos
    try:
        earned_points = int(input("\nPuntos ganados en esta partida: "))
        player["points"] += earned_points
    except ValueError:
        print("⚠️ Valor inválido, no se suman puntos.")

    # ¿Ganó la partida?
    won = input("¿Ganó esta partida? (s/n): ").strip().lower()
    if won == "s":
        player["wins"] += 1

    save_data(data, JSON_FILE)
    print(f"\n✅ Estadísticas de '{player['name']}' actualizadas correctamente.")

if __name__ == "__main__":
    main()
