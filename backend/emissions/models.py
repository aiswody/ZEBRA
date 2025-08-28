from django.db import models
from buildings.models import Building

class EmissionAgg(models.Model):
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name='emission_aggs')
    year = models.IntegerField()

    scope1_solid_kg = models.DecimalField(max_digits=18, decimal_places=6, default=0)
    scope1_liquid_kg = models.DecimalField(max_digits=18, decimal_places=6, default=0)
    scope1_gas_kg = models.DecimalField(max_digits=18, decimal_places=6, default=0)
    scope1_total_kg = models.DecimalField(max_digits=18, decimal_places=6, default=0)

    scope2_elec_kg = models.DecimalField(max_digits=18, decimal_places=6, default=0)

    total_kg = models.DecimalField(max_digits=18, decimal_places=6, default=0)

    area_m2 = models.DecimalField(max_digits=18, decimal_places=6, default=0)

    i_solid = models.DecimalField(max_digits=18, decimal_places=6, default=0) #면적당 배출량
    i_liquid = models.DecimalField(max_digits=18, decimal_places=6, default=0)
    i_gas = models.DecimalField(max_digits=18, decimal_places=6, default=0)
    i_elec = models.DecimalField(max_digits=18, decimal_places=6, default=0)
    i_total = models.DecimalField(max_digits=18, decimal_places=6, default=0)

    computed_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('building', 'year')
