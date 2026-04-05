import math

ROAD_POINTS = [
    # ── Silk Board → HSR Layout  (mostly SW-NE diagonal) ────
    (12.9168, 77.6230, "Silk Board", "Silk Board Junction"),
    (12.9180, 77.6215, "Silk Board", "Silk Board underpass entry"),
    (12.9140, 77.6252, "HSR Layout", "near AXA signal"),
    (12.9125, 77.6130, "HSR Layout", "27th Main"),
    (12.9120, 77.6175, "HSR Layout", "Sector 2"),
    (12.9105, 77.6200, "HSR Layout", "14th Main"),
    (12.9190, 77.6260, "HSR Layout", "Agara Lake junction"),

    # ── Outer Ring Road (Hebbal → Marathahalli arc) ─────
    (12.9980, 77.5950, "Hebbal", "Hebbal Flyover ramp"),
    (12.9850, 77.6050, "Nagavara", "Manyata underpass"),
    (12.9750, 77.6150, "Kasturi Nagar", "Kasturi Nagar junction"),
    (12.9650, 77.6400, "KR Puram", "Tin Factory signal"),
    (12.9570, 77.6600, "Mahadevapura", "Mahadevapura AECS Layout"),
    (12.9591, 77.6974, "Marathahalli", "Marathahalli Bridge"),
    (12.9540, 77.6800, "Marathahalli", "Kaikondrahalli"),
    (12.9475, 77.6950, "Bellandur", "Bellandur junction"),
    (12.9360, 77.6900, "Sarjapur Road", "Wipro junction"),
    (12.9300, 77.6780, "Koramangala", "Sony World junction"),

    # ── MG Road → Indiranagar corridor ──────────────────
    (12.9750, 77.6060, "MG Road", "MG Road Metro station"),
    (12.9720, 77.6100, "MG Road", "Brigade Road crossing"),
    (12.9780, 77.6200, "Ulsoor", "Ulsoor Lake Road"),
    (12.9770, 77.6380, "Indiranagar", "100 Feet Road"),
    (12.9790, 77.6420, "Indiranagar", "12th Main"),
    (12.9810, 77.6355, "Indiranagar", "CMH Road"),
    (12.9730, 77.6300, "Indiranagar", "HAL Stage 2"),

    # ── Bannerghatta Road corridor (south) ──────────────
    (12.9080, 77.5960, "Jayanagar", "Jayanagar 4th Block"),
    (12.8950, 77.5990, "JP Nagar", "JP Nagar 6th Phase"),
    (12.8850, 77.5970, "Bannerghatta", "Arekere junction"),
    (12.8750, 77.5990, "Bannerghatta", "Meenakshi Temple Road"),
    (12.8680, 77.5950, "Bannerghatta", "Gottigere"),
    (12.8610, 77.5980, "Bannerghatta", "Hulimavu junction"),
    (12.8900, 77.6020, "JP Nagar", "Raghuvanahalli"),

    # ── Bellary Road → Yelahanka (north corridor) ───────
    (13.0100, 77.5700, "Sadashivanagar", "Palace Grounds"),
    (13.0200, 77.5800, "Bellary Road", "Mekhri Circle"),
    (13.0300, 77.5900, "Bellary Road", "Hebbal overpass"),
    (13.0380, 77.5850, "Yelahanka", "Jakkur"),
    (13.0500, 77.5780, "Yelahanka", "Yelahanka junction"),
    (13.0280, 77.5950, "Bellary Road", "Esteem Mall"),

    # ── Tumkur Road (NW corridor) ───────────────────────
    (13.0050, 77.5500, "Rajajinagar", "Rajajinagar 6th block"),
    (13.0120, 77.5350, "Tumkur Road", "Yeshwanthpur junction"),
    (13.0250, 77.5300, "Tumkur Road", "Jalahalli Cross"),
    (13.0400, 77.5250, "Tumkur Road", "Peenya 2nd Stage"),
    (13.0350, 77.5400, "Tumkur Road", "Peenya Industrial"),
    (13.0180, 77.5450, "Tumkur Road", "Dasarahalli"),

    # ── Whitefield → ITPL corridor (East) ───────────────
    (12.9690, 77.7490, "Whitefield", "Whitefield Main Road"),
    (12.9730, 77.7380, "Whitefield", "Forum Mall"),
    (12.9650, 77.7250, "ITPL", "ITPL Main Road"),
    (12.9770, 77.7150, "Hoodi", "Hoodi junction"),
    (12.9710, 77.7050, "Brookefield", "AECS Layout B Block"),

    # ── Mysore Road / BGS area (Demo zone — user location) ─
    (12.9410, 77.5560, "Mysore Road", "BGS Flyover east"),
    (12.9380, 77.5490, "Mysore Road", "Kengeri flyover approach"),
    (12.9450, 77.5620, "Mysore Road", "NICE junction"),
    (12.9350, 77.5530, "Mysore Road", "Nayandahalli signal"),
    (12.9440, 77.5470, "Mysore Road", "RV College side"),
    (12.9395, 77.5600, "Mysore Road", "BGS underpass"),
    (12.9370, 77.5450, "Mysore Road", "Kengeri satellite"),
    (12.9420, 77.5520, "Mysore Road", "Rajarajeshwari Nagar"),

    # ── Koramangala (important tech area) ───────────────
    (12.9340, 77.6260, "Koramangala", "Forum Mall"),
    (12.9380, 77.6190, "Koramangala", "5th Block"),
    (12.9310, 77.6150, "Koramangala", "8th Block"),
    (12.9290, 77.6230, "Koramangala", "Jyoti Nivas College Rd"),
    (12.9360, 77.6100, "Koramangala", "80 Feet Road"),

    # ── Electronic City (south tech hub) ────────────────
    (12.8450, 77.6600, "Electronic City", "Phase 1"),
    (12.8500, 77.6700, "Electronic City", "Infosys gate"),
    (12.8380, 77.6550, "Electronic City", "Phase 2"),
    (12.8420, 77.6650, "Electronic City", "Neotown junction"),

    # ── Old Airport Road ────────────────────────────────
    (12.9700, 77.6499, "Old Airport Road", "HAL junction"),
    (12.9720, 77.6550, "Old Airport Road", "Domlur flyover"),
    (12.9680, 77.6420, "Old Airport Road", "Kodihalli"),
    (12.9740, 77.6600, "Old Airport Road", "Old Madras Road cross"),

    # ── Jayanagar / Basavanagudi (central old Bengaluru) ─
    (12.9260, 77.5830, "Basavanagudi", "Bull Temple Road"),
    (12.9320, 77.5780, "Basavanagudi", "DVG Road"),
    (12.9220, 77.5900, "Jayanagar", "11th Main"),
    (12.9280, 77.5920, "Jayanagar", "Cool Joint junction"),
    (12.9350, 77.5860, "Jayanagar", "South End Circle"),

    # ── Additional scattered points ─────────────────────
    (12.9620, 77.5750, "Majestic", "Kempegowda Bus Station"),
    (12.9680, 77.5800, "Chickpet", "KR Market"),
    (12.9550, 77.5680, "Chamarajpet", "Palace"),
    (12.9480, 77.5720, "VV Puram", "Food Street"),
    (12.9850, 77.5600, "Malleswaram", "Sampige Road"),
    (12.9900, 77.5700, "Sadashivanagar", "Sankey Tank"),
    (12.9200, 77.6550, "BTM Layout", "Silk Board side"),
    (12.9150, 77.6450, "BTM Layout", "1st Stage"),
    (12.9100, 77.6350, "BTM Layout", "Madiwala"),
    (12.9050, 77.6250, "Bommanahalli", "Begur Road"),
]

def get_closest_ward(lat: float, lng: float) -> str:
    """Find the closest ward based on haversine distance (approximated) from the known road points."""
    best_ward = "Unknown"
    # Basic squared euclidean distance is perfectly adequate within a single city scale
    min_dist_sq = float('inf')
    
    for r_lat, r_lng, ward_name, _ in ROAD_POINTS:
        dist_sq = (r_lat - lat)**2 + (r_lng - lng)**2
        if dist_sq < min_dist_sq:
            min_dist_sq = dist_sq
            best_ward = ward_name
            
    return best_ward
