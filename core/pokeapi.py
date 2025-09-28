import requests

POKE_BASE = "https://pokeapi.co/api/v2"

def get_pokemon_detail(id_or_name: str | int):
    r = requests.get(f"{POKE_BASE}/pokemon/{id_or_name}", timeout=15)
    r.raise_for_status()
    return r.json()
