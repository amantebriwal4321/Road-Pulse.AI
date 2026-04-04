from db_client import get_all_potholes
potholes = get_all_potholes()
print(f"Potholes in DB: {len(potholes)}")
if potholes:
    print("Sample wards:", [p["ward"] for p in potholes[:5]])
else:
    print("DATABASE IS EMPTY - need to re-seed!")
