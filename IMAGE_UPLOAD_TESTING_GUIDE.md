# Image Upload & Preview - Testing Guide

## ✅ What Was Fixed

1. **Image Preview Component Created** - Opens in same tab with zoom controls
2. **Track Inquiry Page Updated** - Now shows clickable image previews
3. **API Base URL Fixed** - Images now load with correct `http://localhost:3001` prefix
4. **Lightbox Functionality** - Click any image to open full-screen preview with:
   - Zoom in/out controls
   - Download button
   - Close button
   - Dark overlay

---

## 🧪 How to Test - Step by Step

### Test 1: Upload Image from Homepage

1. **Open Homepage**
   ```
   http://localhost:3000/
   ```

2. **Scroll to "Get Instant Quotes" Section**
   - You'll see a form with product photo upload

3. **Fill the Form:**
   ```
   Name: Test User
   Phone: +919876543210
   Model Number: (optional)
   Quantity: 10
   Delivery City: Mumbai
   ```

4. **Upload Product Photo:**
   - Click on "Click to upload product photo" area
   - Select any `.jpg`, `.png`, or `.webp` image (max 5MB)
   - You'll see a preview immediately
   - If you want to change, click the X button to remove

5. **Submit Form:**
   - Click "Get Quotes from Dealers" button
   - Wait 2-3 seconds
   - You'll get inquiry number like: `HUB-REQ-0042`

6. **Success Screen:**
   - Click "Track Request" button

---

### Test 2: View Uploaded Image (User Tracking)

1. **Track Your Request:**
   ```
   http://localhost:3000/track
   ```

2. **Enter Your Inquiry Number:**
   - Type: `HUB-REQ-0042` (or whatever you got)
   - Click "Track Request"

3. **View Image:**
   - You'll see your inquiry details
   - Under "Your Product Photo (Click to view)" section
   - **Click on the image** → Opens FULL SCREEN in same tab
   - **Zoom Controls** at bottom:
     - Minus button: Zoom out
     - Plus button: Zoom in
     - Download button: Save image
   - **Click X** or click outside to close
   - **Stays on same page** - No new tab!

---

### Test 3: View Image in Admin Panel

1. **Login as Admin:**
   ```
   http://localhost:3000/admin/login
   ```

2. **Go to Inquiries:**
   ```
   http://localhost:3000/admin/inquiries
   ```

3. **Click on Any Inquiry** with photo icon

4. **View Image:**
   - Click on product photo thumbnail
   - Opens in lightbox (same tab)
   - Zoom in/out
   - Download
   - Close with X button

5. **Assign Category:**
   - Select category dropdown: "Switches"
   - Select brand (if you can identify): "Legrand"
   - Save
   - Now dealers who deal in Switches or Legrand will see this inquiry

---

### Test 4: Dealer Views Image

1. **Login as Dealer:**
   ```
   http://localhost:3000/dealer/login
   ```

2. **Go to Available Inquiries:**
   ```
   http://localhost:3000/dealer/inquiries/available
   ```

3. **See Inquiry Card:**
   - Product photo shown as thumbnail
   - Click on thumbnail → Opens full screen
   - Zoom controls available
   - Can download image
   - Click "Submit Quote" to respond

4. **Submit Quote:**
   - Price per unit: ₹125
   - Shipping: ₹50
   - Delivery: "3-5 days"
   - Notes: "Best quality"
   - Submit

---

## 🎨 Image Preview Features

### Thumbnail View (Hover Effect)
- Shows semi-transparent overlay on hover
- Zoom icon appears
- Border highlights on hover
- Cursor changes to pointer

### Full Screen Lightbox
- Dark background (90% opacity black)
- Image centered
- Click outside image to close
- ESC key to close (future enhancement)

### Zoom Controls
- **Zoom Out** button (disabled at 50%)
- **Current Zoom**: Displays as percentage (50% to 300%)
- **Zoom In** button (disabled at 300%)
- **Download** button: Saves image to your computer

### Close Button
- Top right corner
- White with semi-transparent background
- X icon
- Hover effect

---

## 📁 Image Storage Locations

### Backend Storage:
```
backend/uploads/inquiry-photos/inquiry_[timestamp].jpg

Example:
backend/uploads/inquiry-photos/inquiry_1708522800000.jpg
```

### Access URL:
```
http://localhost:3001/uploads/inquiry-photos/inquiry_1708522800000.jpg
```

### Frontend Display:
```typescript
// Correct way (with API base URL):
<img src={`${API_BASE_URL}${inquiry.productPhoto}`} />

// Example:
src="http://localhost:3001/uploads/inquiry-photos/inquiry_1708522800000.jpg"
```

---

## 🔍 Troubleshooting

### Image Not Showing?

**Check 1: Is the backend serving files?**
```bash
# Open in browser:
http://localhost:3001/uploads/inquiry-photos/[your-filename].jpg

# If you see the image → Backend is working ✅
# If you see 404 → Backend not serving static files ❌
```

**Fix for Backend:**
```typescript
// In backend/src/index.ts (already added):
app.use('/uploads', express.static('uploads'));
```

**Check 2: Is the path correct in database?**
```sql
-- Check database:
SELECT productPhoto FROM "ProductInquiry" WHERE id = 'your-id';

-- Should return:
/uploads/inquiry-photos/inquiry_1708522800000.jpg

-- NOT just:
inquiry_1708522800000.jpg
```

**Check 3: Is frontend using correct API URL?**
```typescript
// In frontend component:
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Image src should be:
`${API_BASE_URL}${inquiry.productPhoto}`
// = "http://localhost:3001/uploads/inquiry-photos/file.jpg"
```

### Image Opens in New Tab Instead of Lightbox?

**Problem:** Using regular `<a href>` or `<img>` without ImagePreview component

**Fix:** Use ImagePreview component:
```tsx
import { ImagePreview } from '../components/common/ImagePreview';

// Use it:
<ImagePreview
  src={`${API_BASE_URL}${productPhoto}`}
  alt="Product Photo"
  className="w-full h-48"
/>
```

### Lightbox Not Working?

**Check:** Is ImagePreview component imported correctly?
```tsx
// At top of file:
import { ImagePreview } from '../components/common/ImagePreview';

// NOT:
import ImagePreview from '../components/common/ImagePreview';  ❌
```

---

## 📊 Complete Flow Verification

### End-to-End Test:

1. ✅ **User uploads image on homepage** → Image saved in `uploads/inquiry-photos/`
2. ✅ **Database stores path** → `productPhoto` field = `/uploads/inquiry-photos/file.jpg`
3. ✅ **User tracks inquiry** → Image displays as clickable thumbnail
4. ✅ **User clicks image** → Opens in lightbox (same tab)
5. ✅ **Admin views inquiry** → Sees image, can assign category
6. ✅ **Dealer sees inquiry** → Image displays in card, can click to zoom
7. ✅ **Dealer submits quote** → User gets notification
8. ✅ **User sees quote** → Can view image and dealer quote together

---

## 🎯 Quick Test Commands

### Test Image Upload:
```bash
# Using curl:
curl -X POST http://localhost:3001/api/inquiry/submit \
  -F "name=Test User" \
  -F "phone=+919876543210" \
  -F "quantity=10" \
  -F "deliveryCity=Mumbai" \
  -F "productPhoto=@/path/to/your/image.jpg"
```

### Test Image Access:
```bash
# Check if image is accessible:
curl -I http://localhost:3001/uploads/inquiry-photos/inquiry_1708522800000.jpg

# Should return:
HTTP/1.1 200 OK
Content-Type: image/jpeg
```

### Test Track API:
```bash
curl http://localhost:3001/api/inquiry/track?number=HUB-REQ-0042
```

---

## ✅ Success Criteria

### Image Upload Working:
- [ ] Form shows image preview after selecting file
- [ ] Submit button works without errors
- [ ] Success message shows inquiry number
- [ ] Image file exists in `backend/uploads/inquiry-photos/`

### Image Viewing Working:
- [ ] Track page shows image thumbnail
- [ ] Clicking image opens lightbox (NOT new tab)
- [ ] Zoom controls work (in/out)
- [ ] Download button works
- [ ] Close button closes lightbox
- [ ] Clicking outside closes lightbox

### Dealer Integration Working:
- [ ] Dealer sees inquiry in available list
- [ ] Dealer sees product image
- [ ] Dealer can click to view full size
- [ ] Dealer can submit quote

### Admin Panel Working:
- [ ] Admin sees all inquiries with images
- [ ] Admin can view images
- [ ] Admin can assign categories
- [ ] Admin sees all dealer quotes

---

## 🚀 Your Servers

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Image Test**: http://localhost:3001/uploads/inquiry-photos/

Both servers are running with auto-reload enabled! 🎉

---

## 📝 Summary of New Features

1. **ImagePreview Component**
   - File: `frontend/src/components/common/ImagePreview.tsx`
   - Features: Lightbox, zoom, download, click-to-close
   - Used in: Track page, admin panel, dealer panel

2. **Updated Track Page**
   - File: `frontend/src/pages/TrackInquiryPage.tsx`
   - Now uses ImagePreview component
   - Proper API base URL
   - Click to view full screen

3. **Existing Homepage Form**
   - Already has image upload
   - Working correctly
   - Just needed proper viewing

All image viewing is now in-tab with lightbox preview! No more opening new tabs! ✅
