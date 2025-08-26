# reports/serializers.py
from rest_framework import serializers

class ReportLiveSerializer(serializers.Serializer):
    meta = serializers.DictField()
    institution = serializers.DictField()
    buildings = serializers.ListField()
    emissions = serializers.DictField()
