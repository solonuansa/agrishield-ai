"""Unit test untuk alert clustering logic."""

import pytest

from app.services.alert_service import (
    _dedup_points,
    _find_clusters,
    _haversine_km,
    _severity_from_count,
)


class TestHaversineKm:
    """Formula Haversine — jarak antar dua titik koordinat."""

    def test_same_point(self):
        """Titik yang sama harus punya jarak 0."""
        assert _haversine_km(-6.2, 106.8, -6.2, 106.8) == 0.0

    def test_jakarta_bandung(self):
        """Jarak Jakarta - Bandung sekitar 115 km."""
        dist = _haversine_km(-6.2146, 106.8451, -6.9039, 107.6187)
        assert 110 < dist < 130  # toleransi cukup lebar

    def test_nearby_points(self):
        """Dua titik berdekatan (< 1 km)."""
        dist = _haversine_km(-6.2, 106.8, -6.205, 106.805)
        assert dist < 1.0


class TestSeverityFromCount:
    """Tingkat keparahan berdasarkan jumlah kasus."""

    def test_low(self):
        assert _severity_from_count(1) == "low"
        assert _severity_from_count(3) == "low"
        assert _severity_from_count(4) == "low"

    def test_medium(self):
        assert _severity_from_count(5) == "medium"
        assert _severity_from_count(7) == "medium"
        assert _severity_from_count(9) == "medium"

    def test_high(self):
        assert _severity_from_count(10) == "high"
        assert _severity_from_count(15) == "high"
        assert _severity_from_count(100) == "high"

    def test_boundary_values(self):
        assert _severity_from_count(4) == "low"  # batas bawah medium
        assert _severity_from_count(5) == "medium"  # batas atas low
        assert _severity_from_count(9) == "medium"  # batas bawah high
        assert _severity_from_count(10) == "high"  # batas atas medium


class TestDedupPoints:
    """Deduplikasi titik koordinat yang sama."""

    def test_no_dup(self):
        points = [(-6.2, 106.8, "Jakarta"), (-6.9, 107.6, "Bandung")]
        result = _dedup_points(points)
        assert len(result) == 2

    def test_duplicates_removed(self):
        points = [
            (-6.2146, 106.8451, "Jakarta"),
            (-6.2146, 106.8451, "Jakarta"),
            (-6.2147, 106.8452, "Jakarta"),  # rounding 3 desimal: sama
        ]
        result = _dedup_points(points)
        assert len(result) == 1  # semua dianggap sama setelah rounding

    def test_nearby_but_different(self):
        points = [
            (-6.214, 106.845, "Jakarta"),
            (-6.215, 106.846, "Jakarta"),  # desimal ke-3 berbeda
        ]
        result = _dedup_points(points)
        assert len(result) == 2


class TestFindClusters:
    """Clustering greedy — titik-titik dalam radius CLUSTER_RADIUS_KM."""

    def test_empty_points(self):
        assert _find_clusters([]) == []

    def test_single_point(self):
        points = [(-6.2, 106.8, "Jakarta")]
        clusters = _find_clusters(points)
        assert len(clusters) == 1
        assert len(clusters[0]) == 1

    def test_two_close_points(self):
        """Dua titik berjarak ~0.6 km -> satu kluster."""
        points = [(-6.2, 106.8, "A"), (-6.205, 106.805, "B")]
        clusters = _find_clusters(points)
        assert len(clusters) == 1
        assert len(clusters[0]) == 2

    def test_two_far_points(self):
        """Jakarta - Surabaya (~650 km) -> dua kluster terpisah."""
        points = [(-6.2, 106.8, "Jakarta"), (-7.25, 112.75, "Surabaya")]
        clusters = _find_clusters(points)
        assert len(clusters) == 2
        assert len(clusters[0]) == 1
        assert len(clusters[1]) == 1

    def test_three_points_in_one_cluster(self):
        """Tiga titik berdekatan -> satu kluster."""
        points = [
            (-6.2, 106.8, "A"),
            (-6.21, 106.81, "B"),
            (-6.22, 106.82, "C"),
        ]
        clusters = _find_clusters(points)
        assert len(clusters) == 1
        assert len(clusters[0]) == 3
