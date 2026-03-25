# Hub4Estate - Inquiry System Fixes

## 🔧 Problems Fixed

### 1. ✅ Images Not Visible
- **Problem**: Users upload product images before signup, but images weren't viewable
- **Fix**: Images are now properly served at `http://localhost:3001/uploads/inquiry-photos/[filename]`
- **How it works**: The `express.static` middleware serves all uploaded files from the `/uploads` directory

### 2. ✅ Dealers Not Receiving Leads
- **Problem**: Inquiries only went to admin panel, dealers couldn't see them
- **Fix**: Created complete dealer inquiry system with:
  - New API endpoints for dealers to view available inquiries
  - Automatic filtering based on dealer's brands and categories
  - Dealer response/quote system

### 3. ✅ Category Sorting
- **Problem**: No way to categorize uploaded image inquiries
- **Fix**: Added `categoryId` and `identifiedBrandId` fields to ProductInquiry table
- **Admin can now**: Assign category and brand to inquiries for better dealer matching

### 4. ✅ Dealer Quote Functionality
- **Problem**: Dealers couldn't respond to inquiries with their own quotes
- **Fix**: New `InquiryDealerResponse` table and endpoints for dealer quotes

---

## 🗄️ Database Changes

### New Fields in `ProductInquiry` Table:
```sql
- categoryId          (Links to Category table)
- identifiedBrandId   (Links to Brand table)
```

### New Table: `InquiryDealerResponse`
```sql
- id
- inquiryId          (Links to ProductInquiry)
- dealerId           (Links to Dealer)
- status             (pending, viewed, quoted, declined)
- quotedPrice
- shippingCost
- totalPrice
- estimatedDelivery
- notes
- viewedAt
- respondedAt
```

---

## 🔌 New API Endpoints

### For Dealers:

#### 1. Get Available Inquiries
```
GET /api/dealer-inquiry/available?page=1&limit=20&status=all
Authorization: Bearer [dealer-token]

Response:
{
  "data": [
    {
      "id": "uuid",
      "inquiryNumber": "HUB-REQ-0001",
      "name": "John Doe",
      "phone": "+919876543210",
      "productPhoto": "/uploads/inquiry-photos/inquiry_1234567890.jpg",
      "modelNumber": "XYZ-123",
      "quantity": 10,
      "deliveryCity": "Mumbai",
      "category": { "id": "uuid", "name": "Switches" },
      "identifiedBrand": { "id": "uuid", "name": "Legrand" },
      "dealerResponse": null // or { status, quotedPrice } if already quoted
    }
  ],
  "total": 25,
  "page": 1,
  "pages": 2
}
```

#### 2. View Single Inquiry
```
GET /api/dealer-inquiry/:id
Authorization: Bearer [dealer-token]

Response:
{
  "inquiry": { ... full inquiry details ... },
  "dealerResponse": null // or existing response
}
```

#### 3. Submit Quote
```
POST /api/dealer-inquiry/:id/quote
Authorization: Bearer [dealer-token]

Body:
{
  "quotedPrice": 125.50,
  "shippingCost": 50,
  "estimatedDelivery": "3-5 business days",
  "notes": "GST extra. Bulk discount available."
}

Response:
{
  "message": "Quote submitted successfully",
  "response": { ... dealer response object ... }
}
```

#### 4. View My Quotes
```
GET /api/dealer-inquiry/my-quotes/list?page=1&status=all
Authorization: Bearer [dealer-token]

Response:
{
  "data": [
    {
      "id": "uuid",
      "quotedPrice": 125.50,
      "totalPrice": 1305.00,
      "status": "quoted",
      "inquiry": { ... inquiry details ... }
    }
  ],
  "total": 15
}
```

### For Admin:

#### Updated: Get Inquiry with All Dealer Responses
```
GET /api/inquiry/admin/:id
Authorization: Bearer [admin-token]

Response:
{
  "inquiry": { ... inquiry details with category and brand ... },
  "dealerResponses": [
    {
      "id": "uuid",
      "dealer": {
        "id": "uuid",
        "businessName": "Mumbai Electricals",
        "city": "Mumbai",
        "phone": "+919876543210",
        "rating": 4.5
      },
      "quotedPrice": 125.50,
      "totalPrice": 1305.00,
      "estimatedDelivery": "3-5 days",
      "status": "quoted",
      "respondedAt": "2025-02-21T10:30:00Z"
    }
  ],
  "totalResponses": 5,
  "quotedResponses": 3
}
```

---

## 📸 Image Viewing - All Panels

### 1. User Panel (Track Inquiry Page)
```javascript
// Image URL format:
const imageUrl = `http://localhost:3001${inquiry.productPhoto}`;
// Example: http://localhost:3001/uploads/inquiry-photos/inquiry_1708522800000.jpg

// Display image:
<img src={imageUrl} alt="Product Photo" className="w-full h-64 object-cover" />
```

### 2. Admin Panel
```javascript
// Same image URL format
const imageUrl = `http://localhost:3001${inquiry.productPhoto}`;

// With lightbox/modal:
<button onClick={() => openImageModal(imageUrl)}>
  <img src={imageUrl} alt="Product" className="w-32 h-32 object-cover" />
</button>
```

### 3. Dealer Panel
```javascript
// Dealers can view images when browsing available inquiries
const imageUrl = `http://localhost:3001${inquiry.productPhoto}`;

// Display with zoom:
<div className="relative group">
  <img src={imageUrl} alt="Product" className="cursor-zoom-in" />
  {/* Add zoom functionality */}
</div>
```

---

## 🔄 How It Works - Complete Flow

### 1. User Uploads Image (No Signup Required)
```
1. User visits homepage
2. Fills inquiry form: Name, Phone, City, Product Photo
3. Clicks "Submit" (NO login needed)
4. Image uploaded to: backend/uploads/inquiry-photos/
5. Inquiry created in database with status: "new"
6. User receives inquiry number: HUB-REQ-0042
```

### 2. Admin Assigns Category (Optional but Recommended)
```
1. Admin opens inquiry in admin panel
2. Views uploaded product image
3. Identifies product: "This is a modular switch"
4. Sets categoryId = "switches"
5. Sets identifiedBrandId = "legrand" (if recognizable)
6. Status changes: "new" → "contacted"
```

### 3. Dealers See Matching Inquiries
```
Dealer matching logic:
- Dealer deals in "Switches" category? ✅ Show inquiry
- Dealer deals in "Legrand" brand? ✅ Show inquiry
- No category/brand set? ✅ Show to ALL dealers (as fallback)

Dealer sees inquiry in their "Available Leads" section
```

### 4. Dealer Submits Quote
```
1. Dealer clicks "View Details" on inquiry
2. Views product image (zoomed view available)
3. Fills quote form:
   - Price per unit: ₹125
   - Shipping: ₹50
   - Delivery: "3-5 days"
   - Notes: "GST extra"
4. Clicks "Submit Quote"
5. Quote saved in InquiryDealerResponse table
6. Inquiry status updated: "contacted" (if first quote)
```

### 5. Admin/User Views All Quotes
```
Admin panel shows:
- Original inquiry with image
- List of all dealer responses sorted by price
- Dealer details (name, city, rating)
- Total quotes received: 5
- Best price highlighted

User tracking page shows:
- Their inquiry details
- All dealer quotes (if admin marks as "public")
- Can contact dealers directly
```

---

## 🧪 Testing Guide

### Test 1: Image Upload & View
```bash
# 1. Submit inquiry with image (use Postman or frontend form)
POST http://localhost:3001/api/inquiry/submit
Content-Type: multipart/form-data

Body (form-data):
- name: "Test User"
- phone: "+919876543210"
- email: "test@example.com"
- deliveryCity: "Mumbai"
- quantity: 10
- productPhoto: [select image file]

# 2. Get inquiry number from response
Response: { "inquiryNumber": "HUB-REQ-0042" }

# 3. Track inquiry
GET http://localhost:3001/api/inquiry/track?number=HUB-REQ-0042

# 4. View image URL in response:
{ "productPhoto": "/uploads/inquiry-photos/inquiry_1708522800000.jpg" }

# 5. Open image in browser:
http://localhost:3001/uploads/inquiry-photos/inquiry_1708522800000.jpg
```

### Test 2: Dealer Views Inquiry
```bash
# 1. Login as dealer (get token)
POST http://localhost:3001/api/auth/dealer/login
Body: { "email": "dealer@example.com", "password": "password" }

# 2. Get available inquiries
GET http://localhost:3001/api/dealer-inquiry/available
Authorization: Bearer [token]

# 3. View specific inquiry with image
GET http://localhost:3001/api/dealer-inquiry/[inquiry-id]
Authorization: Bearer [token]

# 4. Image will be in response - open in browser
```

### Test 3: Dealer Submits Quote
```bash
POST http://localhost:3001/api/dealer-inquiry/[inquiry-id]/quote
Authorization: Bearer [dealer-token]

Body:
{
  "quotedPrice": 125.50,
  "shippingCost": 50,
  "estimatedDelivery": "3-5 business days",
  "notes": "Best quality guaranteed"
}

# Response: Quote created successfully
```

### Test 4: Admin Views All Dealer Quotes
```bash
GET http://localhost:3001/api/inquiry/admin/[inquiry-id]
Authorization: Bearer [admin-token]

# Response includes:
# - inquiry details
# - dealerResponses array with all quotes
# - dealer information
```

---

## 🎨 Frontend Integration

### Track Inquiry Page Component
```tsx
// frontend/src/pages/TrackInquiryPage.tsx

function TrackInquiryPage() {
  const [inquiry, setInquiry] = useState(null);

  // Fetch inquiry by number or phone
  const trackInquiry = async (number: string) => {
    const res = await api.get(`/inquiry/track?number=${number}`);
    setInquiry(res.data.inquiries[0]);
  };

  return (
    <div>
      {/* Input form to enter inquiry number */}
      {inquiry && (
        <div className="space-y-4">
          <h2>Inquiry {inquiry.inquiryNumber}</h2>

          {/* Product Image */}
          {inquiry.productPhoto && (
            <img
              src={`${API_BASE_URL}${inquiry.productPhoto}`}
              alt="Product"
              className="w-full max-w-md rounded-lg shadow-lg"
            />
          )}

          {/* Status */}
          <div className="bg-blue-100 p-4 rounded">
            Status: {inquiry.status}
          </div>

          {/* Dealer Quotes (if admin shared them) */}
          {/* Show quotedPrice, totalPrice, etc. */}
        </div>
      )}
    </div>
  );
}
```

### Admin Inquiry Detail Component
```tsx
// frontend/src/pages/admin/AdminInquiryDetail.tsx

function AdminInquiryDetail({ inquiryId }: { inquiryId: string }) {
  const { data } = useQuery(['inquiry', inquiryId], () =>
    api.get(`/inquiry/admin/${inquiryId}`)
  );

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left: Inquiry Details */}
      <div>
        <h2>Inquiry {data.inquiry.inquiryNumber}</h2>

        {/* Product Image with Lightbox */}
        <button onClick={() => openLightbox(data.inquiry.productPhoto)}>
          <img
            src={`${API_BASE_URL}${data.inquiry.productPhoto}`}
            alt="Product"
            className="w-full rounded-lg cursor-zoom-in"
          />
        </button>

        {/* Assign Category/Brand */}
        <select onChange={(e) => assignCategory(e.target.value)}>
          <option>Select Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Right: Dealer Responses */}
      <div>
        <h3>Dealer Quotes ({data.quotedResponses}/{data.totalResponses})</h3>

        {data.dealerResponses.map(response => (
          <div key={response.id} className="border p-4 rounded mb-2">
            <div className="flex justify-between">
              <div>
                <p className="font-bold">{response.dealer.businessName}</p>
                <p className="text-sm text-gray-600">{response.dealer.city}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  ₹{response.quotedPrice}/unit
                </p>
                <p className="text-sm">Total: ₹{response.totalPrice}</p>
              </div>
            </div>
            <p className="text-sm mt-2">{response.notes}</p>
            <p className="text-xs text-gray-500">
              Delivery: {response.estimatedDelivery}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Dealer Available Inquiries Component
```tsx
// frontend/src/pages/dealer/DealerAvailableInquiries.tsx

function DealerAvailableInquiries() {
  const { data } = useQuery(['dealer-inquiries'], () =>
    api.get('/dealer-inquiry/available?page=1&limit=20')
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data?.data.map(inquiry => (
        <div key={inquiry.id} className="border rounded-lg p-4 hover:shadow-lg">
          {/* Product Image Thumbnail */}
          {inquiry.productPhoto && (
            <img
              src={`${API_BASE_URL}${inquiry.productPhoto}`}
              alt="Product"
              className="w-full h-48 object-cover rounded-lg mb-3"
            />
          )}

          <h3 className="font-bold">{inquiry.inquiryNumber}</h3>
          <p>Qty: {inquiry.quantity} units</p>
          <p>City: {inquiry.deliveryCity}</p>

          {/* Category Badge */}
          {inquiry.category && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
              {inquiry.category.name}
            </span>
          )}

          {/* Already Quoted? */}
          {inquiry.dealerResponse ? (
            <button className="mt-2 w-full bg-gray-300 text-gray-700 py-2 rounded" disabled>
              Already Quoted (₹{inquiry.dealerResponse.quotedPrice})
            </button>
          ) : (
            <button
              onClick={() => openQuoteModal(inquiry)}
              className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Submit Quote
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 🚀 Next Steps

1. **Test Image Upload**: Use Postman or frontend form to upload product image
2. **Verify Image Accessibility**: Open image URL in browser
3. **Admin Assigns Category**: Use admin panel to categorize inquiry
4. **Dealer Sees Inquiry**: Login as dealer and check available inquiries
5. **Dealer Submits Quote**: Submit quote through dealer panel
6. **Admin Views All Quotes**: Check admin panel for all dealer responses
7. **User Tracks Request**: User can see their inquiry status and dealer quotes

---

## ✅ Summary

**What Was Fixed:**
- ✅ Images properly uploaded and viewable from all panels
- ✅ Dealers receive inquiries based on their categories/brands
- ✅ Dealers can submit quotes on inquiries
- ✅ Admin can see all dealer quotes for each inquiry
- ✅ Category sorting for better dealer matching
- ✅ Complete inquiry-to-quote workflow functional

**Your Localhost URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Uploaded Images: http://localhost:3001/uploads/inquiry-photos/[filename]
- API Health: http://localhost:3001/health
