[User]
- user_id (PK)
- name
- email
- password_hash
- phone
- created_at

[Pet]
- pet_id (PK)
- user_id (FK)
- name
- type (cat/dog)
- breed

[Room]
- room_id (PK)
- name
- price_per_day
- is_available
- description

[Booking]
- booking_id (PK)
- user_id (FK)
- room_id (FK, nullable)
- pet_id (FK)
- start_date
- end_date
- total_price
- type (hotel | taxi)
- status

[TaxiRequest]
- taxi_id (PK)
- user_id (FK)
- from_city
- to_city
- distance_km
- km_price
- total_price
- date

[Payment]
- payment_id (PK)
- booking_id (FK)
- amount
- method
- status
- invoice_pdf_url

[Admin]
- admin_id (PK)
- username
- password_hash
- role
