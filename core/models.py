from django.db import models
from django.conf import settings


class TipoPokemon(models.Model):
    id_tipo = models.IntegerField(primary_key=True)               # id da PokéAPI
    descricao = models.CharField(max_length=40)

    def __str__(self):
        return self.descricao

class PokemonUsuario(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='pokemon_usuario'
    )
    id_pokemon = models.IntegerField()                            # id/national dex
    favorito = models.BooleanField(default=False)
    em_grupo = models.BooleanField(default=False)                 # está na equipe?

    class Meta:
        unique_together = ('usuario', 'id_pokemon')               # evita duplicados

    def __str__(self):
        return f'{self.usuario} - #{self.id_pokemon}'