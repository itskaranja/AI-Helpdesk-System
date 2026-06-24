from app.db.databaase import SessionLocal
from app.db.models import User
from app.auth.security import hash_password

db = SessionLocal()

users = [

   
    # EMPLOYEES
  
    User(
        full_name="John Kamau",
        email="jkamau@nairobibottlers.com",
        password=hash_password("1234"),
        role="employee"
    ),

    User(
        full_name="Mary Wanjiku",
        email="mwanjiku@nairobibottlers.com",
        password=hash_password("1234"),
        role="employee"
    ),

   
    # IT SUPPORT ENGINEERS
   
    User(
        full_name="Barry Otieno",
        email="botieno.itse@nairobibottlers.com",
        password=hash_password("1234"),
        role="it_support",
        specialization=("Network","email communication issues")
    ),

    User(
        full_name="Paul Njatha",
        email="pnjatha.itse@nairobibottlers.com",
        password=hash_password("1234"),
        role="it_support",
        specialization=("Security","account and access issues""compliance issues")
    ),

    User(
        full_name="Nicholus Mukholi",
        email="nmukholi.itse@nairobibottlers.com",
        password=hash_password("1234"),
        role="it_support",
        specialization=("Hardware""software","service requests")
    )

]

for user in users:
    db.add(user)

db.commit()

print("✅ Users inserted successfully")

