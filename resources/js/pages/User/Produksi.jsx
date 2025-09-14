import { Head, useForm } from '@inertiajs/react';
import UserLayout from '@/layouts/User/Layout';
import { useState } from 'react';
import DashboardView from './Produksi/DashboardView';
import CreateOrderView from './Produksi/CreateOrderView';
import OrderFormView from './Produksi/OrderFormView';
import ConfirmationView from './Produksi/ConfirmationView'; // Jika Anda ingin menambahkannya nanti

export default function Produksi({ auth, productions = {data: [], links: []}, designs = [], konveksis = [], products = [], totalSpent = 0, completedOrders = 0}) {
  const [currentStep, setCurrentStep] = useState('dashboard');
  const [selectedMotif, setSelectedMotif] = useState(null);
  
  const { data, setData, post, processing, errors } = useForm({
    design_id: '',
    product_id: products[0]?.id || '',
    convection_id: konveksis[0]?.id || '',
    quantity: 1,
    customer_name: auth.user.name,
    customer_email: auth.user.email,
    customer_phone: '',
    customer_company: '',
    customer_address: '',
    batik_type: 'Batik Printing',
    fabric_size: '210 cm x 110 cm (Standar)',
    deadline: '',
    special_notes: '',
  });

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    post(route('production.store'), {
        onSuccess: () => setCurrentStep('confirmation'), // Contoh pindah ke halaman konfirmasi
    });
  };

  const calculateEstimatedPrice = () => {
    if (!data.product_id || !data.quantity) return 0;
    
    // 1. Cari produk yang dipilih di dalam array 'products'
    const selectedProduct = products.find(p => p.id == data.product_id);

    console.log('Calculating price...');
        console.log('Selected Product:', selectedProduct);
        console.log('Quantity:', data.quantity);
        console.log('Batik Type:', data.batik_type);
    if (!selectedProduct) return 0;

    // 2. Tentukan pengganda harga berdasarkan jenis batik
    const typeMultiplier = {
        'Batik Tulis': 3.0,
        'Batik Cap': 2.0,
        'Batik Printing': 1.0,
    };

    const basePrice = selectedProduct.base_price;
    const multiplier = typeMultiplier[data.batik_type] || 1.0;

    // 3. Hitung harga total
    return data.quantity * basePrice * multiplier;
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'create':
        return <CreateOrderView 
                    designs={designs || []}
                    setCurrentStep={setCurrentStep} 
                    setData={setData}
                    setSelectedMotif={setSelectedMotif}
                />;
      case 'form':
        console.log('Rendering OrderFormView with data:', data);
        return <OrderFormView 
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    handleSubmitOrder={handleSubmitOrder}
                    setCurrentStep={setCurrentStep}
                    selectedMotif={selectedMotif}
                    konveksis={konveksis || []}
                    products={products || []}
                    calculateEstimatedPrice={calculateEstimatedPrice}
                />;
      case 'confirmation':
        return <ConfirmationView onFinish={() => setCurrentStep('dashboard')} />;
      default:
        return <DashboardView 
                    productions={productions} 
                    totalSpent={totalSpent}
                    completedOrders={completedOrders}
                    onCreateNew={() => setCurrentStep('create')} 
                />;
    }
  };

  return (
    <UserLayout title="Produksi Batik">
        <Head title="Produksi Saya" />
        {renderCurrentStep()}
    </UserLayout>
  );
}