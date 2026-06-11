import { useState, useEffect } from 'react';
import type { Dish } from './types/Dish';
import type { Product } from './types/Product';
import { io } from 'socket.io-client';
import type { Recipe } from './types/Recipe';
import type { Category } from './types/Category';
import type { Supplier } from './types/Supplier';
import type { DishType } from './types/DishType';
import type { Supply } from './types/Supply';
import type { SupplyDetail } from './types/SupplyDetail';
import type { Position } from './types/Position';
import type { Client } from './types/Client';
import type { Status } from './types/Status';
import type { Employee } from './types/Employee';
import type { EmployeePosition } from './types/EmployeePosition';
import type { Order } from './types/Order';
import type { OrderDetail } from './types/OrderDetail';
import type { Transaction } from './types/Transaction';
import './App.css';
import GalleryController from './components/GalleryController';

const API_URL = 'http://localhost:3001';
// Prevent automatic backend calls during frontend-only testing
const USE_BACKEND = false;

type TabType =
  | 'products'
  | 'dishes'
  | 'orders'
  | 'employees'
  | 'supplies'
  | 'transactions'
  | 'recipes'
  | 'categories'
  | 'suppliers'
  | 'dishTypes'
  | 'positions'
  | 'clients'
  | 'statuses'
  | 'reports'
  | 'stats'
  | 'gallery'
  | 'sql';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('products');

  const [products, setProducts] = useState<Product[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [dishTypes, setDishTypes] = useState<DishType[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [supplyDetails, setSupplyDetails] = useState<SupplyDetail[]>([]);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [userVisitCount, setUserVisitCount] = useState(0);

  const [productSearch, setProductSearch] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [productSort, setProductSort] = useState('name');
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [productSuppliers, setProductSuppliers] = useState<number[]>([]);
  const [productPriceRange, setProductPriceRange] = useState({
    min: '',
    max: '',
  });

  const [dishSearch, setDishSearch] = useState('');
  const [dishSort, setDishSort] = useState('name');
  const [selectedDishTypes, setSelectedDishTypes] = useState<number[]>([]);
  const [dishPriceRange, setDishPriceRange] = useState({ min: '', max: '' });
  const [dishCaloriesRange, setDishCaloriesRange] = useState({
    min: '',
    max: '',
  });

  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('');
  const [orderSort, setOrderSort] = useState('order_id');
  const [orderStatuses, setOrderStatuses] = useState<number[]>([]);
  const [orderDateRange, setOrderDateRange] = useState({ start: '', end: '' });

  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [employeeSort, setEmployeeSort] = useState('full_name');

  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResult, setQueryResult] = useState<
    Record<string, unknown>[] | null
  >(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const [salesReport, setSalesReport] = useState<any[]>([]);
  const [clientReport, setClientReport] = useState<any>(null);
  const [supplyReport, setSupplyReport] = useState<any[]>([]);
  const [supplyLoading, setSupplyLoading] = useState<boolean>(false);
  const [financialReport, setFinancialReport] = useState<any>(null);
  const [orderCheck, setOrderCheck] = useState<any>(null);
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const [topDishes, setTopDishes] = useState<any[]>([]);
  const [employeePerformance, setEmployeePerformance] = useState<any[]>([]);
  const [clientLoyalty, setClientLoyalty] = useState<any[]>([]);
  const [productUsage, setProductUsage] = useState<any[]>([]);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingDishType, setEditingDishType] = useState<DishType | null>(null);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingStatus, setEditingStatus] = useState<Status | null>(null);
  const [editingSupplyDetail, setEditingSupplyDetail] =
    useState<SupplyDetail | null>(null);
  const [editingOrderDetail, setEditingOrderDetail] =
    useState<OrderDetail | null>(null);

  const [showProductForm, setShowProductForm] = useState(false);
  const [showDishForm, setShowDishForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderFormItems, setOrderFormItems] = useState<
    {
      dish_id: number;
      quantity_of_dishes: number;
      note?: string | null;
    }[]
  >([]);
  const [orderFormDishSelection, setOrderFormDishSelection] = useState<{
    dish_id: number | null;
    quantity_of_dishes: number;
    note?: string;
  }>({ dish_id: null, quantity_of_dishes: 1, note: '' });
  const [orderFormShortages, setOrderFormShortages] = useState<any[]>([]);

  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showSupplyForm, setShowSupplyForm] = useState(false);
  const [supplyFormItems, setSupplyFormItems] = useState<
    {
      product_id: number;
      quantity_grams: number;
      expiration_date?: string | null;
    }[]
  >([]);
  const [supplyFormSelection, setSupplyFormSelection] = useState<{
    product_id: number | null;
    quantity_grams: number;
    expiration_date?: string;
  }>({ product_id: null, quantity_grams: 0, expiration_date: '' });

  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<
    'order' | 'supply' | null
  >(null);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showDishTypeForm, setShowDishTypeForm] = useState(false);
  const [showPositionForm, setShowPositionForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [showSupplyDetailForm, setShowSupplyDetailForm] = useState(false);
  const [showOrderDetailForm, setShowOrderDetailForm] = useState(false);

  const [selectedSupplyForDetails, setSelectedSupplyForDetails] = useState<
    number | null
  >(null);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<
    number | null
  >(null);
  const [selectedDishForRecipes, setSelectedDishForRecipes] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (USE_BACKEND) {
      loadAllData();
      trackVisit();
    }
  }, []);

  useEffect(() => {
    if (!USE_BACKEND) return;
    const socket = io(API_URL);

    socket.on('product_updated', (data) => {
      alert('🔔 Сповіщення в реальному часі: ' + data.message);
      loadProducts();
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  // -

  useEffect(() => {
    if (activeTab === 'reports') {
      loadSalesReport();
      loadSupplyReport();
      loadFinancialReport();
    }
  }, []);

  const loadAllData = () => {
    loadProducts();
    loadDishes();
    loadOrders();
    loadEmployees();
    loadSupplies();
    loadTransactions();
    loadRecipes();
    loadCategories();
    loadSuppliers();
    loadDishTypes();
    loadPositions();
    loadClients();
    loadStatuses();
  };

  const trackVisit = () => {
    fetch(`${API_URL}/stats/visit`)
      .then((r) => r.json())
      .then((data) => {
        if (data.count) {
          setUserVisitCount(data.count);
        }
      })
      .catch(console.error);
  };

  const loadProducts = () => {
    fetch(`${API_URL}/products`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then(setProducts)
      .catch((e) => {
        alert('Помилка завантаження продуктів: ' + (e.message || e));
        setProducts([]);
      });
  };

  const loadDishes = () => {
    fetch(`${API_URL}/dishes`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then(setDishes)
      .catch((e) => {
        alert('Помилка завантаження страв: ' + (e.message || e));
        setDishes([]);
      });
  };

  const loadOrders = () => {
    fetch(`${API_URL}/orders`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then(setOrders)
      .catch((e) => {
        alert('Помилка завантаження замовлень: ' + (e.message || e));
        setOrders([]);
      });
  };

  const loadEmployees = () => {
    fetch(`${API_URL}/employees`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then(setEmployees)
      .catch((e) => {
        alert('Помилка завантаження співробітників: ' + (e.message || e));
        setEmployees([]);
      });
  };

  const loadSupplies = () => {
    fetch(`${API_URL}/supplies`)
      .then((r) => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setSupplies(data);
        } else {
          console.error('Invalid data format:', data);
          setSupplies([]);
        }
      })
      .catch((error) => {
        console.error('Error loading supplies:', error);
        alert('Помилка завантаження поставок: ' + error.message);
        setSupplies([]);
      });
  };

  const loadTransactions = () => {
    fetch(`${API_URL}/transactions`)
      .then((r) => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setTransactions(data);
        } else {
          console.error('Invalid data format:', data);
          setTransactions([]);
        }
      })
      .catch((error) => {
        console.error('Error loading transactions:', error);
        alert('Помилка завантаження транзакцій: ' + error.message);
        setTransactions([]);
      });
  };

  const loadRecipes = () => {
    fetch(`${API_URL}/recipes`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then(setRecipes)
      .catch((e) => {
        alert('Помилка завантаження рецептів: ' + (e.message || e));
        setRecipes([]);
      });
  };

  const loadCategories = () => {
    fetch(`${API_URL}/categories`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then(setCategories)
      .catch((e) => {
        alert('Помилка завантаження категорій: ' + (e.message || e));
        setCategories([]);
      });
  };

  const loadSuppliers = () => {
    fetch(`${API_URL}/suppliers`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then(setSuppliers)
      .catch((e) => {
        alert('Помилка завантаження постачальників: ' + (e.message || e));
        setSuppliers([]);
      });
  };

  const loadDishTypes = () => {
    fetch(`${API_URL}/dishTypes`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then(setDishTypes)
      .catch((e) => {
        alert('Помилка завантаження типів страв: ' + (e.message || e));
        setDishTypes([]);
      });
  };

  const loadPositions = () => {
    fetch(`${API_URL}/positions`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then(setPositions)
      .catch((e) => {
        alert('Помилка завантаження посад: ' + (e.message || e));
        setPositions([]);
      });
  };

  const loadClients = () => {
    fetch(`${API_URL}/clients`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then(setClients)
      .catch((e) => {
        alert('Помилка завантаження клієнтів: ' + (e.message || e));
        setClients([]);
      });
  };

  const loadStatuses = () => {
    fetch(`${API_URL}/statuses`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then(setStatuses)
      .catch((e) => {
        alert('Помилка завантаження статусів: ' + (e.message || e));
        setStatuses([]);
      });
  };

  const loadSupplyDetails = (supplyId: number) => {
    fetch(`${API_URL}/supplyDetails/supply/${supplyId}`)
      .then((r) => r.json())
      .then(setSupplyDetails)
      .catch(console.error);
  };

  const loadOrderDetails = (orderId: number) => {
    fetch(`${API_URL}/orderDetails/order/${orderId}`)
      .then((r) => r.json())
      .then(setOrderDetails)
      .catch(console.error);
  };

  const loadRecipesByDish = (dishId: number) => {
    fetch(`${API_URL}/recipes/dish/${dishId}`)
      .then((r) => r.json())
      .then(setRecipes)
      .catch(console.error);
  };

  const loadSalesReport = () => {
    const params = new URLSearchParams();
    if (reportStartDate) params.append('startDate', reportStartDate);
    if (reportEndDate) params.append('endDate', reportEndDate);
    fetch(`${API_URL}/reports/sales?${params}`)
      .then((r) => r.json())
      .then(setSalesReport)
      .catch(console.error);
  };

  const loadClientReport = (clientId: number) => {
    fetch(`${API_URL}/reports/client/${clientId}`)
      .then((r) => r.json())
      .then(setClientReport)
      .catch(console.error);
  };

  const loadSupplyReport = async () => {
    setSupplyLoading(true);
    try {
      const params = new URLSearchParams();
      if (reportStartDate) params.append('startDate', reportStartDate);
      if (reportEndDate) params.append('endDate', reportEndDate);
      const res = await fetch(`${API_URL}/reports/supplies?${params}`);
      if (!res.ok) {
        console.error('Failed to load supplies report', res.status);
        setSupplyReport([]);
        return;
      }
      const data = await res.json();
      setSupplyReport(data || []);
    } catch (e) {
      console.error(e);
      setSupplyReport([]);
    } finally {
      setSupplyLoading(false);
    }
  };

  const loadFinancialReport = () => {
    const params = new URLSearchParams();
    if (reportStartDate) params.append('startDate', reportStartDate);
    if (reportEndDate) params.append('endDate', reportEndDate);
    fetch(`${API_URL}/reports/financial?${params}`)
      .then((r) => r.json())
      .then(setFinancialReport)
      .catch(console.error);
  };

  const loadOrderCheck = (orderId: number) => {
    fetch(`${API_URL}/reports/check/${orderId}`)
      .then((r) => r.json())
      .then(setOrderCheck)
      .catch(console.error);
  };

  const loadTopDishes = () => {
    fetch(`${API_URL}/stats/top-dishes`)
      .then((r) => r.json())
      .then(setTopDishes)
      .catch(console.error);
  };

  const loadEmployeePerformance = () => {
    fetch(`${API_URL}/stats/employee-performance`)
      .then((r) => r.json())
      .then(setEmployeePerformance)
      .catch(console.error);
  };

  const loadClientLoyalty = () => {
    fetch(`${API_URL}/stats/client-loyalty`)
      .then((r) => r.json())
      .then(setClientLoyalty)
      .catch(console.error);
  };

  const loadProductUsage = () => {
    fetch(`${API_URL}/stats/product-usage`)
      .then((r) => r.json())
      .then(setProductUsage)
      .catch(console.error);
  };

  const executeSqlQuery = async () => {
    if (!sqlQuery.trim()) {
      alert('Введіть SQL запит');
      return;
    }
    setIsExecuting(true);
    setQueryError(null);
    setQueryResult(null);
    try {
      const response = await fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sqlQuery }),
      });
      const data = await response.json();
      if (!response.ok) {
        setQueryError(data.error || data.message || 'Помилка виконання запиту');
      } else {
        setQueryResult(data.data || []);
      }
    } catch (error: any) {
      setQueryError(error.message || 'Помилка виконання запиту');
    } finally {
      setIsExecuting(false);
    }
  };

  const filteredAndSortedProducts = () => {
    const filtered = products.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(productSearch.toLowerCase());
      const matchesCategory =
        productCategories.length === 0 ||
        (p.name_product_category &&
          productCategories.includes(p.name_product_category));
      const matchesSupplier =
        productSuppliers.length === 0 ||
        (p.supplier_id && productSuppliers.includes(p.supplier_id));
      const matchesPriceMin =
        productPriceRange.min === '' ||
        (p.supplier_price &&
          p.supplier_price >= parseFloat(productPriceRange.min));
      const matchesPriceMax =
        productPriceRange.max === '' ||
        (p.supplier_price &&
          p.supplier_price <= parseFloat(productPriceRange.max));
      return (
        matchesSearch &&
        matchesCategory &&
        matchesSupplier &&
        matchesPriceMin &&
        matchesPriceMax
      );
    });
    return filtered.sort((a, b) => {
      if (productSort === 'name') return a.name.localeCompare(b.name);
      if (productSort === 'price')
        return (a.supplier_price || 0) - (b.supplier_price || 0);
      return 0;
    });
  };

  const filteredAndSortedDishes = () => {
    const filtered = dishes.filter((d) => {
      const matchesSearch = d.name
        .toLowerCase()
        .includes(dishSearch.toLowerCase());
      const matchesType =
        selectedDishTypes.length === 0 ||
        (d.dish_type_id && selectedDishTypes.includes(d.dish_type_id));
      const matchesPriceMin =
        dishPriceRange.min === '' ||
        (d.price_for_client &&
          d.price_for_client >= parseFloat(dishPriceRange.min));
      const matchesPriceMax =
        dishPriceRange.max === '' ||
        (d.price_for_client &&
          d.price_for_client <= parseFloat(dishPriceRange.max));
      const matchesCaloriesMin =
        dishCaloriesRange.min === '' ||
        (d.calories && d.calories >= parseInt(dishCaloriesRange.min));
      const matchesCaloriesMax =
        dishCaloriesRange.max === '' ||
        (d.calories && d.calories <= parseInt(dishCaloriesRange.max));
      return (
        matchesSearch &&
        matchesType &&
        matchesPriceMin &&
        matchesPriceMax &&
        matchesCaloriesMin &&
        matchesCaloriesMax
      );
    });
    return filtered.sort((a, b) => {
      if (dishSort === 'name') return a.name.localeCompare(b.name);
      if (dishSort === 'price')
        return (a.price_for_client || 0) - (b.price_for_client || 0);
      if (dishSort === 'calories') return (a.calories || 0) - (b.calories || 0);
      return 0;
    });
  };

  const filteredAndSortedOrders = () => {
    const filtered = orders.filter((o) => {
      const matchesSearch =
        o.client_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.order_id.toString().includes(orderSearch);
      const matchesStatus =
        orderStatuses.length === 0 ||
        (o.status_id && orderStatuses.includes(o.status_id));
      const matchesDateStart =
        orderDateRange.start === '' ||
        (o.order_date &&
          new Date(o.order_date) >= new Date(orderDateRange.start));
      const matchesDateEnd =
        orderDateRange.end === '' ||
        (o.order_date &&
          new Date(o.order_date) <= new Date(orderDateRange.end + 'T23:59:59'));
      return (
        matchesSearch && matchesStatus && matchesDateStart && matchesDateEnd
      );
    });
    return filtered.sort((a, b) => {
      if (orderSort === 'order_id') return b.order_id - a.order_id;
      if (orderSort === 'date')
        return (
          new Date(b.order_date || '').getTime() -
          new Date(a.order_date || '').getTime()
        );
      return 0;
    });
  };

  const filteredAndSortedEmployees = () => {
    const filtered = employees.filter(
      (e) =>
        e.full_name.toLowerCase().includes(employeeSearch.toLowerCase()) &&
        (employeeFilter === '' || e.position_name === employeeFilter),
    );
    return filtered.sort((a, b) => {
      if (employeeSort === 'full_name')
        return a.full_name.localeCompare(b.full_name);
      if (employeeSort === 'age') return (a.age || 0) - (b.age || 0);
      if (employeeSort === 'experience')
        return (b.work_experience_years || 0) - (a.work_experience_years || 0);
      return 0;
    });
  };

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const priceString = formData.get('supplier_price') as string;
    const priceRegex = /^\d+(\.\d{1,2})?$/;

    if (priceString && !priceRegex.test(priceString)) {
      alert(
        'Помилка: Ціна має бути числом у форматі 0.00 (наприклад: 15.50 або 200).',
      );
      return;
    }

    const data = {
      name: formData.get('name') as string,
      quantity_grams:
        parseInt(formData.get('quantity_grams') as string) || null,
      supplier_id: parseInt(formData.get('supplier_id') as string) || null,
      supplier_price:
        parseFloat(formData.get('supplier_price') as string) || null,
      product_category_id:
        parseInt(formData.get('product_category_id') as string) || null,
    };
    try {
      if (editingProduct) {
        await fetch(`${API_URL}/products/${editingProduct.product_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else {
        await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
      loadProducts();
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (error) {
      alert('Помилка збереження продукту');
    }
  };

  const handleDishSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      weight_grams: parseInt(formData.get('weight_grams') as string) || null,
      price_for_client:
        parseFloat(formData.get('price_for_client') as string) || null,
      recipe_description:
        (formData.get('recipe_description') as string) || null,
      dish_type_id: parseInt(formData.get('dish_type_id') as string) || null,
      preparation_time_minutes:
        parseInt(formData.get('preparation_time_minutes') as string) || null,
      calories: parseInt(formData.get('calories') as string) || null,
    };
    try {
      if (editingDish) {
        await fetch(`${API_URL}/dishes/${editingDish.dish_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else {
        await fetch(`${API_URL}/dishes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
      loadDishes();
      setShowDishForm(false);
      setEditingDish(null);
    } catch (error) {
      alert('Помилка збереження страви');
    }
  };

  const checkItemsAvailability = async (
    items: { dish_id: number; quantity_of_dishes: number }[],
  ) => {
    if (editingOrder) {
      try {
        const res = await fetch(
          `${API_URL}/orderDetails/order/${editingOrder.order_id}/availability`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items }),
          },
        );
        if (!res.ok)
          return [
            {
              dish_id: -1,
              dish: 'server',
              shortages: [
                { product_name: 'unknown', required: 0, available: 0 },
              ],
            },
          ];
        const data = await res.json();
        if (!data.available) {
          return [{ dish_id: -1, dish: 'update', shortages: data.shortages }];
        }
        return [];
      } catch (e) {
        console.error(e);
        return [{ dish_id: -1, dish: 'error', shortages: [] }];
      }
    }

    const shortagesSummary: any[] = [];
    for (const it of items) {
      try {
        const res = await fetch(
          `${API_URL}/recipes/availability?dishId=${it.dish_id}&qty=${it.quantity_of_dishes}`,
        );
        if (!res.ok) {
          continue;
        }
        const data = await res.json();
        if (!data.available) {
          shortagesSummary.push({
            dish_id: it.dish_id,
            dish: dishes.find((d) => d.dish_id === it.dish_id)?.name || '-',
            shortages: data.shortages,
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
    return shortagesSummary;
  };

  const formatShortages = (shortages: any[]) => {
    return shortages
      .map((s: any) => {
        const shMsg = (s.shortages || [])
          .map(
            (sh: any) =>
              `${sh.product_name} (потрібно ${sh.required}, є ${sh.available})`,
          )
          .join('; ');
        return `${s.dish}: ${shMsg}`;
      })
      .join(' | ');
  };

  const handleOrderSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {
      order_date:
        (formData.get('order_date') as string) || new Date().toISOString(),
      client_id: parseInt(formData.get('client_id') as string) || null,
      employee_id: parseInt(formData.get('employee_id') as string) || null,
      status_id: parseInt(formData.get('status_id') as string) || null,
      delivery_address: (formData.get('delivery_address') as string) || null,
    };

    if (orderFormItems.length > 0) {
      data.order_items = orderFormItems;
    }

    try {
      if (orderFormItems.length > 0) {
        if (editingOrder) {
          try {
            const resp = await fetch(
              `${API_URL}/orderDetails/order/${editingOrder.order_id}/availability`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: orderFormItems }),
              },
            );
            if (!resp.ok) {
              const err = await resp.json().catch(() => ({}));
              if (err && err.shortages) {
                const msg = err.shortages
                  .map(
                    (sh: any) =>
                      `${sh.product_name} (потрібно ${sh.required}, є ${sh.available})`,
                  )
                  .join('; ');
                alert('Недостатньо продуктів при оновленні замовлення: ' + msg);
                return;
              }
            } else {
              const dataCheck = await resp.json();
              if (!dataCheck.available) {
                const msg = (dataCheck.shortages || [])
                  .map(
                    (sh: any) =>
                      `${sh.product_name} (потрібно ${sh.required}, є ${sh.available})`,
                  )
                  .join('; ');
                alert('Недостатньо продуктів при оновленні замовлення: ' + msg);
                return;
              }
            }
          } catch (e) {
            console.error(e);
          }
        } else {
          const shortages = await checkItemsAvailability(orderFormItems);
          if (shortages.length > 0) {
            const msg = formatShortages(shortages);
            alert('Недостатньо продуктів для деяких позицій: ' + msg);
            return;
          }
        }
      }

      if (editingOrder) {
        await fetch(`${API_URL}/orders/${editingOrder.order_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (orderFormItems.length > 0) {
          const resp = await fetch(
            `${API_URL}/orderDetails/order/${editingOrder.order_id}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: orderFormItems }),
            },
          );
          if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            if (err && err.shortages) {
              alert(
                'Сервер: недостатньо продуктів для оновлення замовлення: ' +
                  JSON.stringify(err.shortages),
              );
              return;
            }
          }
        } else {
          await fetch(
            `${API_URL}/orderDetails/order/${editingOrder.order_id}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: [] }),
            },
          );
        }
      } else {
        const res = await fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          setOrderFormItems([]);
          setOrderFormDishSelection({
            dish_id: null,
            quantity_of_dishes: 1,
            note: '',
          });
        } else {
          const err = await res.json().catch(() => ({}));
          if (err && err.shortages) {
            alert(
              'Сервер: недостатньо продуктів для замовлення. ' +
                JSON.stringify(err.shortages),
            );
            return;
          }
        }
      }

      loadOrders();
      loadTransactions();
      loadProducts();
      setShowOrderForm(false);
      setEditingOrder(null);
      setOrderFormItems([]);
    } catch (error) {
      alert('Помилка збереження замовлення');
    }
  };

  const handleEmployeeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const phone = formData.get('phone') as string;
    const phoneRegex = /^(?:\+380|0)\d{9}$/;

    if (phone && !phoneRegex.test(phone)) {
      alert(
        'Помилка: Невірний формат телефону! Введіть номер у форматі +380XXXXXXXXX або 0XXXXXXXXX.',
      );
      return;
    }

    const emaiulklk = нгData.get('employee_email') as string;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email && !emailRegex.test(email)) {
      alert(
        'Помилка: Невірний формат електронної пошти (приклад: ivan@test.com).',
      );
      return;
    }

    const passport = formData.get('passport') as string;
    const passportRegex = /^([A-ZА-ЯІЇЄҐ]{2}\d{6}|\d{9})$/i;
    if (passport && !passportRegex.test(passport)) {
      alert(
        'Помилка: Невірний формат паспорта! Введіть серію та номер (наприклад: АВ123456) або 9 цифр ID-картки.',
      );
      return;
    }
    const data = {
      full_name: formData.get('full_name') as string,

      passport: (formData.get('passport') as string) || null,
      phone: (formData.get('phone') as string) || null,
      age: parseInt(formData.get('age') as string) || null,
      position: (formData.get('position') as string) || null,
      employee_email: (formData.get('employee_email') as string) || null,
      employee_address: (formData.get('employee_address') as string) || null,
      position_id: parseInt(formData.get('position_id') as string) || null,
      hire_date: (formData.get('hire_date') as string) || null,
      work_experience_years:
        parseInt(formData.get('work_experience_years') as string) || null,
    };
    try {
      if (editingEmployee) {
        await fetch(`${API_URL}/employees/${editingEmployee.employee_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else {
        await fetch(`${API_URL}/employees`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
      loadEmployees();
      setShowEmployeeForm(false);
      setEditingEmployee(null);
    } catch (error) {
      alert('Помилка збереження співробітника');
    }
  };

  const handleDelete = async (
    url: string,
    id: number,
    reloadFn: () => void,
  ) => {
    if (!confirm('Ви впевнені, що хочете видалити?')) return;
    try {
      const res = await fetch(`${API_URL}${url}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Помилка видалення');
        return;
      }
      reloadFn();
    } catch (error: any) {
      alert('Помилка видалення: ' + (error.message || error));
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Система управління рестораном</h1>

      {userVisitCount > 0 && (
        <div
          style={{
            display: 'inline-block',
            marginBottom: '20px',
            padding: '10px 16px',
            backgroundColor: '#f0f4ff',
            color: '#1f4eb8',
            borderRadius: '18px',
            fontWeight: 600,
          }}
        >
          👁️ Ви відвідали цю сторінку: {userVisitCount} разів
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '20px',
        }}
      >
        <button
          onClick={() => setActiveTab('products')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'products' ? '#4CAF50' : '#ddd',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Продукти
        </button>
        <button
          onClick={() => setActiveTab('dishes')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'dishes' ? '#4CAF50' : '#ddd',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Страви
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'orders' ? '#4CAF50' : '#ddd',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Замовлення
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'employees' ? '#4CAF50' : '#ddd',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Співробітники
        </button>
        <button
          onClick={() => setActiveTab('supplies')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'supplies' ? '#4CAF50' : '#ddd',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Поставки
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'transactions' ? '#4CAF50' : '#ddd',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Транзакції
        </button>
        <button
          onClick={() => setActiveTab('recipes')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'recipes' ? '#4CAF50' : '#ddd',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Рецепти
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'gallery' ? '#4CAF50' : '#ddd',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Фотогалерея
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'categories' ? '#4CAF50' : '#ddd',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Категорії
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'suppliers' ? '#4CAF50' : '#ddd',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Постачальники
        </button>
        <button
          onClick={() => setActiveTab('dishTypes')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'dishTypes' ? '#4CAF50' : '#ddd',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Типи страв
        </button>
        <button
          onClick={() => setActiveTab('positions')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'positions' ? '#4CAF50' : '#ddd',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Посади
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'clients' ? '#4CAF50' : '#ddd',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Клієнти
        </button>
        <button
          onClick={() => setActiveTab('statuses')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'statuses' ? '#4CAF50' : '#ddd',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Статуси
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'reports' ? '#4CAF50' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Звіти
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'stats' ? '#4CAF50' : '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Статистика
        </button>
        <button
          onClick={() => {
            setActiveTab('sql');
            setSqlQuery('SELECT * FROM Dishes LIMIT 10');
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'sql' ? '#4CAF50' : '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          SQL Редактор
        </button>
      </div>

      <hr />

      {activeTab === 'products' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <h2>Продукти</h2>
            <button
              onClick={() => {
                setShowProductForm(!showProductForm);
                setEditingProduct(null);
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {showProductForm ? 'Скасувати' : '+ Додати'}
            </button>
          </div>

          <div
            style={{
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                marginBottom: '15px',
              }}
            >
              <input
                type="text"
                placeholder="Пошук за назвою..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                style={{
                  padding: '8px',
                  width: '200px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                }}
              />
              <select
                value={productSort}
                onChange={(e) => setProductSort(e.target.value)}
                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                }}
              >
                <option value="name">Сортувати за назвою</option>
                <option value="price">Сортувати за ціною</option>
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Категорії:</strong>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  marginTop: '5px',
                }}
              >
                {[
                  ...new Set(
                    products
                      .map((p) => p.name_product_category)
                      .filter(Boolean),
                  ),
                ].map((cat) => (
                  <label
                    key={cat}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={productCategories.includes(cat)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setProductCategories([...productCategories, cat]);
                        } else {
                          setProductCategories(
                            productCategories.filter((c) => c !== cat),
                          );
                        }
                      }}
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Постачальники:</strong>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  marginTop: '5px',
                }}
              >
                {suppliers.map((s) => (
                  <label
                    key={s.supplier_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={productSuppliers.includes(s.supplier_id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setProductSuppliers([
                            ...productSuppliers,
                            s.supplier_id,
                          ]);
                        } else {
                          setProductSuppliers(
                            productSuppliers.filter(
                              (id) => id !== s.supplier_id,
                            ),
                          );
                        }
                      }}
                    />
                    <span>{s.full_name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Діапазон цін (грн):</strong>
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '5px',
                  alignItems: 'center',
                }}
              >
                <input
                  type="number"
                  placeholder="Від"
                  value={productPriceRange.min}
                  onChange={(e) =>
                    setProductPriceRange({
                      ...productPriceRange,
                      min: e.target.value,
                    })
                  }
                  style={{
                    padding: '8px',
                    width: '120px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                  }}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="До"
                  value={productPriceRange.max}
                  onChange={(e) =>
                    setProductPriceRange({
                      ...productPriceRange,
                      max: e.target.value,
                    })
                  }
                  style={{
                    padding: '8px',
                    width: '120px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                  }}
                />
                <button
                  onClick={() => setProductPriceRange({ min: '', max: '' })}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: '#757575',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Очистити
                </button>
              </div>
            </div>
          </div>

          {showProductForm && (
            <form
              onSubmit={handleProductSubmit}
              style={{
                marginBottom: '20px',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <h3>{editingProduct ? 'Редагувати' : 'Додати продукт'}</h3>
              <div style={{ marginBottom: '10px' }}>
                <label>Назва: </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingProduct?.name || ''}
                  required
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Кількість (г): </label>
                <input
                  type="number"
                  name="quantity_grams"
                  defaultValue={editingProduct?.quantity_grams || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Постачальник: </label>
                <select
                  name="supplier_id"
                  defaultValue={editingProduct?.supplier_id || ''}
                  style={{ width: '300px', padding: '5px' }}
                >
                  <option value="">Виберіть</option>
                  {suppliers.map((s) => (
                    <option key={s.supplier_id} value={s.supplier_id}>
                      {s.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Ціна постачальника: </label>
                <input
                  type="number"
                  step="0.01"
                  name="supplier_price"
                  defaultValue={editingProduct?.supplier_price || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Категорія: </label>
                <select
                  name="product_category_id"
                  defaultValue={editingProduct?.product_category_id || ''}
                  style={{ width: '300px', padding: '5px' }}
                >
                  <option value="">Виберіть</option>
                  {categories.map((c) => (
                    <option
                      key={c.product_category_id}
                      value={c.product_category_id}
                    >
                      {c.name_product_category}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {editingProduct ? 'Оновити' : 'Додати'}
              </button>
            </form>
          )}

          <table
            border={1}
            cellPadding={10}
            style={{ width: '100%', borderCollapse: 'collapse' }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th>ID</th>
                <th>Назва</th>
                <th>Кількість (г)</th>
                <th>Постачальник</th>
                <th>Ціна</th>
                <th>Категорія</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedProducts().map((p) => (
                <tr key={p.product_id}>
                  <td>{p.product_id}</td>
                  <td>
                    <b>{p.name}</b>
                  </td>
                  <td>{p.quantity_grams || '-'}</td>
                  <td>{p.supplier_name || '-'}</td>
                  <td>{p.supplier_price ? `${p.supplier_price} грн` : '-'}</td>
                  <td>{p.name_product_category || '-'}</td>
                  <td>
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setShowProductForm(true);
                      }}
                      style={{
                        marginRight: '5px',
                        padding: '5px 10px',
                        backgroundColor: '#FF9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Редагувати
                    </button>
                    <button
                      onClick={() =>
                        handleDelete('/products', p.product_id, loadProducts)
                      }
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'dishes' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <h2>Страви</h2>
            <button
              onClick={() => {
                setShowDishForm(!showDishForm);
                setEditingDish(null);
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {showDishForm ? 'Скасувати' : '+ Додати'}
            </button>
          </div>

          <div
            style={{
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                marginBottom: '15px',
              }}
            >
              <input
                type="text"
                placeholder="Пошук за назвою..."
                value={dishSearch}
                onChange={(e) => setDishSearch(e.target.value)}
                style={{
                  padding: '8px',
                  width: '200px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                }}
              />
              <select
                value={dishSort}
                onChange={(e) => setDishSort(e.target.value)}
                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                }}
              >
                <option value="name">Сортувати за назвою</option>
                <option value="price">Сортувати за ціною</option>
                <option value="calories">Сортувати за калоріями</option>
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Типи страв:</strong>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  marginTop: '5px',
                }}
              >
                {dishTypes.map((dt) => (
                  <label
                    key={dt.dish_type_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDishTypes.includes(dt.dish_type_id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDishTypes([
                            ...selectedDishTypes,
                            dt.dish_type_id,
                          ]);
                        } else {
                          setSelectedDishTypes(
                            selectedDishTypes.filter(
                              (id) => id !== dt.dish_type_id,
                            ),
                          );
                        }
                      }}
                    />
                    <span>{dt.dish_type_name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Діапазон цін (грн):</strong>
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '5px',
                  alignItems: 'center',
                }}
              >
                <input
                  type="number"
                  placeholder="Від"
                  value={dishPriceRange.min}
                  onChange={(e) =>
                    setDishPriceRange({
                      ...dishPriceRange,
                      min: e.target.value,
                    })
                  }
                  style={{
                    padding: '8px',
                    width: '120px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                  }}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="До"
                  value={dishPriceRange.max}
                  onChange={(e) =>
                    setDishPriceRange({
                      ...dishPriceRange,
                      max: e.target.value,
                    })
                  }
                  style={{
                    padding: '8px',
                    width: '120px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                  }}
                />
                <button
                  onClick={() => setDishPriceRange({ min: '', max: '' })}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: '#757575',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Очистити
                </button>
              </div>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Діапазон калорій:</strong>
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '5px',
                  alignItems: 'center',
                }}
              >
                <input
                  type="number"
                  placeholder="Від"
                  value={dishCaloriesRange.min}
                  onChange={(e) =>
                    setDishCaloriesRange({
                      ...dishCaloriesRange,
                      min: e.target.value,
                    })
                  }
                  style={{
                    padding: '8px',
                    width: '120px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                  }}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="До"
                  value={dishCaloriesRange.max}
                  onChange={(e) =>
                    setDishCaloriesRange({
                      ...dishCaloriesRange,
                      max: e.target.value,
                    })
                  }
                  style={{
                    padding: '8px',
                    width: '120px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                  }}
                />
                <button
                  onClick={() => setDishCaloriesRange({ min: '', max: '' })}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: '#757575',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Очистити
                </button>
              </div>
            </div>
          </div>

          {showDishForm && (
            <form
              onSubmit={handleDishSubmit}
              style={{
                marginBottom: '20px',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <h3>{editingDish ? 'Редагувати' : 'Додати страву'}</h3>
              <div style={{ marginBottom: '10px' }}>
                <label>Назва: </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingDish?.name || ''}
                  required
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Вага (г): </label>
                <input
                  type="number"
                  name="weight_grams"
                  defaultValue={editingDish?.weight_grams || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Ціна: </label>
                <input
                  type="number"
                  step="0.01"
                  name="price_for_client"
                  defaultValue={editingDish?.price_for_client || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Опис: </label>
                <textarea
                  name="recipe_description"
                  defaultValue={editingDish?.recipe_description || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Тип страви: </label>
                <select
                  name="dish_type_id"
                  defaultValue={editingDish?.dish_type_id || ''}
                  style={{ width: '300px', padding: '5px' }}
                >
                  <option value="">Виберіть</option>
                  {dishTypes.map((dt) => (
                    <option key={dt.dish_type_id} value={dt.dish_type_id}>
                      {dt.dish_type_name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Час приготування (хв): </label>
                <input
                  type="number"
                  name="preparation_time_minutes"
                  defaultValue={editingDish?.preparation_time_minutes || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Калорії: </label>
                <input
                  type="number"
                  name="calories"
                  defaultValue={editingDish?.calories || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {editingDish ? 'Оновити' : 'Додати'}
              </button>
            </form>
          )}

          <table
            border={1}
            cellPadding={10}
            style={{ width: '100%', borderCollapse: 'collapse' }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th>ID</th>
                <th>Назва</th>
                <th>Вага (г)</th>
                <th>Ціна</th>
                <th>Тип</th>
                <th>Час (хв)</th>
                <th>Калорії</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedDishes().map((d) => (
                <tr key={d.dish_id}>
                  <td>{d.dish_id}</td>
                  <td>
                    <b>{d.name}</b>
                  </td>
                  <td>{d.weight_grams || '-'}</td>
                  <td>
                    {d.price_for_client ? `${d.price_for_client} грн` : '-'}
                  </td>
                  <td>{d.dish_type_name || '-'}</td>
                  <td>{d.preparation_time_minutes || '-'}</td>
                  <td>{d.calories || '-'}</td>
                  <td>
                    <button
                      onClick={() => {
                        setEditingDish(d);
                        setShowDishForm(true);
                      }}
                      style={{
                        marginRight: '5px',
                        padding: '5px 10px',
                        backgroundColor: '#FF9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Редагувати
                    </button>
                    <button
                      onClick={() =>
                        handleDelete('/dishes', d.dish_id, () => {
                          loadDishes();
                          loadRecipes();
                        })
                      }
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <h2>Замовлення</h2>
            <button
              onClick={() => {
                setShowOrderForm(!showOrderForm);
                setEditingOrder(null);
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {showOrderForm ? 'Скасувати' : '+ Додати'}
            </button>
          </div>

          <div
            style={{
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                marginBottom: '15px',
              }}
            >
              <input
                type="text"
                placeholder="Пошук за клієнтом або ID..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                style={{
                  padding: '8px',
                  width: '250px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                }}
              />
              <select
                value={orderSort}
                onChange={(e) => setOrderSort(e.target.value)}
                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                }}
              >
                <option value="order_id">Сортувати за ID</option>
                <option value="date">Сортувати за датою</option>
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Статуси:</strong>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  marginTop: '5px',
                }}
              >
                {statuses.map((s) => (
                  <label
                    key={s.status_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={orderStatuses.includes(s.status_id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setOrderStatuses([...orderStatuses, s.status_id]);
                        } else {
                          setOrderStatuses(
                            orderStatuses.filter((id) => id !== s.status_id),
                          );
                        }
                      }}
                    />
                    <span>{s.status_name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Діапазон дат:</strong>
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '5px',
                  alignItems: 'center',
                }}
              >
                <input
                  type="date"
                  value={orderDateRange.start}
                  onChange={(e) =>
                    setOrderDateRange({
                      ...orderDateRange,
                      start: e.target.value,
                    })
                  }
                  style={{
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                  }}
                />
                <span>-</span>
                <input
                  type="date"
                  value={orderDateRange.end}
                  onChange={(e) =>
                    setOrderDateRange({
                      ...orderDateRange,
                      end: e.target.value,
                    })
                  }
                  style={{
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                  }}
                />
                <button
                  onClick={() => setOrderDateRange({ start: '', end: '' })}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: '#757575',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Очистити
                </button>
              </div>
            </div>
          </div>

          {showOrderForm && (
            <form
              onSubmit={handleOrderSubmit}
              style={{
                marginBottom: '20px',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <h3>{editingOrder ? 'Редагувати' : 'Додати замовлення'}</h3>
              <div style={{ marginBottom: '10px' }}>
                <label>Дата: </label>
                <input
                  type="datetime-local"
                  name="order_date"
                  defaultValue={
                    editingOrder?.order_date
                      ? editingOrder.order_date.slice(0, 16)
                      : ''
                  }
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Клієнт: </label>
                <select
                  name="client_id"
                  defaultValue={editingOrder?.client_id || ''}
                  style={{ width: '300px', padding: '5px' }}
                >
                  <option value="">Виберіть</option>
                  {clients.map((c) => (
                    <option key={c.client_id} value={c.client_id}>
                      {c.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Співробітник: </label>
                <select
                  name="employee_id"
                  defaultValue={editingOrder?.employee_id || ''}
                  style={{ width: '300px', padding: '5px' }}
                >
                  <option value="">Виберіть</option>
                  {employees.map((e) => (
                    <option key={e.employee_id} value={e.employee_id}>
                      {e.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Статус: </label>
                <select
                  name="status_id"
                  defaultValue={editingOrder?.status_id || ''}
                  style={{ width: '300px', padding: '5px' }}
                >
                  <option value="">Виберіть</option>
                  {statuses.map((s) => (
                    <option key={s.status_id} value={s.status_id}>
                      {s.status_name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Адреса доставки: </label>
                <input
                  type="text"
                  name="delivery_address"
                  defaultValue={editingOrder?.delivery_address || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>

              <div
                style={{
                  margin: '10px 0',
                  padding: '10px',
                  border: '1px solid #eee',
                }}
              >
                <h4 style={{ margin: '0 0 10px 0' }}>Позиції замовлення</h4>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <select
                    value={orderFormDishSelection.dish_id ?? ''}
                    onChange={(e) =>
                      setOrderFormDishSelection({
                        ...orderFormDishSelection,
                        dish_id: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    style={{ padding: '6px', width: '220px' }}
                  >
                    <option value="">Виберіть страву</option>
                    {dishes.map((d) => (
                      <option key={d.dish_id} value={d.dish_id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={orderFormDishSelection.quantity_of_dishes}
                    onChange={(e) =>
                      setOrderFormDishSelection({
                        ...orderFormDishSelection,
                        quantity_of_dishes: parseInt(e.target.value) || 1,
                      })
                    }
                    style={{ width: '80px', padding: '6px' }}
                  />
                  <input
                    type="text"
                    placeholder="Нотатка"
                    value={orderFormDishSelection.note}
                    onChange={(e) =>
                      setOrderFormDishSelection({
                        ...orderFormDishSelection,
                        note: e.target.value,
                      })
                    }
                    style={{ width: '200px', padding: '6px' }}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!orderFormDishSelection.dish_id)
                        return alert('Виберіть страву');
                      const newItem = {
                        dish_id: orderFormDishSelection.dish_id as number,
                        quantity_of_dishes:
                          orderFormDishSelection.quantity_of_dishes,
                        note: orderFormDishSelection.note || null,
                      };
                      const newItems = [...orderFormItems, newItem];
                      const shortages = await checkItemsAvailability(newItems);
                      if (shortages.length > 0) {
                        setOrderFormShortages(shortages);
                        alert(
                          'Недостатньо продуктів для цієї позиції або оновлення: ' +
                            shortages
                              .map((s: any) => JSON.stringify(s.shortages))
                              .join('; '),
                        );
                        return;
                      }
                      setOrderFormItems(newItems);
                      setOrderFormShortages([]);
                      setOrderFormDishSelection({
                        dish_id: null,
                        quantity_of_dishes: 1,
                        note: '',
                      });
                    }}
                    style={{ padding: '6px 10px' }}
                  >
                    Додати позицію
                  </button>
                </div>

                <ul>
                  {orderFormItems.map((it, idx) => {
                    const dish = dishes.find((d) => d.dish_id === it.dish_id);
                    return (
                      <li key={idx} style={{ marginBottom: '6px' }}>
                        {dish ? dish.name : `ID:${it.dish_id}`} - x
                        {it.quantity_of_dishes} {it.note ? `(${it.note})` : ''}
                        <button
                          type="button"
                          onClick={() =>
                            setOrderFormItems(
                              orderFormItems.filter((_, i) => i !== idx),
                            )
                          }
                          style={{ marginLeft: '8px' }}
                        >
                          Видалити
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {orderFormShortages.length > 0 && (
                  <div
                    style={{
                      background: '#fff3cd',
                      border: '1px solid #ffeeba',
                      padding: 8,
                      borderRadius: 4,
                    }}
                  >
                    <strong>Увага:</strong>
                    <ul>
                      {orderFormShortages.map((s, i) => (
                        <li key={i}>
                          {s.dish}:{' '}
                          {s.shortages
                            .map(
                              (sh: any) =>
                                `${sh.product_name} (потрібно ${sh.required}, є ${sh.available})`,
                            )
                            .join('; ')}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <button
                  type="button"
                  onClick={async () => {
                    if (orderFormItems.length === 0)
                      return alert('Додайте позиції для перевірки');
                    try {
                      if (editingOrder) {
                        const resp = await fetch(
                          `${API_URL}/orderDetails/order/${editingOrder.order_id}/availability`,
                          {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ items: orderFormItems }),
                          },
                        );
                        const data = await resp.json().catch(() => ({}));
                        if (!resp.ok || !data.available) {
                          setOrderFormShortages(data.shortages || []);
                          alert(
                            'Недостатньо продуктів: ' +
                              JSON.stringify(data.shortages || []),
                          );
                          return;
                        }
                      } else {
                        const shortages =
                          await checkItemsAvailability(orderFormItems);
                        if (shortages.length > 0) {
                          setOrderFormShortages(shortages);
                          alert('Недостатньо продуктів для деяких позицій');
                          return;
                        }
                      }
                      setOrderFormShortages([]);
                      alert('Достатньо продуктів');
                    } catch (e) {
                      console.error(e);
                      alert('Помилка перевірки доступності');
                    }
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#FFB300',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Перевірити наявність
                </button>

                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {editingOrder ? 'Оновити' : 'Додати'}
                </button>
              </div>
            </form>
          )}

          <table
            border={1}
            cellPadding={10}
            style={{ width: '100%', borderCollapse: 'collapse' }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th>ID</th>
                <th>Дата</th>
                <th>Клієнт</th>
                <th>Співробітник</th>
                <th>Статус</th>
                <th>Замовлення</th>
                <th>Сума</th>
                <th>Адреса</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedOrders().map((o) => (
                <tr key={o.order_id}>
                  <td>{o.order_id}</td>
                  <td>
                    {o.order_date
                      ? new Date(o.order_date).toLocaleString()
                      : '-'}
                  </td>
                  <td>{o.client_name || '-'}</td>
                  <td>{o.employee_name || '-'}</td>
                  <td>{o.status_name || '-'}</td>
                  <td>{o.order_items || '-'}</td>
                  <td>{parseFloat(o.total_amount || 0).toFixed(2)} грн</td>
                  <td>{o.delivery_address || '-'}</td>
                  <td>
                    <button
                      onClick={async () => {
                        setEditingOrder(o);
                        setShowOrderForm(true);
                        try {
                          const r = await fetch(
                            `${API_URL}/orderDetails/order/${o.order_id}`,
                          );
                          if (r.ok) {
                            const details = await r.json();
                            const items = details.map((d: any) => ({
                              dish_id: d.dish_id,
                              quantity_of_dishes: d.quantity_of_dishes,
                              note: d.note || '',
                            }));
                            setOrderFormItems(items);
                            try {
                              const shortages =
                                await checkItemsAvailability(items);
                              setOrderFormShortages(shortages);
                            } catch (e) {
                              console.error('availability check failed', e);
                              setOrderFormShortages([]);
                            }
                          } else {
                            setOrderFormItems([]);
                            setOrderFormShortages([]);
                          }
                        } catch (e) {
                          console.error(e);
                          setOrderFormItems([]);
                          setOrderFormShortages([]);
                        }
                      }}
                      style={{
                        marginRight: '5px',
                        padding: '5px 10px',
                        backgroundColor: '#FF9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Редагувати
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('reports');
                        setSelectedOrderId(o.order_id);
                        setTimeout(() => loadOrderCheck(o.order_id), 150);
                      }}
                      style={{
                        marginRight: '5px',
                        padding: '5px 10px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Переглянути чек
                    </button>

                    <button
                      onClick={() =>
                        handleDelete('/orders', o.order_id, () => {
                          loadOrders();
                          loadTransactions();
                          loadProducts();
                        })
                      }
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'employees' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <h2>Співробітники</h2>
            <button
              onClick={() => {
                setShowEmployeeForm(!showEmployeeForm);
                setEditingEmployee(null);
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {showEmployeeForm ? 'Скасувати' : '+ Додати'}
            </button>
          </div>

          <div
            style={{
              marginBottom: '20px',
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <input
              type="text"
              placeholder="Пошук..."
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
              style={{ padding: '8px', width: '200px' }}
            />
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              style={{ padding: '8px' }}
            >
              <option value="">Всі посади</option>
              {[
                ...new Set(
                  employees.map((e) => e.position_name).filter(Boolean),
                ),
              ].map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
            <select
              value={employeeSort}
              onChange={(e) => setEmployeeSort(e.target.value)}
              style={{ padding: '8px' }}
            >
              <option value="full_name">Сортувати за ім'ям</option>
              <option value="age">Сортувати за віком</option>
              <option value="experience">Сортувати за досвідом</option>
            </select>
          </div>

          {showEmployeeForm && (
            <form
              onSubmit={handleEmployeeSubmit}
              style={{
                marginBottom: '20px',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <h3>{editingEmployee ? 'Редагувати' : 'Додати співробітника'}</h3>
              <div style={{ marginBottom: '10px' }}>
                <label>ПІБ: </label>
                <input
                  type="text"
                  name="full_name"
                  defaultValue={editingEmployee?.full_name || ''}
                  required
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Паспорт: </label>
                <input
                  type="text"
                  name="passport"
                  defaultValue={editingEmployee?.passport || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Телефон: </label>
                <input
                  type="text"
                  name="phone"
                  defaultValue={editingEmployee?.phone || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Вік: </label>
                <input
                  type="number"
                  name="age"
                  defaultValue={editingEmployee?.age || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Посада (текст): </label>
                <input
                  type="text"
                  name="position"
                  defaultValue={editingEmployee?.position || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Email: </label>
                <input
                  type="email"
                  name="employee_email"
                  defaultValue={editingEmployee?.employee_email || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Адреса: </label>
                <input
                  type="text"
                  name="employee_address"
                  defaultValue={editingEmployee?.employee_address || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Посада: </label>
                <select
                  name="position_id"
                  defaultValue={editingEmployee?.position_id || ''}
                  style={{ width: '300px', padding: '5px' }}
                >
                  <option value="">Виберіть</option>
                  {positions.map((p) => (
                    <option key={p.position_id} value={p.position_id}>
                      {p.position_name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Дата найму: </label>
                <input
                  type="date"
                  name="hire_date"
                  defaultValue={editingEmployee?.hire_date || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Досвід (роки): </label>
                <input
                  type="number"
                  name="work_experience_years"
                  defaultValue={editingEmployee?.work_experience_years || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {editingEmployee ? 'Оновити' : 'Додати'}
              </button>
            </form>
          )}

          <table
            border={1}
            cellPadding={10}
            style={{ width: '100%', borderCollapse: 'collapse' }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th>ID</th>
                <th>ПІБ</th>
                <th>Телефон</th>
                <th>Вік</th>
                <th>Посада</th>
                <th>Досвід</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedEmployees().map((e) => (
                <tr key={e.employee_id}>
                  <td>{e.employee_id}</td>
                  <td>
                    <b>{e.full_name}</b>
                  </td>
                  <td>{e.phone || '-'}</td>
                  <td>{e.age || '-'}</td>
                  <td>{e.position_name || e.position || '-'}</td>
                  <td>
                    {e.work_experience_years
                      ? `${e.work_experience_years} років`
                      : '-'}
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setEditingEmployee(e);
                        setShowEmployeeForm(true);
                      }}
                      style={{
                        marginRight: '5px',
                        padding: '5px 10px',
                        backgroundColor: '#FF9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Редагувати
                    </button>
                    <button
                      onClick={() =>
                        handleDelete('/employees', e.employee_id, loadEmployees)
                      }
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'supplies' && (
        <div>
          <h2>Поставки</h2>
          {supplies.length === 0 && (
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Немає поставок або помилка завантаження
            </p>
          )}
          <button
            onClick={() => {
              setShowSupplyForm(!showSupplyForm);
              setEditingSupply(null);
            }}
            style={{
              marginBottom: '20px',
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {showSupplyForm ? 'Скасувати' : '+ Додати'}
          </button>
          {showSupplyForm && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  supply_data_time:
                    (formData.get('supply_data_time') as string) ||
                    new Date().toISOString(),
                };

                try {
                  if (editingSupply) {
                    await fetch(
                      `${API_URL}/supplies/${editingSupply.supply_id}`,
                      {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                      },
                    );
                  } else {
                    if (
                      !Array.isArray(supplyFormItems) ||
                      supplyFormItems.length === 0
                    ) {
                      alert('Додайте хоча б одну позицію поставки');
                      return;
                    }

                    const payload: any = {
                      supply_data_time: data.supply_data_time,
                    };
                    payload.supply_details = supplyFormItems.map((it) => ({
                      product_id: it.product_id,
                      quantity_grams: it.quantity_grams,
                      expiration_date: it.expiration_date || null,
                    }));

                    console.log('Create supply payload:', payload);
                    const res = await fetch(`${API_URL}/supplies`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    }).catch((e) => {
                      console.error('Network error while creating supply:', e);
                      alert(
                        "Мережна помилка: не вдалося зв'язатися із сервером",
                      );
                      throw e;
                    });

                    if (!res.ok) {
                      const err = await res.json().catch(() => ({}));
                      console.error('Create supply failed:', err);
                      alert(
                        err.error ||
                          err.details ||
                          JSON.stringify(err) ||
                          'Помилка створення поставки',
                      );
                      return;
                    }

                    setSupplyFormItems([]);
                    setSupplyFormSelection({
                      product_id: null,
                      quantity_grams: 0,
                      expiration_date: '',
                    });
                  }

                  loadSupplies();
                  loadTransactions();
                  loadProducts();
                  setShowSupplyForm(false);
                  setEditingSupply(null);
                } catch (error) {
                  alert('Помилка');
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              style={{
                marginBottom: '20px',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <h3>{editingSupply ? 'Редагувати' : 'Додати поставку'}</h3>
              <div style={{ marginBottom: '10px' }}>
                <label>Дата та час: </label>
                <input
                  type="datetime-local"
                  name="supply_data_time"
                  defaultValue={
                    editingSupply?.supply_data_time
                      ? editingSupply.supply_data_time.slice(0, 16)
                      : ''
                  }
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>

              <div
                style={{
                  margin: '10px 0',
                  padding: '10px',
                  border: '1px solid #eee',
                }}
              >
                <h4 style={{ margin: '0 0 10px 0' }}>Позиції поставки</h4>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <select
                    value={supplyFormSelection.product_id ?? ''}
                    onChange={(e) =>
                      setSupplyFormSelection({
                        ...supplyFormSelection,
                        product_id: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    style={{ padding: '6px', width: '220px' }}
                  >
                    <option value="">Виберіть товар</option>
                    {products.map((p) => (
                      <option key={p.product_id} value={p.product_id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={supplyFormSelection.quantity_grams || ''}
                    onChange={(e) =>
                      setSupplyFormSelection({
                        ...supplyFormSelection,
                        quantity_grams: parseInt(e.target.value) || 0,
                      })
                    }
                    style={{ width: '120px', padding: '6px' }}
                    placeholder="гр"
                  />
                  <input
                    type="date"
                    value={supplyFormSelection.expiration_date ?? ''}
                    onChange={(e) =>
                      setSupplyFormSelection({
                        ...supplyFormSelection,
                        expiration_date: e.target.value,
                      })
                    }
                    style={{ padding: '6px', width: '160px' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!supplyFormSelection.product_id)
                        return alert('Виберіть товар');
                      if (
                        !supplyFormSelection.quantity_grams ||
                        supplyFormSelection.quantity_grams <= 0
                      )
                        return alert('Вкажіть кількість');
                      setSupplyFormItems([
                        ...supplyFormItems,
                        {
                          product_id: supplyFormSelection.product_id as number,
                          quantity_grams: supplyFormSelection.quantity_grams,
                          expiration_date:
                            supplyFormSelection.expiration_date || null,
                        },
                      ]);
                      setSupplyFormSelection({
                        product_id: null,
                        quantity_grams: 0,
                        expiration_date: '',
                      });
                    }}
                    style={{ padding: '6px 10px' }}
                  >
                    Додати позицію
                  </button>
                </div>

                <ul>
                  {supplyFormItems.map((it, idx) => {
                    const prod = products.find(
                      (p) => p.product_id === it.product_id,
                    );
                    return (
                      <li key={idx} style={{ marginBottom: '6px' }}>
                        {prod ? prod.name : `ID:${it.product_id}`} -{' '}
                        {it.quantity_grams}г{' '}
                        {it.expiration_date
                          ? `(exp: ${it.expiration_date})`
                          : ''}
                        <button
                          type="button"
                          onClick={() =>
                            setSupplyFormItems(
                              supplyFormItems.filter((_, i) => i !== idx),
                            )
                          }
                          style={{ marginLeft: '8px' }}
                        >
                          Видалити
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {editingSupply ? 'Оновити' : 'Додати'}
              </button>
            </form>
          )}
          <table
            border={1}
            cellPadding={10}
            style={{ width: '100%', borderCollapse: 'collapse' }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th>ID</th>
                <th>Дата та час</th>
                <th>Товари</th>
                <th>Загальна вартість</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {supplies.map((s) => (
                <tr key={s.supply_id}>
                  <td>{s.supply_id}</td>
                  <td>
                    {s.supply_data_time
                      ? new Date(s.supply_data_time).toLocaleString()
                      : '-'}
                  </td>
                  <td>{s.supply_items || '-'}</td>
                  <td>
                    {parseFloat(s.calculated_total_price || 0).toFixed(2)} грн
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setEditingSupply(s);
                        setShowSupplyForm(true);
                      }}
                      style={{
                        marginRight: '5px',
                        padding: '5px 10px',
                        backgroundColor: '#FF9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Редагувати
                    </button>
                    <button
                      onClick={() =>
                        handleDelete('/supplies', s.supply_id, () => {
                          loadSupplies();
                          loadTransactions();
                          loadProducts();
                        })
                      }
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div>
          <h2>Транзакції</h2>
          <button
            onClick={() => {
              setShowTransactionForm(!showTransactionForm);
              setEditingTransaction(null);
              setTransactionType(null);
            }}
            style={{
              marginBottom: '20px',
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {showTransactionForm ? 'Скасувати' : '+ Додати'}
          </button>
          {showTransactionForm && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const transactionTypeValue = formData.get(
                  'transaction_type',
                ) as string;
                const isOrder = editingTransaction
                  ? editingTransaction.order_id !== null
                  : transactionTypeValue === 'order';

                const data = {
                  order_id: isOrder
                    ? parseInt(formData.get('order_id') as string) || null
                    : null,
                  supply_id: !isOrder
                    ? parseInt(formData.get('supply_id') as string) || null
                    : null,
                  amount: formData.get('amount')
                    ? parseFloat(formData.get('amount') as string)
                    : 0,
                  transaction_date:
                    (formData.get('transaction_date') as string) ||
                    new Date().toISOString(),
                };
                try {
                  if (editingTransaction) {
                    await fetch(
                      `${API_URL}/transactions/${editingTransaction.transaction_id}`,
                      {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                      },
                    );
                  } else {
                    await fetch(`${API_URL}/transactions`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });
                  }
                  loadTransactions();
                  setShowTransactionForm(false);
                  setEditingTransaction(null);
                  setTransactionType(null);
                } catch (error) {
                  alert('Помилка');
                }
              }}
              style={{
                marginBottom: '20px',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <h3>{editingTransaction ? 'Редагувати' : 'Додати транзакцію'}</h3>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ marginRight: '15px' }}>
                  <input
                    type="radio"
                    name="transaction_type"
                    value="order"
                    checked={
                      editingTransaction
                        ? editingTransaction.order_id !== null
                        : transactionType === 'order'
                    }
                    onChange={() => {
                      if (!editingTransaction) setTransactionType('order');
                    }}
                    style={{ marginRight: '5px' }}
                  />
                  Замовлення
                </label>
                <label>
                  <input
                    type="radio"
                    name="transaction_type"
                    value="supply"
                    checked={
                      editingTransaction
                        ? editingTransaction.supply_id !== null
                        : transactionType === 'supply'
                    }
                    onChange={() => {
                      if (!editingTransaction) setTransactionType('supply');
                    }}
                    style={{ marginRight: '5px' }}
                  />
                  Поставка
                </label>
              </div>
              {(editingTransaction
                ? editingTransaction.order_id !== null
                : transactionType === 'order') && (
                <div style={{ marginBottom: '10px' }}>
                  <label>Замовлення ID: </label>
                  <input
                    type="number"
                    name="order_id"
                    defaultValue={editingTransaction?.order_id || ''}
                    style={{ width: '300px', padding: '5px' }}
                    required={
                      !editingTransaction && transactionType === 'order'
                    }
                  />
                </div>
              )}
              {(editingTransaction
                ? editingTransaction.supply_id !== null
                : transactionType === 'supply') && (
                <div style={{ marginBottom: '10px' }}>
                  <label>Поставка ID: </label>
                  <input
                    type="number"
                    name="supply_id"
                    defaultValue={editingTransaction?.supply_id || ''}
                    style={{ width: '300px', padding: '5px' }}
                    required={
                      !editingTransaction && transactionType === 'supply'
                    }
                  />
                </div>
              )}
              <div style={{ marginBottom: '10px' }}>
                <label>
                  Сума (залиште порожнім для автоматичного розрахунку):{' '}
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  defaultValue={editingTransaction?.amount || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Дата: </label>
                <input
                  type="datetime-local"
                  name="transaction_date"
                  defaultValue={
                    editingTransaction?.transaction_date
                      ? editingTransaction.transaction_date.slice(0, 16)
                      : ''
                  }
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {editingTransaction ? 'Оновити' : 'Додати'}
              </button>
            </form>
          )}
          <table
            border={1}
            cellPadding={10}
            style={{ width: '100%', borderCollapse: 'collapse' }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th>ID</th>
                <th>Тип</th>
                <th>Деталі</th>
                <th>Сума</th>
                <th>Дата</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.transaction_id}>
                  <td>{t.transaction_id}</td>
                  <td>
                    {t.type === 'order'
                      ? 'Замовлення'
                      : t.type === 'supply'
                        ? 'Поставка'
                        : 'Ручна'}
                  </td>
                  <td>
                    <div>
                      {t.label ||
                        (t.order_id
                          ? `Замовлення #${t.order_id}`
                          : t.supply_id
                            ? `Поставка #${t.supply_id}`
                            : '-')}
                    </div>
                    {t.client_name && <div>Клієнт: {t.client_name}</div>}
                  </td>
                  <td
                    style={{
                      color: Number(t.amount || 0) >= 0 ? 'green' : 'red',
                      fontWeight: 'bold',
                    }}
                  >
                    {(() => {
                      const amt = Number((t.amount as any) || 0);
                      const sign = amt >= 0 ? '+' : '-';
                      return `${sign}${Math.abs(amt).toFixed(2)} грн`;
                    })()}
                  </td>
                  <td>
                    {t.transaction_date
                      ? new Date(t.transaction_date).toLocaleString()
                      : '-'}
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setEditingTransaction(t);
                        setShowTransactionForm(true);
                      }}
                      style={{
                        marginRight: '5px',
                        padding: '5px 10px',
                        backgroundColor: '#FF9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Редагувати
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(
                          '/transactions',
                          t.transaction_id,
                          loadTransactions,
                        )
                      }
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'recipes' && (
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Рецепти</h2>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button
                onClick={() => {
                  setShowRecipeForm(!showRecipeForm);
                  setEditingRecipe(null);
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {showRecipeForm ? 'Скасувати' : '+ Додати'}
              </button>
            </div>
          </div>
          {showRecipeForm && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  dish_id: parseInt(formData.get('dish_id') as string),
                  product_id: parseInt(formData.get('product_id') as string),
                  quantity_grams: parseInt(
                    formData.get('quantity_grams') as string,
                  ),
                };
                try {
                  if (editingRecipe) {
                    await fetch(
                      `${API_URL}/recipes/${editingRecipe.dish_id}/${editingRecipe.product_id}`,
                      {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          quantity_grams: data.quantity_grams,
                        }),
                      },
                    );
                  } else {
                    await fetch(`${API_URL}/recipes`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });
                  }
                  loadRecipes();
                  setShowRecipeForm(false);
                  setEditingRecipe(null);
                } catch (error) {
                  alert('Помилка');
                }
              }}
              style={{
                marginBottom: '20px',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <h3>{editingRecipe ? 'Редагувати' : 'Додати рецепт'}</h3>
              <div style={{ marginBottom: '10px' }}>
                <label>Страва: </label>
                <select
                  name="dish_id"
                  defaultValue={editingRecipe?.dish_id || ''}
                  required
                  disabled={!!editingRecipe}
                  style={{ width: '300px', padding: '5px' }}
                >
                  <option value="">Виберіть</option>
                  {dishes.map((d) => (
                    <option key={d.dish_id} value={d.dish_id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Продукт: </label>
                <select
                  name="product_id"
                  defaultValue={editingRecipe?.product_id || ''}
                  required
                  disabled={!!editingRecipe}
                  style={{ width: '300px', padding: '5px' }}
                >
                  <option value="">Виберіть</option>
                  {products.map((p) => (
                    <option key={p.product_id} value={p.product_id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Кількість (г): </label>
                <input
                  type="number"
                  name="quantity_grams"
                  defaultValue={editingRecipe?.quantity_grams || ''}
                  required
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {editingRecipe ? 'Оновити' : 'Додати'}
              </button>
            </form>
          )}
          <table
            border={1}
            cellPadding={10}
            style={{ width: '100%', borderCollapse: 'collapse' }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th>Страва</th>
                <th>Продукт</th>
                <th>Кількість (г)</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((r) => (
                <tr key={`${r.dish_id}-${r.product_id}`}>
                  <td>{r.dish_name}</td>
                  <td>{r.product_name}</td>
                  <td>{r.quantity_grams}</td>
                  <td>
                    <button
                      onClick={() => {
                        setEditingRecipe(r);
                        setShowRecipeForm(true);
                      }}
                      style={{
                        marginRight: '5px',
                        padding: '5px 10px',
                        backgroundColor: '#FF9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Редагувати
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm('Видалити?')) return;
                        try {
                          await fetch(
                            `${API_URL}/recipes/${r.dish_id}/${r.product_id}`,
                            { method: 'DELETE' },
                          );
                          loadRecipes();
                        } catch (error) {
                          alert('Помилка');
                        }
                      }}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {[
        'categories',
        'suppliers',
        'dishTypes',
        'positions',
        'clients',
        'statuses',
      ].includes(activeTab) && (
        <div>
          <h2>
            {activeTab === 'categories'
              ? 'Категорії'
              : activeTab === 'suppliers'
                ? 'Постачальники'
                : activeTab === 'dishTypes'
                  ? 'Типи страв'
                  : activeTab === 'positions'
                    ? 'Посади'
                    : activeTab === 'clients'
                      ? 'Клієнти'
                      : 'Статуси'}
          </h2>
          <button
            onClick={() => {
              if (activeTab === 'categories')
                setShowCategoryForm(!showCategoryForm);
              if (activeTab === 'suppliers')
                setShowSupplierForm(!showSupplierForm);
              if (activeTab === 'dishTypes')
                setShowDishTypeForm(!showDishTypeForm);
              if (activeTab === 'positions')
                setShowPositionForm(!showPositionForm);
              if (activeTab === 'clients') setShowClientForm(!showClientForm);
              if (activeTab === 'statuses') setShowStatusForm(!showStatusForm);
            }}
            style={{
              marginBottom: '20px',
              padding: '10px 20px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            + Додати
          </button>

          {activeTab === 'categories' && showCategoryForm && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  name_product_category: formData.get(
                    'name_product_category',
                  ) as string,
                };
                try {
                  if (editingCategory) {
                    await fetch(
                      `${API_URL}/categories/${editingCategory.product_category_id}`,
                      {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                      },
                    );
                  } else {
                    await fetch(`${API_URL}/categories`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });
                  }
                  loadCategories();
                  setShowCategoryForm(false);
                  setEditingCategory(null);
                } catch (error) {
                  alert('Помилка');
                }
              }}
              style={{
                marginBottom: '20px',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <h3>{editingCategory ? 'Редагувати' : 'Додати категорію'}</h3>
              <div style={{ marginBottom: '10px' }}>
                <label>Назва: </label>
                <input
                  type="text"
                  name="name_product_category"
                  defaultValue={editingCategory?.name_product_category || ''}
                  required
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {editingCategory ? 'Оновити' : 'Додати'}
              </button>
            </form>
          )}

          {activeTab === 'suppliers' && showSupplierForm && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  full_name: formData.get('full_name') as string,
                  phone: (formData.get('phone') as string) || null,
                  city: (formData.get('city') as string) || null,
                  supplier_email:
                    (formData.get('supplier_email') as string) || null,
                  supplier_address:
                    (formData.get('supplier_address') as string) || null,
                };
                try {
                  if (editingSupplier) {
                    await fetch(
                      `${API_URL}/suppliers/${editingSupplier.supplier_id}`,
                      {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                      },
                    );
                  } else {
                    await fetch(`${API_URL}/suppliers`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });
                  }
                  loadSuppliers();
                  setShowSupplierForm(false);
                  setEditingSupplier(null);
                } catch (error) {
                  alert('Помилка');
                }
              }}
              style={{
                marginBottom: '20px',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <h3>{editingSupplier ? 'Редагувати' : 'Додати постачальника'}</h3>
              <div style={{ marginBottom: '10px' }}>
                <label>Назва: </label>
                <input
                  type="text"
                  name="full_name"
                  defaultValue={editingSupplier?.full_name || ''}
                  required
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Телефон: </label>
                <input
                  type="text"
                  name="phone"
                  defaultValue={editingSupplier?.phone || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Місто: </label>
                <input
                  type="text"
                  name="city"
                  defaultValue={editingSupplier?.city || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Email: </label>
                <input
                  type="email"
                  name="supplier_email"
                  defaultValue={editingSupplier?.supplier_email || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Адреса: </label>
                <input
                  type="text"
                  name="supplier_address"
                  defaultValue={editingSupplier?.supplier_address || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {editingSupplier ? 'Оновити' : 'Додати'}
              </button>
            </form>
          )}

          {activeTab === 'dishTypes' && showDishTypeForm && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  dish_type_name: formData.get('dish_type_name') as string,
                  description: (formData.get('description') as string) || null,
                };
                try {
                  if (editingDishType) {
                    await fetch(
                      `${API_URL}/dishTypes/${editingDishType.dish_type_id}`,
                      {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                      },
                    );
                  } else {
                    await fetch(`${API_URL}/dishTypes`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });
                  }
                  loadDishTypes();
                  setShowDishTypeForm(false);
                  setEditingDishType(null);
                } catch (error) {
                  alert('Помилка');
                }
              }}
              style={{
                marginBottom: '20px',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <h3>{editingDishType ? 'Редагувати' : 'Додати тип страви'}</h3>
              <div style={{ marginBottom: '10px' }}>
                <label>Назва: </label>
                <input
                  type="text"
                  name="dish_type_name"
                  defaultValue={editingDishType?.dish_type_name || ''}
                  required
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Опис: </label>
                <textarea
                  name="description"
                  defaultValue={editingDishType?.description || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {editingDishType ? 'Оновити' : 'Додати'}
              </button>
            </form>
          )}

          {activeTab === 'positions' && showPositionForm && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  position_name: formData.get('position_name') as string,
                  salary: parseFloat(formData.get('salary') as string) || null,
                  duties_description:
                    (formData.get('duties_description') as string) || null,
                  work_schedule:
                    (formData.get('work_schedule') as string) || null,
                  responsibility_level:
                    (formData.get('responsibility_level') as string) || null,
                };
                try {
                  if (editingPosition) {
                    await fetch(
                      `${API_URL}/positions/${editingPosition.position_id}`,
                      {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                      },
                    );
                  } else {
                    await fetch(`${API_URL}/positions`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });
                  }
                  loadPositions();
                  setShowPositionForm(false);
                  setEditingPosition(null);
                } catch (error) {
                  alert('Помилка');
                }
              }}
              style={{
                marginBottom: '20px',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <h3>{editingPosition ? 'Редагувати' : 'Додати посаду'}</h3>
              <div style={{ marginBottom: '10px' }}>
                <label>Назва: </label>
                <input
                  type="text"
                  name="position_name"
                  defaultValue={editingPosition?.position_name || ''}
                  required
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Зарплата: </label>
                <input
                  type="number"
                  step="0.01"
                  name="salary"
                  defaultValue={editingPosition?.salary || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Обов'язки: </label>
                <textarea
                  name="duties_description"
                  defaultValue={editingPosition?.duties_description || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Графік: </label>
                <input
                  type="text"
                  name="work_schedule"
                  defaultValue={editingPosition?.work_schedule || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Рівень відповідальності: </label>
                <input
                  type="text"
                  name="responsibility_level"
                  defaultValue={editingPosition?.responsibility_level || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {editingPosition ? 'Оновити' : 'Додати'}
              </button>
            </form>
          )}

          {activeTab === 'clients' && showClientForm && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  full_name: formData.get('full_name') as string,
                  phone: (formData.get('phone') as string) || null,
                  email: (formData.get('email') as string) || null,
                  registration_date:
                    (formData.get('registration_date') as string) ||
                    new Date().toISOString().split('T')[0],
                };
                try {
                  if (editingClient) {
                    await fetch(
                      `${API_URL}/clients/${editingClient.client_id}`,
                      {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                      },
                    );
                  } else {
                    await fetch(`${API_URL}/clients`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });
                  }
                  loadClients();
                  setShowClientForm(false);
                  setEditingClient(null);
                } catch (error) {
                  alert('Помилка');
                }
              }}
              style={{
                marginBottom: '20px',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <h3>{editingClient ? 'Редагувати' : 'Додати клієнта'}</h3>
              <div style={{ marginBottom: '10px' }}>
                <label>ПІБ: </label>
                <input
                  type="text"
                  name="full_name"
                  defaultValue={editingClient?.full_name || ''}
                  required
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Телефон: </label>
                <input
                  type="text"
                  name="phone"
                  defaultValue={editingClient?.phone || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Email: </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingClient?.email || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Дата реєстрації: </label>
                <input
                  type="date"
                  name="registration_date"
                  defaultValue={editingClient?.registration_date || ''}
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {editingClient ? 'Оновити' : 'Додати'}
              </button>
            </form>
          )}

          {activeTab === 'statuses' && showStatusForm && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  status_name: formData.get('status_name') as string,
                };
                try {
                  if (editingStatus) {
                    await fetch(
                      `${API_URL}/statuses/${editingStatus.status_id}`,
                      {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                      },
                    );
                  } else {
                    await fetch(`${API_URL}/statuses`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });
                  }
                  loadStatuses();
                  setShowStatusForm(false);
                  setEditingStatus(null);
                } catch (error) {
                  alert('Помилка');
                }
              }}
              style={{
                marginBottom: '20px',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <h3>{editingStatus ? 'Редагувати' : 'Додати статус'}</h3>
              <div style={{ marginBottom: '10px' }}>
                <label>Назва: </label>
                <input
                  type="text"
                  name="status_name"
                  defaultValue={editingStatus?.status_name || ''}
                  required
                  style={{ width: '300px', padding: '5px' }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {editingStatus ? 'Оновити' : 'Додати'}
              </button>
            </form>
          )}

          <table
            border={1}
            cellPadding={10}
            style={{ width: '100%', borderCollapse: 'collapse' }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                {activeTab === 'categories' && (
                  <>
                    <th>ID</th>
                    <th>Назва</th>
                    <th>Дії</th>
                  </>
                )}
                {activeTab === 'suppliers' && (
                  <>
                    <th>ID</th>
                    <th>Назва</th>
                    <th>Телефон</th>
                    <th>Місто</th>
                    <th>Email</th>
                    <th>Дії</th>
                  </>
                )}
                {activeTab === 'dishTypes' && (
                  <>
                    <th>ID</th>
                    <th>Назва</th>
                    <th>Опис</th>
                    <th>Дії</th>
                  </>
                )}
                {activeTab === 'positions' && (
                  <>
                    <th>ID</th>
                    <th>Назва</th>
                    <th>Зарплата</th>
                    <th>Графік</th>
                    <th>Дії</th>
                  </>
                )}
                {activeTab === 'clients' && (
                  <>
                    <th>ID</th>
                    <th>ПІБ</th>
                    <th>Телефон</th>
                    <th>Email</th>
                    <th>Дії</th>
                  </>
                )}
                {activeTab === 'statuses' && (
                  <>
                    <th>ID</th>
                    <th>Назва</th>
                    <th>Дії</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {activeTab === 'categories' &&
                categories.map((c) => (
                  <tr key={c.product_category_id}>
                    <td>{c.product_category_id}</td>
                    <td>
                      <b>{c.name_product_category}</b>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setEditingCategory(c);
                          setShowCategoryForm(true);
                        }}
                        style={{
                          marginRight: '5px',
                          padding: '5px 10px',
                          backgroundColor: '#FF9800',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Редагувати
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(
                            '/categories',
                            c.product_category_id,
                            loadCategories,
                          )
                        }
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Видалити
                      </button>
                    </td>
                  </tr>
                ))}
              {activeTab === 'suppliers' &&
                suppliers.map((s) => (
                  <tr key={s.supplier_id}>
                    <td>{s.supplier_id}</td>
                    <td>
                      <b>{s.full_name}</b>
                    </td>
                    <td>{s.phone || '-'}</td>
                    <td>{s.city || '-'}</td>
                    <td>{s.supplier_email || '-'}</td>
                    <td>
                      <button
                        onClick={() => {
                          setEditingSupplier(s);
                          setShowSupplierForm(true);
                        }}
                        style={{
                          marginRight: '5px',
                          padding: '5px 10px',
                          backgroundColor: '#FF9800',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Редагувати
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(
                            '/suppliers',
                            s.supplier_id,
                            loadSuppliers,
                          )
                        }
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Видалити
                      </button>
                    </td>
                  </tr>
                ))}
              {activeTab === 'dishTypes' &&
                dishTypes.map((dt) => (
                  <tr key={dt.dish_type_id}>
                    <td>{dt.dish_type_id}</td>
                    <td>
                      <b>{dt.dish_type_name}</b>
                    </td>
                    <td>{dt.description || '-'}</td>
                    <td>
                      <button
                        onClick={() => {
                          setEditingDishType(dt);
                          setShowDishTypeForm(true);
                        }}
                        style={{
                          marginRight: '5px',
                          padding: '5px 10px',
                          backgroundColor: '#FF9800',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Редагувати
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(
                            '/dishTypes',
                            dt.dish_type_id,
                            loadDishTypes,
                          )
                        }
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Видалити
                      </button>
                    </td>
                  </tr>
                ))}
              {activeTab === 'positions' &&
                positions.map((p) => (
                  <tr key={p.position_id}>
                    <td>{p.position_id}</td>
                    <td>
                      <b>{p.position_name}</b>
                    </td>
                    <td>{p.salary ? `${p.salary} грн` : '-'}</td>
                    <td>{p.work_schedule || '-'}</td>
                    <td>
                      <button
                        onClick={() => {
                          setEditingPosition(p);
                          setShowPositionForm(true);
                        }}
                        style={{
                          marginRight: '5px',
                          padding: '5px 10px',
                          backgroundColor: '#FF9800',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Редагувати
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(
                            '/positions',
                            p.position_id,
                            loadPositions,
                          )
                        }
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Видалити
                      </button>
                    </td>
                  </tr>
                ))}
              {activeTab === 'clients' &&
                clients.map((c) => (
                  <tr key={c.client_id}>
                    <td>{c.client_id}</td>
                    <td>
                      <b>{c.full_name}</b>
                    </td>
                    <td>{c.phone || '-'}</td>
                    <td>{c.email || '-'}</td>
                    <td>
                      <button
                        onClick={() => {
                          setEditingClient(c);
                          setShowClientForm(true);
                        }}
                        style={{
                          marginRight: '5px',
                          padding: '5px 10px',
                          backgroundColor: '#FF9800',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Редагувати
                      </button>
                      <button
                        onClick={() =>
                          handleDelete('/clients', c.client_id, loadClients)
                        }
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Видалити
                      </button>
                    </td>
                  </tr>
                ))}
              {activeTab === 'statuses' &&
                statuses.map((s) => (
                  <tr key={s.status_id}>
                    <td>{s.status_id}</td>
                    <td>
                      <b>{s.status_name}</b>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setEditingStatus(s);
                          setShowStatusForm(true);
                        }}
                        style={{
                          marginRight: '5px',
                          padding: '5px 10px',
                          backgroundColor: '#FF9800',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Редагувати
                      </button>
                      <button
                        onClick={() =>
                          handleDelete('/statuses', s.status_id, loadStatuses)
                        }
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Видалити
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'reports' && (
        <div>
          <h2>Звіти</h2>
          <div
            style={{
              marginBottom: '20px',
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            {/* <input
              type="date"
              placeholder="Дата початку"
              value={reportStartDate}
              onChange={(e) => setReportStartDate(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
              }}
            /> */}
            {/* <input
              type="date"
              placeholder="Дата кінця"
              value={reportEndDate}
              onChange={(e) => setReportEndDate(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
              }}
            /> */}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '30px',
            }}
          >
            <div
              style={{
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
              }}
            >
              <h3>Звіт про продажі</h3>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  marginBottom: 12,
                  alignItems: 'center',
                }}
              >
                <button
                  onClick={loadSalesReport}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Оновити
                </button>
              </div>

              {/* Receipt-like card */}
              <div style={{ maxWidth: 420, marginTop: 8 }}>
                {salesReport.length > 0 ? (
                  <div
                    style={{
                      padding: 18,
                      border: '1px solid #ddd',
                      borderRadius: 6,
                      background: '#fff',
                    }}
                  >
                    <h2 style={{ margin: '0 0 10px 0' }}>Звіт про продажі</h2>

                    <div
                      style={{
                        textAlign: 'center',
                        marginBottom: 12,
                        color: '#333',
                      }}
                    >
                      <div style={{ fontSize: 12 }}>
                        Період: {reportStartDate || '-'} —{' '}
                        {reportEndDate || '-'}
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 14,
                          fontWeight: 'bold',
                        }}
                      >
                        {salesReport.length} замовлень
                      </div>
                    </div>

                    <hr
                      style={{
                        border: 'none',
                        borderTop: '1px solid #e0e0e0',
                        margin: '8px 0',
                      }}
                    />

                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                      {salesReport.slice(0, 20).map((r: any) => (
                        <div
                          key={r.order_id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '6px 0',
                            alignItems: 'center',
                          }}
                        >
                          <div
                            style={{ fontSize: 14 }}
                          >{`Замовлення #${r.order_id}`}</div>
                          <div style={{ fontSize: 14, fontWeight: 'bold' }}>
                            {parseFloat(r.total_amount || 0).toFixed(2)} грн
                          </div>
                        </div>
                      ))}
                    </div>

                    <hr
                      style={{
                        border: 'none',
                        borderTop: '1px solid #e0e0e0',
                        margin: '8px 0',
                      }}
                    />

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontWeight: 'bold',
                        fontSize: 16,
                      }}
                    >
                      <div>Загальна сума:</div>
                      <div>
                        {salesReport
                          .reduce(
                            (s: number, r: any) =>
                              s + parseFloat(r.total_amount || 0),
                            0,
                          )
                          .toFixed(2)}{' '}
                        грн
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#666' }}>
                    Немає даних для обраного періоду.
                  </p>
                )}
              </div>
            </div>

            <div
              style={{
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
              }}
            >
              <h3>Звіт по клієнту</h3>
              <select
                value={selectedClientId || ''}
                onChange={(e) =>
                  setSelectedClientId(parseInt(e.target.value) || null)
                }
                style={{ marginBottom: '10px', padding: '8px', width: '100%' }}
              >
                <option value="">Виберіть клієнта</option>
                {clients.map((c) => (
                  <option key={c.client_id} value={c.client_id}>
                    {c.full_name}
                  </option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: 8, marginBottom: 15 }}>
                <button
                  onClick={() =>
                    selectedClientId && loadClientReport(selectedClientId)
                  }
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Оновити
                </button>
              </div>

              {/* Receipt-like client card */}
              <div style={{ maxWidth: 420, marginTop: 8 }}>
                {clientReport ? (
                  <div
                    style={{
                      padding: 18,
                      border: '1px solid #ddd',
                      borderRadius: 6,
                      background: '#fff',
                    }}
                  >
                    <h2 style={{ margin: '0 0 8px 0' }}>Звіт по клієнту</h2>

                    <div style={{ textAlign: 'center', marginBottom: 12 }}>
                      <div style={{ fontSize: 14, fontWeight: 'bold' }}>
                        {clientReport.client_name}
                      </div>
                      <div
                        style={{ fontSize: 12, color: '#666', marginTop: 6 }}
                      >
                        {clientReport.phone || ''}{' '}
                        {clientReport.email ? ` • ${clientReport.email}` : ''}
                      </div>
                    </div>

                    <hr
                      style={{
                        border: 'none',
                        borderTop: '1px solid #e0e0e0',
                        margin: '8px 0',
                      }}
                    />

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '6px 0',
                      }}
                    >
                      <div>Замовлень</div>
                      <div style={{ fontWeight: 'bold' }}>
                        {clientReport.total_orders || 0}
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '6px 0',
                      }}
                    >
                      <div>Витрачено</div>
                      <div style={{ fontWeight: 'bold' }}>
                        {parseFloat(clientReport.total_spent || 0).toFixed(2)}{' '}
                        грн
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '6px 0',
                      }}
                    >
                      <div>Середній чек</div>
                      <div style={{ fontWeight: 'bold' }}>
                        {parseFloat(clientReport.avg_order_value || 0).toFixed(
                          2,
                        )}{' '}
                        грн
                      </div>
                    </div>

                    <hr
                      style={{
                        border: 'none',
                        borderTop: '1px solid #e0e0e0',
                        margin: '8px 0',
                      }}
                    />

                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 'bold',
                          marginBottom: 8,
                        }}
                      >
                        Останні замовлення
                      </div>
                      {(() => {
                        const clientOrders = selectedClientId
                          ? orders
                              .filter((o) => o.client_id === selectedClientId)
                              .slice(0, 10)
                          : [];
                        return clientOrders.length > 0 ? (
                          <div>
                            {clientOrders.map((o: any) => (
                              <div
                                key={o.order_id}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  padding: '6px 0',
                                  borderBottom: '1px dashed #eee',
                                }}
                              >
                                <div
                                  style={{ fontSize: 13 }}
                                >{`#${o.order_id} • ${o.order_date ? new Date(o.order_date).toLocaleDateString() : '-'}`}</div>
                                <div style={{ fontWeight: 'bold' }}>
                                  {parseFloat(o.total_amount || 0).toFixed(2)}{' '}
                                  грн
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: '#666' }}>
                            Клієнт ще не робив замовлень.
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div
              style={{
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
              }}
            >
              <h3>Звіт про поставки</h3>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button
                  onClick={loadSupplyReport}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Оновити
                </button>
                {typeof supplyLoading !== 'undefined' && supplyLoading && (
                  <div style={{ alignSelf: 'center', color: '#666' }}>
                    Завантаження...
                  </div>
                )}
              </div>

              <div style={{ marginTop: 8, maxWidth: 420 }}>
                {supplyReport.length > 0 ? (
                  <div
                    style={{
                      padding: 18,
                      border: '1px solid #ddd',
                      borderRadius: 6,
                      background: '#fff',
                    }}
                  >
                    <h2 style={{ margin: '0 0 10px 0' }}>Звіт про поставки</h2>

                    <div
                      style={{
                        textAlign: 'center',
                        marginBottom: 12,
                        color: '#333',
                      }}
                    >
                      <div style={{ fontSize: 12 }}>
                        Період: {reportStartDate || '-'} —{' '}
                        {reportEndDate || '-'}
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 14,
                          fontWeight: 'bold',
                        }}
                      >
                        {supplyReport.length} записів
                      </div>
                    </div>

                    <hr
                      style={{
                        border: 'none',
                        borderTop: '1px solid #e0e0e0',
                        margin: '8px 0',
                      }}
                    />

                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                      {supplyReport.slice(0, 20).map((r: any) => (
                        <div
                          key={r.supply_id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '6px 0',
                            alignItems: 'center',
                          }}
                        >
                          <div
                            style={{ fontSize: 14 }}
                          >{`Поставка #${r.supply_id}`}</div>
                          <div style={{ fontSize: 14, fontWeight: 'bold' }}>
                            {parseFloat(r.total_cost || 0).toFixed(2)} грн
                          </div>
                        </div>
                      ))}
                    </div>

                    <hr
                      style={{
                        border: 'none',
                        borderTop: '1px solid #e0e0e0',
                        margin: '8px 0',
                      }}
                    />

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontWeight: 'bold',
                        fontSize: 16,
                      }}
                    >
                      <div>Загальна вартість:</div>
                      <div>
                        {supplyReport
                          .reduce(
                            (s: number, r: any) =>
                              s + parseFloat(r.total_cost || 0),
                            0,
                          )
                          .toFixed(2)}{' '}
                        грн
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#666' }}>
                    Немає даних для обраного періоду.
                  </p>
                )}
              </div>
            </div>

            <div
              style={{
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
              }}
            >
              <h3>Фінансовий звіт</h3>
              <button
                onClick={loadFinancialReport}
                style={{
                  marginBottom: '15px',
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Оновити
              </button>

              <div style={{ maxWidth: 420, marginTop: 8 }}>
                {financialReport ? (
                  <div
                    style={{
                      padding: 18,
                      border: '1px solid #ddd',
                      borderRadius: 6,
                      background: '#fff',
                    }}
                  >
                    <h2 style={{ margin: '0 0 6px 0' }}>Фінансовий звіт</h2>
                    <div style={{ textAlign: 'center', marginBottom: 12 }}>
                      <div style={{ fontSize: 12 }}>
                        Період: {reportStartDate || '-'} —{' '}
                        {reportEndDate || '-'}
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '6px 0',
                      }}
                    >
                      <div>Доходи</div>
                      <div style={{ fontWeight: 'bold' }}>
                        {financialReport.income} грн
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '6px 0',
                      }}
                    >
                      <div>Витрати</div>
                      <div style={{ fontWeight: 'bold' }}>
                        {financialReport.expenses} грн
                      </div>
                    </div>

                    <hr
                      style={{
                        border: 'none',
                        borderTop: '1px solid #e0e0e0',
                        margin: '8px 0',
                      }}
                    />

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 16,
                        fontWeight: 'bold',
                      }}
                    >
                      <div>Прибуток</div>
                      <div
                        style={{
                          color:
                            parseFloat(financialReport.profit) >= 0
                              ? 'green'
                              : 'red',
                        }}
                      >
                        {financialReport.profit} грн
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#666' }}>
                    Немає даних для обраного періоду.
                  </p>
                )}
              </div>
            </div>

            <div
              style={{
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
              }}
            >
              <h3>Чек замовлення</h3>
              <input
                type="number"
                placeholder="ID замовлення"
                value={selectedOrderId || ''}
                onChange={(e) =>
                  setSelectedOrderId(parseInt(e.target.value) || null)
                }
                style={{ marginBottom: '10px', padding: '8px', width: '100%' }}
              />
              <button
                onClick={() =>
                  selectedOrderId && loadOrderCheck(selectedOrderId)
                }
                style={{
                  marginBottom: '15px',
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Завантажити
              </button>
              {orderCheck && (
                <div
                  style={{
                    padding: '15px',
                    backgroundColor: '#fff',
                    border: '2px solid #000',
                    borderRadius: '4px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <h4>Чек №{orderCheck.order_id}</h4>
                  </div>
                  <p>
                    <strong>Дата:</strong>{' '}
                    {orderCheck.order_date
                      ? new Date(orderCheck.order_date).toLocaleString()
                      : '-'}
                  </p>
                  <p>
                    <strong>Клієнт:</strong> {orderCheck.client_name}
                  </p>
                  <p>
                    <strong>Адреса клієнта:</strong>{' '}
                    {orderCheck.delivery_address || '-'}
                  </p>
                  <p>
                    <strong>Адреса ресторану:</strong>{' '}
                    {orderCheck.restaurant_address ||
                      'Харків, вул. Наукова, буд.56'}
                  </p>
                  <hr />
                  {orderCheck.items.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '5px',
                      }}
                    >
                      <span>
                        {item.dish_name} x{item.quantity}
                      </span>
                      <span>{parseFloat(item.item_total).toFixed(2)} грн</span>
                    </div>
                  ))}
                  <hr />
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 'bold',
                    }}
                  >
                    <span>Всього:</span>
                    <span>{orderCheck.total} грн</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div>
          <h2>Статистика</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '20px',
            }}
          >
            <div
              style={{
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
              }}
            >
              <h3>Топ страви</h3>
              <button
                onClick={loadTopDishes}
                style={{
                  marginBottom: '15px',
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Завантажити
              </button>
              {topDishes.length > 0 && (
                <table
                  border={1}
                  cellPadding={8}
                  style={{ width: '100%', borderCollapse: 'collapse' }}
                >
                  <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                      <th>Страва</th>
                      <th>Замовлень</th>
                      <th>Продано</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topDishes.map((d: any) => (
                      <tr key={d.dish_id}>
                        <td>{d.name}</td>
                        <td>{d.orders_count || 0}</td>
                        <td>{d.total_quantity_sold || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div
              style={{
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
              }}
            >
              <h3>Продуктивність співробітників</h3>
              <button
                onClick={loadEmployeePerformance}
                style={{
                  marginBottom: '15px',
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Завантажити
              </button>
              {employeePerformance.length > 0 && (
                <table
                  border={1}
                  cellPadding={8}
                  style={{ width: '100%', borderCollapse: 'collapse' }}
                >
                  <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                      <th>Співробітник</th>
                      <th>Замовлень</th>
                      <th>Виручка</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeePerformance.map((e: any) => (
                      <tr key={e.employee_id}>
                        <td>{e.full_name}</td>
                        <td>{e.orders_handled || 0}</td>
                        <td>
                          {parseFloat(e.total_revenue || 0).toFixed(2)} грн
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div
              style={{
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
              }}
            >
              <h3>Лояльність клієнтів</h3>
              <button
                onClick={loadClientLoyalty}
                style={{
                  marginBottom: '15px',
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Завантажити
              </button>
              {clientLoyalty.length > 0 && (
                <table
                  border={1}
                  cellPadding={8}
                  style={{ width: '100%', borderCollapse: 'collapse' }}
                >
                  <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                      <th>Клієнт</th>
                      <th>Замовлень</th>
                      <th>Витрачено</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientLoyalty.map((c: any) => (
                      <tr key={c.client_id}>
                        <td>{c.full_name}</td>
                        <td>{c.total_orders || 0}</td>
                        <td>{parseFloat(c.total_spent || 0).toFixed(2)} грн</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div
              style={{
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
              }}
            >
              <h3>Використання продуктів</h3>
              <button
                onClick={loadProductUsage}
                style={{
                  marginBottom: '15px',
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Завантажити
              </button>
              {productUsage.length > 0 && (
                <table
                  border={1}
                  cellPadding={8}
                  style={{ width: '100%', borderCollapse: 'collapse' }}
                >
                  <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                      <th>Продукт</th>
                      <th>У стравах</th>
                      <th>Кількість</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productUsage.map((p: any) => (
                      <tr key={p.product_id}>
                        <td>{p.name}</td>
                        <td>{p.used_in_dishes || 0}</td>
                        <td>{p.total_quantity_in_recipes || 0} г</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div>
          <h2>Фотогалерея</h2>
          <GalleryController />
        </div>
      )}

      {activeTab === 'sql' && (
        <div>
          <h2>SQL Редактор</h2>
          <div style={{ marginBottom: '20px' }}>
            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              placeholder="Введіть SELECT запит..."
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '10px',
                fontFamily: 'monospace',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
            <div style={{ marginTop: '10px' }}>
              <button
                onClick={executeSqlQuery}
                disabled={isExecuting}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isExecuting ? 'not-allowed' : 'pointer',
                  marginRight: '10px',
                }}
              >
                {isExecuting ? 'Виконується...' : 'Виконати запит'}
              </button>
              <button
                onClick={() => {
                  setSqlQuery('');
                  setQueryResult(null);
                  setQueryError(null);
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#757575',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Очистити
              </button>
            </div>
          </div>

          {queryError && (
            <div
              style={{
                padding: '15px',
                backgroundColor: '#ffebee',
                color: '#c62828',
                borderRadius: '4px',
                marginBottom: '20px',
              }}
            >
              <strong>Помилка:</strong> {queryError}
            </div>
          )}

          {queryResult && (
            <div>
              <h3>Результати запиту ({queryResult.length} рядків)</h3>
              <div style={{ overflowX: 'auto' }}>
                <table
                  border={1}
                  cellPadding={10}
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    backgroundColor: 'white',
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                      {queryResult.length > 0 &&
                        Object.keys(queryResult[0]).map((key) => (
                          <th key={key}>{key}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value: unknown, i) => (
                          <td key={i}>
                            {value !== null ? String(value) : 'NULL'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: '30px',
              padding: '15px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
            }}
          >
            <h4>Приклади запитів:</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '5px' }}>
                <code>SELECT * FROM Dishes LIMIT 10;</code>
              </li>
              <li style={{ marginBottom: '5px' }}>
                <code>
                  SELECT * FROM Products WHERE quantity_grams &lt; 20000;
                </code>
              </li>
              <li style={{ marginBottom: '5px' }}>
                <code>
                  SELECT d.name, COUNT(r.product_id) as ingredients FROM Dishes
                  d LEFT JOIN Recipes r ON d.dish_id = r.dish_id GROUP BY
                  d.dish_id;
                </code>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
