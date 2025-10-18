import { Head, useForm } from '@inertiajs/react';
import UserLayout from '@/layouts/User/Layout';
import { useState } from 'react';
import DashboardView from './Produksi/DashboardView';
import CreateOrderView from './Produksi/CreateOrderView';
import OrderFormView from './Produksi/OrderFormView';
import ConfirmationView from './Produksi/ConfirmationView'; // Jika Anda ingin menambahkannya nanti

export default function Produksi({ auth, productions, totalSpent, completedOrders, designs, konveksis, products }) {
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
    fabric_size: products[0]?.category === 'fabric' ? '5' : 'M',
    // ✅ Hapus deadline
    special_notes: '',
  });

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    post(route('production.store'), {
        onSuccess: () => setCurrentStep('confirmation'), // Contoh pindah ke halaman konfirmasi
    });
  };

  const calculateEstimatedPrice = () => {
    const selectedProduct = products.find(p => parseInt(p.id) === parseInt(data.product_id));
    if (!selectedProduct) return 0;

    const batikTypeMultiplier = {
      'Batik Tulis': 3.0,
      'Batik Cap': 2.0,
      'Batik Printing': 1.0,
    };

    // ✅ NEW: Size multiplier untuk pakaian
    const sizeMultiplier = {
      'S': 1.0,
      'M': 1.05,
      'L': 1.10,
      'XL': 1.15,
      'XXL': 1.20,
    };

    const typeMultiplier = batikTypeMultiplier[data.batik_type] || 1.0;
    let pricePerUnit = selectedProduct.base_price;

    if (selectedProduct.category === 'fabric') {
      // Kain: base_price × meter × batik multiplier
      const meterLength = parseFloat(data.fabric_size) || 5;
      pricePerUnit = selectedProduct.base_price * meterLength * typeMultiplier;
    } else {
      // Pakaian: base_price × batik multiplier × size multiplier
      const sizeMult = sizeMultiplier[data.fabric_size] || 1.0;
      pricePerUnit = selectedProduct.base_price * typeMultiplier * sizeMult;
    }

    return pricePerUnit * data.quantity;
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