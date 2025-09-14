import { Head, useForm } from '@inertiajs/react';
import UserLayout from '@/layouts/User/Layout';
import { useState } from 'react';

// Impor komponen-komponen view yang sudah dipisah
import CreateOrderView from './Produksi/CreateOrderView';
import OrderFormView from './Produksi/OrderFormView';
import ConfirmationView from './Produksi/ConfirmationView';

// Komponen induk untuk alur pembuatan pesanan
export default function CreateProduction({ auth, designs, konveksis, products, selectedConvection }) {
  const [currentStep, setCurrentStep] = useState('create'); // Mulai dari langkah 'pilih desain'
  const [selectedMotif, setSelectedMotif] = useState(null);
  
  const { data, setData, post, processing, errors } = useForm({
    design_id: '',
    product_id: products[0]?.id || '',
    convection_id: selectedConvection?.id || konveksis[0]?.id || '',
    quantity: 12,
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
        onSuccess: () => setCurrentStep('confirmation'),
    });
  };

  const calculateEstimatedPrice = () => {
    const selectedProduct = products.find(p => p.id == data.product_id);
    if (!selectedProduct) return 0;

    const typeMultiplier = {
        'Batik Tulis': 3.0, 'Batik Cap': 2.0, 'Batik Printing': 1.0
    };
    const multiplier = typeMultiplier[data.batik_type] || 1.0;
    return data.quantity * selectedProduct.base_price * multiplier;
  };

  // Logika untuk menampilkan view yang sesuai
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
                    selectedConvection={selectedConvection} // Teruskan prop ini ke form
                    calculateEstimatedPrice={calculateEstimatedPrice}
                />;
      case 'confirmation':
        // Arahkan kembali ke dashboard utama setelah selesai
        return <ConfirmationView onFinish={() => window.location.href = route('production.index')} />;
      default:
        return <div>Langkah tidak valid</div>;
    }
  };

  return (
    <UserLayout title="Buat Pesanan Produksi">
        <Head title="Buat Pesanan" />
        {renderCurrentStep()}
    </UserLayout>
  );
}