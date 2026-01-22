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
        className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-neutral-900 hover:bg-neutral-800 text-white shadow-brutal flex items-center justify-center transition-all"
      >
        <ShoppingCart className="w-6 h-6" />
        {items.length > 0 && (
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-accent-500 text-white text-xs font-black flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>

      {/* Cart Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white border-l-2 border-neutral-900 shadow-2xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-neutral-900 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">Quote Cart</h2>
              <p className="text-neutral-400 text-sm mt-1">
                {items.length} {items.length === 1 ? 'product' : 'products'} • Build your RFQ
              </p>
            </div>
            <button
              onClick={onToggle}
              className="w-10 h-10 flex items-center justify-center hover:bg-neutral-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-180px)] overflow-hidden">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 bg-neutral-100 flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-neutral-400" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Your Quote Cart is Empty</h3>
              <p className="text-neutral-500 mb-6">
                Add products to start building your RFQ. Dealers will compete to give you the best price.
              </p>
              <Link
                to="/categories"
                onClick={onToggle}
                className="btn-urgent"
              >
                Browse Products
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          ) : (
            <>
              {/* Project Context Section */}
              <div className="border-b-2 border-neutral-200 p-4">
                <button
                  onClick={() => setShowProjectForm(!showProjectForm)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 flex items-center justify-center ${isProjectContextComplete ? 'bg-success-100' : 'bg-warning-100'}`}>
                      <MapPin className={`w-5 h-5 ${isProjectContextComplete ? 'text-success-600' : 'text-warning-600'}`} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-neutral-900">Project Details</p>
                      <p className="text-sm text-neutral-500">
                        {isProjectContextComplete
                          ? `${projectTypes.find(t => t.value === projectContext.type)?.label} • ${projectContext.city}`
                          : 'Required for accurate quotes'}
                      </p>
                    </div>
                  </div>
                  {showProjectForm ? (
                    <ChevronUp className="w-5 h-5 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-neutral-400" />
                  )}
                </button>

                {showProjectForm && (
                  <div className="mt-4 space-y-4">
                    {/* Project Type */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                        Project Type *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {projectTypes.map((type) => {
                          const Icon = type.icon;
                          return (
                            <button
                              key={type.value}
                              onClick={() => setProjectContext(prev => ({ ...prev, type: type.value as ProjectContext['type'] }))}
                              className={`p-3 border-2 text-left flex items-center gap-2 transition-all ${
                                projectContext.type === type.value
                                  ? 'border-neutral-900 bg-neutral-50'
                                  : 'border-neutral-200 hover:border-neutral-400'
                              }`}
                            >
                              <Icon className="w-4 h-4 text-neutral-600" />
                              <span className="text-sm font-medium">{type.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          value={projectContext.city}
                          onChange={(e) => setProjectContext(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full border-2 border-neutral-200 p-3 focus:border-neutral-900 focus:outline-none text-sm"
                          placeholder="e.g., Mumbai"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          value={projectContext.pincode}
                          onChange={(e) => setProjectContext(prev => ({ ...prev, pincode: e.target.value }))}
                          className="w-full border-2 border-neutral-200 p-3 focus:border-neutral-900 focus:outline-none text-sm"
                          placeholder="e.g., 400001"
                          maxLength={6}
                        />
                      </div>
                    </div>

                    {/* Delivery Timeline */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                        Expected Delivery
                      </label>
                      <input
                        type="date"
                        value={projectContext.deliveryDate || ''}
                        onChange={(e) => setProjectContext(prev => ({ ...prev, deliveryDate: e.target.value }))}
                        className="w-full border-2 border-neutral-200 p-3 focus:border-neutral-900 focus:outline-none text-sm"
                      />
                    </div>

                    {/* Built-up Area */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                        Built-up Area (sq.ft.)
                      </label>
                      <input
                        type="number"
                        value={projectContext.area || ''}
                        onChange={(e) => setProjectContext(prev => ({ ...prev, area: parseInt(e.target.value) || undefined }))}
                        className="w-full border-2 border-neutral-200 p-3 focus:border-neutral-900 focus:outline-none text-sm"
                        placeholder="e.g., 1500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="border-2 border-neutral-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-bold text-neutral-900">{item.name}</p>
                        <p className="text-sm text-neutral-500">{item.brand}</p>
                        {item.variant && (
                          <p className="text-xs text-accent-600 mt-1">{item.variant}</p>
                        )}
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-neutral-400 hover:text-error-600 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 border-2 border-neutral-200 flex items-center justify-center hover:border-neutral-900 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => onUpdateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 h-8 border-2 border-neutral-200 text-center font-bold focus:border-neutral-900 focus:outline-none"
                        />
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 border-2 border-neutral-200 flex items-center justify-center hover:border-neutral-900 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-neutral-500 ml-2">{item.unit}</span>
                      </div>
                      <button
                        onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                        className="text-sm text-accent-600 font-semibold"
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
                          className="w-full border-2 border-neutral-200 p-3 text-sm focus:border-neutral-900 focus:outline-none resize-none"
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
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-neutral-200 p-4">
            {!isProjectContextComplete && (
              <div className="flex items-start gap-2 mb-4 p-3 bg-warning-50 border border-warning-200">
                <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-warning-800">
                  Please fill in project details above to submit your RFQ
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={onClearCart}
                className="flex-1 py-3 border-2 border-neutral-200 text-neutral-600 font-bold hover:border-neutral-900 hover:text-neutral-900 transition-colors"
              >
                Clear All
              </button>
              <Link
                to="/rfq/create"
                onClick={onToggle}
                className={`flex-1 py-3 text-center font-bold transition-colors flex items-center justify-center gap-2 ${
                  isProjectContextComplete
                    ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed pointer-events-none'
                }`}
              >
                Submit RFQ
                <ArrowRight className="w-5 h-5" />
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
