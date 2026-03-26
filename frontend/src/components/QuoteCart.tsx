import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart, X, Plus, Minus, Trash2, ArrowRight, MapPin, Calendar,
  Building2, Home, Factory, ChevronDown, ChevronUp, FileText, AlertCircle
} from 'lucide-react';

interface QuoteCartItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  quantity: number;
  unit: string;
  notes?: string;
  variant?: string;
}

interface ProjectContext {
  type: 'residential_flat' | 'villa' | 'commercial' | 'industrial' | '';
  area?: number;
  rooms?: {
    bedrooms?: number;
    bathrooms?: number;
    kitchen?: number;
    living?: number;
  };
  city: string;
  pincode: string;
  deliveryDate?: string;
  notes?: string;
}

interface QuoteCartProps {
  items: QuoteCartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateNotes: (itemId: string, notes: string) => void;
  onClearCart: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function QuoteCart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateNotes,
  onClearCart,
  isOpen,
  onToggle,
}: QuoteCartProps) {
  const [projectContext, setProjectContext] = useState<ProjectContext>({
    type: '',
    city: '',
    pincode: '',
  });
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const projectTypes = [
    { value: 'residential_flat', label: 'Residential Flat', icon: Home },
    { value: 'villa', label: 'Villa / Independent House', icon: Building2 },
    { value: 'commercial', label: 'Commercial Space', icon: Building2 },
    { value: 'industrial', label: 'Industrial / Factory', icon: Factory },
  ];

  const isProjectContextComplete = projectContext.type && projectContext.city && projectContext.pincode;

  return (
    <>
      {/* Floating Cart Button */}
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-gray-900 hover:bg-gray-800 text-white shadow-lg flex items-center justify-center transition-all relative"
      >
        <ShoppingCart className="w-6 h-6" />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>

      {/* Cart Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white border-l border-gray-200 shadow-2xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-gray-900 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Quote Cart</h2>
              <p className="text-gray-400 text-sm mt-0.5">
                {items.length} {items.length === 1 ? 'product' : 'products'} · Build your RFQ
              </p>
            </div>
            <button
              onClick={onToggle}
              className="w-9 h-9 flex items-center justify-center hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-180px)] overflow-hidden">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Your Quote Cart is Empty</h3>
              <p className="text-sm text-gray-500 mb-6">
                Add products to start building your RFQ. Dealers will compete to give you the best price.
              </p>
              <Link
                to="/categories"
                onClick={onToggle}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Browse Products
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              {/* Project Context Section */}
              <div className="border-b border-gray-200 p-4">
                <button
                  onClick={() => setShowProjectForm(!showProjectForm)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isProjectContextComplete ? 'bg-green-100' : 'bg-amber-100'}`}>
                      <MapPin className={`w-4 h-4 ${isProjectContextComplete ? 'text-green-600' : 'text-amber-600'}`} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">Project Details</p>
                      <p className="text-xs text-gray-500">
                        {isProjectContextComplete
                          ? `${projectTypes.find(t => t.value === projectContext.type)?.label} · ${projectContext.city}`
                          : 'Required for accurate quotes'}
                      </p>
                    </div>
                  </div>
                  {showProjectForm ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {showProjectForm && (
                  <div className="mt-4 space-y-4">
                    {/* Project Type */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">
                        Project Type *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {projectTypes.map((type) => {
                          const Icon = type.icon;
                          return (
                            <button
                              key={type.value}
                              onClick={() => setProjectContext(prev => ({ ...prev, type: type.value as ProjectContext['type'] }))}
                              className={`p-3 border rounded-lg text-left flex items-center gap-2 transition-all ${
                                projectContext.type === type.value
                                  ? 'border-gray-900 bg-gray-50'
                                  : 'border-gray-200 hover:border-gray-400'
                              }`}
                            >
                              <Icon className="w-4 h-4 text-gray-600" />
                              <span className="text-sm font-medium">{type.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          value={projectContext.city}
                          onChange={(e) => setProjectContext(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg p-2.5 focus:border-gray-400 focus:outline-none text-sm"
                          placeholder="e.g., Mumbai"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          value={projectContext.pincode}
                          onChange={(e) => setProjectContext(prev => ({ ...prev, pincode: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg p-2.5 focus:border-gray-400 focus:outline-none text-sm"
                          placeholder="e.g., 400001"
                          maxLength={6}
                        />
                      </div>
                    </div>

                    {/* Delivery Timeline */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">
                        Expected Delivery
                      </label>
                      <input
                        type="date"
                        value={projectContext.deliveryDate || ''}
                        onChange={(e) => setProjectContext(prev => ({ ...prev, deliveryDate: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg p-2.5 focus:border-gray-400 focus:outline-none text-sm"
                      />
                    </div>

                    {/* Built-up Area */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">
                        Built-up Area (sq.ft.)
                      </label>
                      <input
                        type="number"
                        value={projectContext.area || ''}
                        onChange={(e) => setProjectContext(prev => ({ ...prev, area: parseInt(e.target.value) || undefined }))}
                        className="w-full border border-gray-200 rounded-lg p-2.5 focus:border-gray-400 focus:outline-none text-sm"
                        placeholder="e.g., 1500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.brand}</p>
                        {item.variant && (
                          <p className="text-xs text-orange-600 mt-1">{item.variant}</p>
                        )}
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-7 h-7 border border-gray-200 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => onUpdateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-14 h-7 border border-gray-200 rounded-lg text-center text-sm font-medium focus:border-gray-400 focus:outline-none"
                        />
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 border border-gray-200 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs text-gray-500 ml-1">{item.unit}</span>
                      </div>
                      <button
                        onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                        className="text-xs text-orange-600 font-medium hover:text-orange-700 transition-colors"
                      >
                        {expandedItem === item.id ? 'Hide Notes' : 'Add Notes'}
                      </button>
                    </div>

                    {/* Notes */}
                    {expandedItem === item.id && (
                      <div className="mt-3">
                        <textarea
                          value={item.notes || ''}
                          onChange={(e) => onUpdateNotes(item.id, e.target.value)}
                          placeholder="Add notes (e.g., fire-rated, specific color, batch preference...)"
                          className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-gray-400 focus:outline-none resize-none"
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {items.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
            {!isProjectContextComplete && (
              <div className="flex items-start gap-2 mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Please fill in project details above to submit your RFQ
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={onClearCart}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-600 text-sm font-medium hover:border-gray-400 hover:text-gray-900 transition-colors"
              >
                Clear All
              </button>
              <Link
                to="/rfq/create"
                onClick={onToggle}
                className={`flex-1 py-2.5 text-center text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  isProjectContextComplete
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
                }`}
              >
                Submit RFQ
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onToggle}
        />
      )}
    </>
  );
}

// Hook for managing quote cart state
export function useQuoteCart() {
  const [items, setItems] = useState<QuoteCartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (product: Omit<QuoteCartItem, 'id' | 'quantity'>) => {
    const existingItem = items.find(item => item.productId === product.productId);
    if (existingItem) {
      setItems(items.map(item =>
        item.productId === product.productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setItems([...items, { ...product, id: crypto.randomUUID(), quantity: 1 }]);
    }
    setIsOpen(true);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setItems(items.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const updateNotes = (itemId: string, notes: string) => {
    setItems(items.map(item =>
      item.id === itemId ? { ...item, notes } : item
    ));
  };

  const clearCart = () => {
    setItems([]);
  };

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  return {
    items,
    isOpen,
    addItem,
    updateQuantity,
    removeItem,
    updateNotes,
    clearCart,
    toggleCart,
  };
}
