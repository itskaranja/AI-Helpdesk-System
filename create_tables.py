from app.db.databaase import engine
from app.db.models import Base

# Create database tables
Base.metadata.create_all(bind=engine)

print("✅ Tables created successfully")