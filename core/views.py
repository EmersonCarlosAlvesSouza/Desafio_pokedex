# Create your views here.
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import PokemonUsuario
from .pokeapi import get_pokemon_detail

from django.http import Http404
from rest_framework.generics import GenericAPIView

from urllib.parse import unquote



class PingView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"status": "ok", "message": "pokedex api up"})



class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
        })





TEAM_LIMIT = 6

def pack_detail(pid: int, user):
    d = get_pokemon_detail(pid)
    flags = PokemonUsuario.objects.filter(usuario=user, id_pokemon=pid).first()
    return {
        "id": d["id"],
        "name": d["name"],
        "sprite": (d.get("sprites") or {}).get("front_default"),
        "types": [t["type"]["name"] for t in d.get("types", [])],
        "stats": {s["stat"]["name"]: s["base_stat"] for s in d.get("stats", [])},
        "favorito": bool(flags and flags.favorito),
        "em_grupo": bool(flags and flags.em_grupo),
    }

class ToggleFavoriteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pid: int):
        pu, _ = PokemonUsuario.objects.get_or_create(
            usuario=request.user, id_pokemon=pid
        )
        pu.favorito = not pu.favorito
        pu.save()
        return Response({"id_pokemon": pid, "favorito": pu.favorito})

class TeamAddView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pid: int):
        count_team = PokemonUsuario.objects.filter(
            usuario=request.user, em_grupo=True
        ).count()
        if count_team >= TEAM_LIMIT:
            return Response(
                {"detail": "A equipe já tem 6 Pokémon."},
                status=status.HTTP_400_BAD_REQUEST
            )
        pu, _ = PokemonUsuario.objects.get_or_create(
            usuario=request.user, id_pokemon=pid
        )
        pu.em_grupo = True
        pu.save()
        return Response({"id_pokemon": pid, "em_grupo": True})

class TeamRemoveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pid: int):
        PokemonUsuario.objects.filter(
            usuario=request.user, id_pokemon=pid
        ).update(em_grupo=False)
        return Response({"id_pokemon": pid, "em_grupo": False})

class ListFavoritesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pids = list(
            PokemonUsuario.objects.filter(usuario=request.user, favorito=True)
            .values_list("id_pokemon", flat=True)
        )
        detailed = [pack_detail(pid, request.user) for pid in pids]
        return Response(detailed)

class ListTeamView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pids = list(
            PokemonUsuario.objects.filter(usuario=request.user, em_grupo=True)
            .values_list("id_pokemon", flat=True)
        )
        detailed = [pack_detail(pid, request.user) for pid in pids]
        return Response(detailed)


GEN_RANGES = {
    1: (1, 151),
    2: (152, 251),
    3: (252, 386),
    4: (387, 493),
    5: (494, 649),
    6: (650, 721),
    7: (722, 809),
    8: (810, 898),
    9: (899, 1010),
}

class PokemonListView(GenericAPIView):
    """
    GET /api/pokemon?search=<texto>&generation=<n>&page=<p>&page_size=<k>
    - search: filtra por nome (contém), ex.: 'char'
    - generation: 1..9 (aplica faixa de IDs)
    - paginação simples baseada em ID
    """
    permission_classes = [AllowAny]  # pode deixar aberto para testes; depois protegemos se quiser

    def get(self, request):
        try:
            page = int(request.GET.get("page", 1))
            page_size = min(max(int(request.GET.get("page_size", 12)), 1), 50)
        except ValueError:
            page, page_size = 1, 12

        search = (request.GET.get("search") or "").strip().lower()
        generation = request.GET.get("generation")

        # base de IDs a percorrer (limitado para não estourar)
        start_id, end_id = 1, 200  # default de segurança
        if generation:
            try:
                g = int(generation)
                if g in GEN_RANGES:
                    start_id, end_id = GEN_RANGES[g]
            except ValueError:
                pass

        # lista candidata de IDs
        ids = list(range(start_id, end_id + 1))

        # filtro por nome (busca contém) — precisamos consultar para saber o nome
        results = []
        for pid in ids:
            d = get_pokemon_detail(pid)
            name = d.get("name", "").lower()
            if search and search not in name:
                continue

            flags = PokemonUsuario.objects.filter(usuario=request.user.id if request.user.is_authenticated else None,
                                                  id_pokemon=pid).first()
            results.append({
                "id": d["id"],
                "name": d["name"],
                "sprite": (d.get("sprites") or {}).get("front_default"),
                "types": [t["type"]["name"] for t in d.get("types", [])],
                "stats": {s["stat"]["name"]: s["base_stat"] for s in d.get("stats", [])},
                "favorito": bool(flags and flags.favorito),
                "em_grupo": bool(flags and flags.em_grupo),
            })

        # paginação
        total = len(results)
        start = (page - 1) * page_size
        end = start + page_size
        page_items = results[start:end]

        return Response({
            "count": total,
            "page": page,
            "page_size": page_size,
            "results": page_items,
        })