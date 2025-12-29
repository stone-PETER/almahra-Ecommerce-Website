# Database Migration Note

## New OrderStatus Added

A new status `OUT_FOR_DELIVERY` has been added to the `OrderStatus` enum.

### OrderStatus Enum (Updated)
```python
class OrderStatus(Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    OUT_FOR_DELIVERY = "out_for_delivery"  # NEW
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    RETURNED = "returned"
```

## Migration Required?

Since this is an enum change in Python, you need to check if your database needs updating:

### For PostgreSQL with Alembic

If you're using PostgreSQL and the status column is defined as an ENUM type in the database, you'll need to create a migration:

```bash
cd backend
flask db migrate -m "Add OUT_FOR_DELIVERY status to OrderStatus enum"
flask db upgrade
```

### For PostgreSQL Manual Migration

If the above doesn't work, you can manually add the enum value:

```sql
ALTER TYPE orderstatus ADD VALUE 'out_for_delivery' AFTER 'shipped';
```

Or if the column uses VARCHAR/TEXT (not ENUM), no migration is needed.

### For SQLite

If you're using SQLite (development), no migration is needed as it uses TEXT for enums.

## Verification

After migration, verify the new status works:

```python
# In Python console
from app.models import OrderStatus
print(OrderStatus.OUT_FOR_DELIVERY.value)  # Should print: out_for_delivery
```

## Testing

Test the new status in admin panel:
1. Go to Admin Orders
2. Select an order
3. Change status to "Out for Delivery"
4. Verify email is sent
5. Verify status is saved correctly

## Rollback (if needed)

If you need to rollback:

```bash
flask db downgrade
```

Or manually:
```sql
-- This may not work in PostgreSQL as enum values can't be easily removed
-- You'd need to recreate the enum type
```

## Important Notes

1. The new status fits between SHIPPED and DELIVERED in the order lifecycle
2. All existing orders will continue to work normally
3. The email notification system uses this status to trigger "Out for Delivery" emails
4. Frontend may need updating to display this new status
5. Mobile apps (if any) need to handle this new status

## Frontend Update Needed

Update the order status dropdown/display in:
- Admin order management page
- Customer order tracking page
- Order status badge colors
- Order timeline/progress tracker
