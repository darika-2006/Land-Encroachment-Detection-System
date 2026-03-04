import geopandas as gpd
from shapely.geometry import Point
import os

# Load GeoJSON - resolve path relative to this file's location
_BASE = os.path.dirname(os.path.abspath(__file__))
_GEOJSON_CANDIDATES = [
    os.path.join(_BASE, "..", "Land_Enroachement.geojson"),   # repo root
    os.path.join(_BASE, "Land_Enroachement.geojson"),         # same folder
    os.path.join(_BASE, "data", "Land_Enroachement.geojson"), # data subfolder
]

land_gdf = None
for _path in _GEOJSON_CANDIDATES:
    if os.path.exists(_path):
        land_gdf = gpd.read_file(_path)
        print(f"✅ WhatsApp bot loaded GeoJSON from: {os.path.abspath(_path)}")
        break

if land_gdf is None:
    print("⚠️ WARNING: Land_Enroachement.geojson not found — location lookups will fail.")

def get_land_by_location(lat, lon):
    if land_gdf is None:
        return None
    point = Point(float(lon), float(lat))  # IMPORTANT: lon, lat

    match = land_gdf[land_gdf.contains(point)]

    if not match.empty:
        row = match.iloc[0]
        centroid = row["geometry"].centroid
        return {
            "survey_no": row["survey_no"],
            "land_type": row["land_type"],
            "owner": row["owner"],
            "lat": centroid.y,
            "lon": centroid.x
        }

    return None


def get_land_by_survey(survey_no):
    if land_gdf is None:
        return None
    match = land_gdf[
        land_gdf["survey_no"].astype(str).str.lower() == str(survey_no).lower()
    ]

    if not match.empty:
        row = match.iloc[0]
        centroid = row["geometry"].centroid
        return {
            "survey_no": row["survey_no"],
            "land_type": row["land_type"],
            "owner": row["owner"],
            "lat": centroid.y,
            "lon": centroid.x
        }

    return None
