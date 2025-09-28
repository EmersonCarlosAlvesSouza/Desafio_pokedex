from django.urls import path
from .views import (
    PingView, MeView,
    ToggleFavoriteView, TeamAddView, TeamRemoveView,
    ListFavoritesView, ListTeamView, PokemonListView
)

urlpatterns = [
    path("ping", PingView.as_view()),
    path("me", MeView.as_view()),

    path("pokemon", PokemonListView.as_view()),

    path("pokemon/<int:pid>/favorite", ToggleFavoriteView.as_view()),
    path("pokemon/<int:pid>/team/add", TeamAddView.as_view()),
    path("pokemon/<int:pid>/team/remove", TeamRemoveView.as_view()),

    path("favorites", ListFavoritesView.as_view()),
    path("team", ListTeamView.as_view()),
]
