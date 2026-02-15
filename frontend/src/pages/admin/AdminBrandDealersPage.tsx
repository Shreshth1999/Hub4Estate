import { useState, useEffect } from 'react';
import { brandDealerApi, api } from '../../lib/api';
import {
  Users, Phone, MapPin, Search, Plus, X, Loader2, Building2,
  Edit2, Trash2, Globe, CheckCircle, AlertCircle
} from 'lucide-react';

interface BrandDealer {
  id: string;
  brandId: string;
  brand: { id: string; name: string; slug: string };
  name: string;
  shopName: string | null;
  phone: string;
  whatsappNumber: string | null;
  email: string | null;
  city: string;
  state: string | null;
  pincode: string | null;
  address: string | null;
  source: string;
  sourceUrl: string | null;
  isVerified: boolean;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

const emptyForm = {
  brandId: '',
  name: '',
  shopName: '',
  phone: '',
  whatsappNumber: '',
  email: '',
  city: '',
  state: '',
  pincode: '',
  address: '',
  source: 'MANUAL' as const,
  sourceUrl: '',
  isVerified: false,
  notes: '',
};

export function AdminBrandDealersPage() {
  const [dealers, setDealers] = useState<BrandDealer[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchDealers = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 30 };
      if (brandFilter) params.brandId = brandFilter;
      if (search) params.search = search;

      const res = await brandDealerApi.list(params);
      setDealers(res.data.data);
      setTotalPages(res.data.pages);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to fetch brand dealers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await api.get('/products/brands');
      setBrands(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch brands:', err);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchDealers();
  }, [brandFilter, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDealers();
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (d: BrandDealer) => {
    setEditing(d.id);
    setForm({
      brandId: d.brandId,
      name: d.name,
      shopName: d.shopName || '',
      phone: d.phone,
      whatsappNumber: d.whatsappNumber || '',
      email: d.email || '',
      city: d.city,
      state: d.state || '',
      pincode: d.pincode || '',
      address: d.address || '',
      source: d.source as any,
      sourceUrl: d.sourceUrl || '',
      isVerified: d.isVerified,
      notes: d.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.brandId || !form.name || !form.phone || !form.city) {
      alert('Please fill in required fields: Brand, Name, Phone, City');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await brandDealerApi.update(editing, form);
      } else {
        await brandDealerApi.create(form);
      }
      setShowModal(false);
      fetchDealers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save dealer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this dealer?')) return;
    try {
      await brandDealerApi.remove(id);
      fetchDealers();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const sourceLabel: Record<string, string> = {
    MANUAL: 'Manual',
    SCRAPED: 'Scraped',
    BRAND_WEBSITE: 'Brand Site',
    PLATFORM_DEALER: 'Platform',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">Brand Dealer Directory</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Manage external dealer contacts for each brand. {total} dealers total.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white font-bold text-sm hover:bg-neutral-800"
        >
          <Plus className="w-4 h-4" />
          Add Dealer
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={brandFilter}
          onChange={e => { setBrandFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 border-2 border-neutral-200 bg-white text-sm font-medium min-w-[200px]"
        >
          <option value="">All Brands</option>
          {brands.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name, phone, city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-neutral-200 focus:border-neutral-900 outline-none text-sm"
            />
          </div>
          <button type="submit" className="px-6 py-2.5 bg-neutral-900 text-white font-bold text-sm hover:bg-neutral-800">
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
        </div>
      ) : dealers.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No dealers found</p>
          <p className="text-sm mt-1">Add your first brand dealer contact above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border-2 border-neutral-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b-2 border-neutral-200">
                <th className="text-left px-4 py-3 font-bold text-neutral-700">Dealer</th>
                <th className="text-left px-4 py-3 font-bold text-neutral-700">Brand</th>
                <th className="text-left px-4 py-3 font-bold text-neutral-700">Phone</th>
                <th className="text-left px-4 py-3 font-bold text-neutral-700">City</th>
                <th className="text-left px-4 py-3 font-bold text-neutral-700">Source</th>
                <th className="text-left px-4 py-3 font-bold text-neutral-700">Status</th>
                <th className="text-right px-4 py-3 font-bold text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dealers.map(d => (
                <tr key={d.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <p className="font-bold text-neutral-900">{d.name}</p>
                    {d.shopName && <p className="text-xs text-neutral-500">{d.shopName}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold">
                      {d.brand.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`tel:${d.phone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {d.phone}
                    </a>
                    {d.whatsappNumber && d.whatsappNumber !== d.phone && (
                      <p className="text-xs text-green-600 mt-0.5">WA: {d.whatsappNumber}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-neutral-600">
                      <MapPin className="w-3.5 h-3.5" />
                      {d.city}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 font-medium">
                      {sourceLabel[d.source] || d.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {d.isVerified ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                        <CheckCircle className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-neutral-400 text-xs">
                        <AlertCircle className="w-3.5 h-3.5" /> Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(d)}
                        className="p-2 hover:bg-neutral-200 rounded"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-neutral-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="p-2 hover:bg-red-100 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            Page {page} of {totalPages} ({total} dealers)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-bold bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-bold bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-neutral-900 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-neutral-200 bg-neutral-50">
              <h2 className="text-lg font-black text-neutral-900">
                {editing ? 'Edit Dealer' : 'Add Brand Dealer'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Brand selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Brand *
                </label>
                <select
                  value={form.brandId}
                  onChange={e => setForm(f => ({ ...f, brandId: e.target.value }))}
                  disabled={!!editing}
                  className="w-full px-4 py-2.5 border-2 border-neutral-200 focus:border-neutral-900 outline-none text-sm disabled:bg-neutral-100"
                >
                  <option value="">Select Brand</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Dealer name"
                    className="w-full px-4 py-2.5 border-2 border-neutral-200 focus:border-neutral-900 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Shop Name
                  </label>
                  <input
                    type="text"
                    value={form.shopName}
                    onChange={e => setForm(f => ({ ...f, shopName: e.target.value }))}
                    placeholder="Business name"
                    className="w-full px-4 py-2.5 border-2 border-neutral-200 focus:border-neutral-900 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Phone *
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 border-2 border-neutral-200 focus:border-neutral-900 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={form.whatsappNumber}
                    onChange={e => setForm(f => ({ ...f, whatsappNumber: e.target.value }))}
                    placeholder="Same as phone if blank"
                    className="w-full px-4 py-2.5 border-2 border-neutral-200 focus:border-neutral-900 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="dealer@example.com"
                  className="w-full px-4 py-2.5 border-2 border-neutral-200 focus:border-neutral-900 outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    placeholder="Delhi"
                    className="w-full px-4 py-2.5 border-2 border-neutral-200 focus:border-neutral-900 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                    placeholder="Delhi"
                    className="w-full px-4 py-2.5 border-2 border-neutral-200 focus:border-neutral-900 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))}
                    placeholder="110001"
                    className="w-full px-4 py-2.5 border-2 border-neutral-200 focus:border-neutral-900 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isVerified}
                    onChange={e => setForm(f => ({ ...f, isVerified: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-neutral-700">Verified dealer</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  placeholder="Any additional notes..."
                  className="w-full px-4 py-2.5 border-2 border-neutral-200 focus:border-neutral-900 outline-none text-sm resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t-2 border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 text-sm font-bold text-neutral-600 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-2.5 bg-neutral-900 text-white font-bold text-sm hover:bg-neutral-800 disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? 'Update Dealer' : 'Add Dealer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
